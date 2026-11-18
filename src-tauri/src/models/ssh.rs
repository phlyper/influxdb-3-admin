use serde::{Deserialize, Serialize};

// SSH authentication method.
// The password itself is never stored in this structure: it is read
// from the operating system credential store by the tunnel manager.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum SshAuthMethod {
    #[default]
    Key,
    Password,
}

impl SshAuthMethod {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Key => "key",
            Self::Password => "password",
        }
    }

    pub fn from_database(value: &str) -> Result<Self, String> {
        match value {
            "key" => Ok(Self::Key),
            "password" => Ok(Self::Password),
            other => Err(format!("Unknown SSH authentication method: {other}")),
        }
    }
}

#[derive(Clone, Serialize, Deserialize)]
pub struct SshTunnelConfig {
    pub id: String,
    pub name: String,

    pub ssh_host: String,
    pub ssh_port: u16,
    pub ssh_username: String,

    // Chemin local de la clé privée.
    pub private_key_path: Option<String>,

    // Méthode d'authentification SSH.
    #[serde(default)]
    pub auth_method: SshAuthMethod,

    // Mot de passe saisi dans le formulaire. Champ transitoire :
    // jamais stocké en base, jamais journalisé. Quand il est absent,
    // le gestionnaire lit le secret dans le coffre du système.
    #[serde(default)]
    pub password: Option<String>,

    // Destination vue depuis le serveur SSH.
    pub remote_host: String,
    pub remote_port: u16,

    // Port local utilisé par InfluxAdmin.
    pub local_port: u16,
}

// Redact the transient password so a debug print can never leak it.
impl std::fmt::Debug for SshTunnelConfig {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter
            .debug_struct("SshTunnelConfig")
            .field("id", &self.id)
            .field("name", &self.name)
            .field("ssh_host", &self.ssh_host)
            .field("ssh_port", &self.ssh_port)
            .field("ssh_username", &self.ssh_username)
            .field("private_key_path", &self.private_key_path)
            .field("auth_method", &self.auth_method)
            .field("remote_host", &self.remote_host)
            .field("remote_port", &self.remote_port)
            .field("local_port", &self.local_port)
            .field("password", &self.password.as_ref().map(|_| "[redacted]"))
            .finish()
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct SshTunnelStatus {
    pub id: String,
    pub running: bool,
    pub local_url: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct SshTunnelInfo {
    pub id: String,
    pub name: String,
    pub running: bool,
    pub local_url: String,
    pub ssh_host: String,
    pub ssh_username: String,
    pub remote_host: String,
    pub remote_port: u16,
    pub local_port: u16,
}
