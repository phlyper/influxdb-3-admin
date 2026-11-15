use crate::models::ssh::SshTunnelConfig;

#[derive(Debug, Clone)]
pub struct TunnelEndpoint {
    pub local_address: String,
    pub remote_address: String,
    pub ssh_destination: String,
}

impl TunnelEndpoint {
    pub fn from_config(config: &SshTunnelConfig) -> Result<Self, String> {
        if config.ssh_host.trim().is_empty() {
            return Err("SSH host is required".into());
        }

        if config.ssh_username.trim().is_empty() {
            return Err("SSH username is required".into());
        }

        if config.remote_host.trim().is_empty() {
            return Err("Remote host is required".into());
        }

        if config.ssh_port == 0 || config.local_port == 0 || config.remote_port == 0 {
            return Err("Invalid port number".into());
        }

        // Bind only to localhost to avoid exposing
        // the forwarded InfluxDB port to the network.
        let local_address = format!("127.0.0.1:{}", config.local_port);

        let remote_address = format!("{}:{}", config.remote_host, config.remote_port);

        let ssh_destination = format!("{}@{}", config.ssh_username, config.ssh_host);

        Ok(Self {
            local_address,
            remote_address,
            ssh_destination,
        })
    }

    pub fn forwarding_argument(&self) -> String {
        format!("{}:{}", self.local_address, self.remote_address)
    }

    pub fn local_url(&self) -> String {
        format!("http://{}", self.local_address)
    }
}
