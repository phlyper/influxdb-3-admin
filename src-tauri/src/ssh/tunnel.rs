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

#[cfg(test)]
mod tests {
    use super::*;

    fn config() -> SshTunnelConfig {
        SshTunnelConfig {
            id: "tunnel-id".into(),
            name: "Remote".into(),
            ssh_host: "example.test".into(),
            ssh_port: 22,
            ssh_username: "influxadmin".into(),
            private_key_path: None,
            auth_method: crate::models::ssh::SshAuthMethod::Key,
            password: None,
            remote_host: "127.0.0.1".into(),
            remote_port: 8181,
            local_port: 18181,
        }
    }

    #[test]
    fn builds_localhost_endpoint() {
        let endpoint = TunnelEndpoint::from_config(&config()).unwrap();

        assert_eq!(endpoint.local_address, "127.0.0.1:18181");
        assert_eq!(endpoint.ssh_destination, "influxadmin@example.test");
        assert_eq!(
            endpoint.forwarding_argument(),
            "127.0.0.1:18181:127.0.0.1:8181"
        );
        assert_eq!(endpoint.local_url(), "http://127.0.0.1:18181");
    }

    #[test]
    fn rejects_missing_host() {
        let mut config = config();
        config.ssh_host.clear();

        assert!(TunnelEndpoint::from_config(&config).is_err());
    }

    #[test]
    fn rejects_zero_port() {
        let mut config = config();
        config.local_port = 0;

        assert!(TunnelEndpoint::from_config(&config).is_err());
    }
}
