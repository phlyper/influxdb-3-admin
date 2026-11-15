use std::{
    collections::HashMap,
    process::{Child, Command, Stdio},
    sync::Arc,
};

use tokio::{
    net::TcpStream,
    sync::Mutex,
    time::{sleep, Duration},
};

use crate::models::ssh::{SshTunnelConfig, SshTunnelStatus};

use super::tunnel::TunnelEndpoint;

#[derive(Clone)]
pub struct TunnelManager {
    processes: Arc<Mutex<HashMap<String, Child>>>,
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

    pub async fn start(&self, config: SshTunnelConfig) -> Result<SshTunnelStatus, String> {
        // Validate configuration
        let endpoint = TunnelEndpoint::from_config(&config)?;

        // Check duplicate tunnel ID
        {
            let mut processes = self.processes.lock().await;

            if let Some(child) = processes.get_mut(&config.id) {
                match child.try_wait() {
                    Ok(None) => {
                        return Err("Tunnel already running".into());
                    }
                    _ => {
                        processes.remove(&config.id);
                    }
                }
            }
        }

        // Check local port availability
        if TcpStream::connect(&endpoint.local_address).await.is_ok() {
            return Err("Local port is already in use".into());
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
            .arg("BatchMode=yes")
            .arg("-o")
            .arg("ExitOnForwardFailure=yes")
            .arg("-o")
            .arg("StrictHostKeyChecking=yes")
            .arg("-o")
            .arg("ServerAliveInterval=30")
            .arg("-o")
            .arg("ServerAliveCountMax=3")
            // Local forwarding
            .arg("-L")
            .arg(forwarding);

        // Private key authentication
        if let Some(key_path) = &config.private_key_path {
            if !key_path.trim().is_empty() {
                command
                    .arg("-i")
                    .arg(key_path)
                    .arg("-o")
                    .arg("IdentitiesOnly=yes");
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

        // Store process
        {
            let mut processes = self.processes.lock().await;
            processes.insert(config.id.clone(), child);
        }

        // Wait for local port
        for _ in 0..30 {
            sleep(Duration::from_millis(300)).await;

            // Check process status
            {
                let mut processes = self.processes.lock().await;

                if let Some(child) = processes.get_mut(&config.id) {
                    match child.try_wait() {
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
                    local_url: endpoint.local_url(),
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
        let child = {
            let mut processes = self.processes.lock().await;
            processes.remove(id)
        };

        if let Some(mut child) = child {
            child
                .kill()
                .map_err(|e| format!("Unable to stop SSH tunnel: {}", e))?;

            child.wait().map_err(|e| e.to_string())?;
        }

        Ok(())
    }

    // ==========================================
    // STOP ALL SSH TUNNELS
    // ==========================================

    pub async fn stop_all(&self) {
        let children = {
            let mut processes = self.processes.lock().await;

            processes.drain().collect::<Vec<_>>()
        };

        for (_, mut child) in children {
            let _ = child.kill();
            let _ = child.wait();
        }
    }

    // ==========================================
    // CHECK TUNNEL STATUS
    // ==========================================

    pub async fn is_running(&self, id: &str) -> bool {
        let mut processes = self.processes.lock().await;

        if let Some(child) = processes.get_mut(id) {
            match child.try_wait() {
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

    pub async fn active_count(&self) -> usize {
        let mut processes = self.processes.lock().await;

        processes.retain(|_, child| matches!(child.try_wait(), Ok(None)));

        processes.len()
    }
}
