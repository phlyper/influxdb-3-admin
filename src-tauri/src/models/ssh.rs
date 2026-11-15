use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SshTunnelConfig {
    pub id: String,
    pub name: String,

    pub ssh_host: String,
    pub ssh_port: u16,
    pub ssh_username: String,

    // Chemin local de la clé privée.
    pub private_key_path: Option<String>,

    // Destination vue depuis le serveur SSH.
    pub remote_host: String,
    pub remote_port: u16,

    // Port local utilisé par InfluxAdmin.
    pub local_port: u16,
}

#[derive(Debug, Clone, Serialize)]
pub struct SshTunnelStatus {
    pub id: String,
    pub running: bool,
    pub local_url: String,
}
