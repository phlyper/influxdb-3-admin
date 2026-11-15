use std::{
    collections::HashMap,
    path::Path,
    process::{Child, Command, Stdio},
    sync::Arc,
};

use tokio::{
    net::{TcpListener, TcpStream},
    sync::Mutex,
    time::{sleep, Duration},
};

use crate::{
    database::ssh_password_reference,
    models::ssh::{SshAuthMethod, SshTunnelConfig, SshTunnelInfo, SshTunnelStatus},
    security,
};

use super::tunnel::TunnelEndpoint;

struct TunnelProcess {
    child: Child,
    config: SshTunnelConfig,
    local_url: String,
}

#[derive(Clone)]
pub struct TunnelManager {
    processes: Arc<Mutex<HashMap<String, TunnelProcess>>>,
}

impl Default for TunnelManager {
    fn default() -> Self {
        Self {
            processes: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

impl TunnelManager {
    // ==========================================
    // START SSH TUNNEL
    // ==========================================

    pub async fn start(&self, mut config: SshTunnelConfig) -> Result<SshTunnelStatus, String> {
        // Validate configuration
        let endpoint = TunnelEndpoint::from_config(&config)?;

        // Resolve the SSH password. The typed password is transient;
        // otherwise read the secret stored in the credential store.
        let password = match config.auth_method {
            SshAuthMethod::Password => {
                let typed = config
                    .password
                    .take()
                    .map(|value| value.trim().to_string())
                    .filter(|value| !value.is_empty());

                match typed {
                    Some(password) => Some(password),
                    None => {
                        let stored =
                            security::get_secret(&ssh_password_reference(&config.id)).await?;

                        match stored.filter(|value| !value.is_empty()) {
                            Some(password) => Some(password),
                            None => {
                                return Err(
                                    "No SSH password is stored for this connection. Enter a password and save the configuration."
                                        .into(),
                                )
                            }
                        }
                    }
                }
            }
            SshAuthMethod::Key => None,
        };

        // Validate the private key path early to avoid a confusing
        // SSH startup timeout. Password authentication ignores it.
        if config.auth_method == SshAuthMethod::Key {
            if let Some(key_path) = config
                .private_key_path
                .as_deref()
                .map(str::trim)
                .filter(|value| !value.is_empty())
            {
                if !Path::new(key_path).is_file() {
                    return Err(format!("SSH private key file not found: {key_path}"));
                }
            }
        }

        // Check duplicate tunnel ID
        {
            let mut processes = self.processes.lock().await;

            if let Some(process) = processes.get_mut(&config.id) {
                match process.child.try_wait() {
                    Ok(None) => {
                        return Err("Tunnel already running".into());
                    }
                    _ => {
                        processes.remove(&config.id);
                    }
                }
            }
        }

        // Check local port availability. Binding and dropping the listener
        // detects ports already used by another process.
        match TcpListener::bind(&endpoint.local_address).await {
            Ok(listener) => drop(listener),
            Err(_) => return Err("Local port is already in use".into()),
        }

        // SSH destination
        let destination = endpoint.ssh_destination.clone();

        // Port forwarding
        let forwarding = endpoint.forwarding_argument();

        // Build SSH command
        let mut command = Command::new("ssh");

        command
            .arg("-N")
            .arg("-T")
            .arg("-p")
            .arg(config.ssh_port.to_string())
            // Security
            .arg("-o")
            .arg("ExitOnForwardFailure=yes")
            .arg("-o")
            .arg("StrictHostKeyChecking=yes")
            .arg("-o")
            .arg("ServerAliveInterval=30")
            .arg("-o")
            .arg("ServerAliveCountMax=3")
            .arg("-o")
            .arg("ConnectTimeout=10");

        match config.auth_method {
            // Batch mode keeps key authentication fully non-interactive.
            SshAuthMethod::Key => {
                command.arg("-o").arg("BatchMode=yes");
            }
            // BatchMode would disable password prompts entirely, so it
            // is omitted here. Only one prompt is allowed to avoid
            // locking an account after a wrong stored password.
            SshAuthMethod::Password => {
                command
                    .arg("-o")
                    .arg("NumberOfPasswordPrompts=1")
                    .arg("-o")
                    .arg("PreferredAuthentications=password,keyboard-interactive");
            }
        }

        // Local forwarding
        command.arg("-L").arg(forwarding);

        // Private key authentication
        if config.auth_method == SshAuthMethod::Key {
            if let Some(key_path) = &config.private_key_path {
                if !key_path.trim().is_empty() {
                    command
                        .arg("-i")
                        .arg(key_path)
                        .arg("-o")
                        .arg("IdentitiesOnly=yes");
                }
            }
        }

        // Password authentication.
        //
        // InfluxAdmin runs its own executable as the askpass helper.
        // OpenSSH invokes it with the prompt as the only argument and
        // reads the password from its standard output. The secret is
        // passed through the environment, never argv or the command
        // line, and the helper exits before Tauri starts.
        if let Some(password) = password.as_deref() {
            let askpass = std::env::current_exe().map_err(|error| {
                format!("Unable to locate the application executable: {error}")
            })?;

            command
                .env("SSH_ASKPASS", askpass)
                .env("SSH_ASKPASS_REQUIRE", "force")
                .env(crate::ASKPASS_MODE_ENV, "1")
                .env(crate::ASKPASS_SECRET_ENV, password);

            // Older OpenSSH releases only use SSH_ASKPASS when DISPLAY
            // is set. X11 forwarding is never requested.
            #[cfg(not(windows))]
            if std::env::var_os("DISPLAY").is_none() {
                command.env("DISPLAY", "influxadmin-askpass:0");
            }
        }

        // SSH destination
        command
            .arg(&destination)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null());

        // Start SSH process
        let child = command
            .spawn()
            .map_err(|e| format!("Unable to start SSH process: {}", e))?;

        let local_url = endpoint.local_url();

        // Store process and its metadata so the UI can list active tunnels.
        {
            let mut processes = self.processes.lock().await;

            processes.insert(
                config.id.clone(),
                TunnelProcess {
                    child,
                    config: config.clone(),
                    local_url: local_url.clone(),
                },
            );
        }

        // Wait for local port
        for _ in 0..30 {
            sleep(Duration::from_millis(300)).await;

            // Check process status
            {
                let mut processes = self.processes.lock().await;

                if let Some(process) = processes.get_mut(&config.id) {
                    match process.child.try_wait() {
                        Ok(Some(status)) => {
                            processes.remove(&config.id);

                            return Err(format!("SSH process terminated: {}", status));
                        }

                        Err(error) => {
                            processes.remove(&config.id);

                            return Err(format!("SSH process error: {}", error));
                        }

                        _ => {}
                    }
                }
            }

            // Check local TCP port
            if TcpStream::connect(&endpoint.local_address).await.is_ok() {
                return Ok(SshTunnelStatus {
                    id: config.id,
                    running: true,
                    local_url,
                });
            }
        }

        // Timeout: stop tunnel
        let _ = self.stop(&config.id).await;

        Err("SSH tunnel startup timeout".into())
    }

    // ==========================================
    // STOP SSH TUNNEL
    // ==========================================

    pub async fn stop(&self, id: &str) -> Result<(), String> {
        let process = {
            let mut processes = self.processes.lock().await;
            processes.remove(id)
        };

        if let Some(mut process) = process {
            match process.child.try_wait() {
                Ok(Some(_)) => return Ok(()),
                Ok(None) => {
                    process
                        .child
                        .kill()
                        .map_err(|e| format!("Unable to stop SSH tunnel: {}", e))?;

                    process.child.wait().map_err(|e| e.to_string())?;
                }
                Err(error) => {
                    return Err(format!("Unable to check SSH process: {}", error));
                }
            }
        }

        Ok(())
    }

    // ==========================================
    // STOP ALL SSH TUNNELS
    // ==========================================

    pub async fn stop_all(&self) {
        let processes = {
            let mut processes = self.processes.lock().await;

            processes.drain().collect::<Vec<_>>()
        };

        for (_, mut process) in processes {
            let _ = process.child.kill();
            let _ = process.child.wait();
        }
    }

    // ==========================================
    // CHECK TUNNEL STATUS
    // ==========================================

    pub async fn is_running(&self, id: &str) -> bool {
        let mut processes = self.processes.lock().await;

        if let Some(process) = processes.get_mut(id) {
            match process.child.try_wait() {
                Ok(None) => true,

                _ => {
                    processes.remove(id);
                    false
                }
            }
        } else {
            false
        }
    }

    // ==========================================
    // LIST ACTIVE TUNNELS
    // ==========================================

    pub async fn list(&self) -> Vec<SshTunnelInfo> {
        let mut processes = self.processes.lock().await;

        processes.retain(|_, process| matches!(process.child.try_wait(), Ok(None)));

        processes
            .iter()
            .map(|(id, process)| SshTunnelInfo {
                id: id.clone(),
                name: process.config.name.clone(),
                running: true,
                local_url: process.local_url.clone(),
                ssh_host: process.config.ssh_host.clone(),
                ssh_username: process.config.ssh_username.clone(),
                remote_host: process.config.remote_host.clone(),
                remote_port: process.config.remote_port,
                local_port: process.config.local_port,
            })
            .collect()
    }

    // ==========================================
    // COUNT ACTIVE TUNNELS
    // ==========================================

    pub async fn active_count(&self) -> usize {
        let mut processes = self.processes.lock().await;

        processes.retain(|_, process| matches!(process.child.try_wait(), Ok(None)));

        processes.len()
    }
}
