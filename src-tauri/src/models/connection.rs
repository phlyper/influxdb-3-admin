use serde::{Deserialize, Serialize};

use super::ssh::SshAuthMethod;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ConnectionType {
    Direct,
    Ssh,
}

impl ConnectionType {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Direct => "direct",
            Self::Ssh => "ssh",
        }
    }

    pub fn from_database(value: &str) -> Result<Self, String> {
        match value {
            "direct" => Ok(Self::Direct),
            "ssh" => Ok(Self::Ssh),
            other => Err(format!("Unknown connection type: {other}")),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SshProfile {
    pub ssh_host: String,
    pub ssh_port: u16,
    pub ssh_username: String,
    pub private_key_path: Option<String>,
    #[serde(default)]
    pub auth_method: SshAuthMethod,
    // Derived from the credential store on read. Ignored on write.
    #[serde(default)]
    pub has_password: bool,
    pub remote_host: String,
    pub remote_port: u16,
    pub local_port: u16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionProfile {
    pub id: String,
    pub name: String,
    pub url: String,
    pub connection_type: ConnectionType,
    pub ssh_profile: Option<SshProfile>,
    pub has_token: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SaveConnectionInput {
    pub id: Option<String>,
    pub name: String,
    pub url: String,
    pub connection_type: ConnectionType,
    pub token: Option<String>,
    pub ssh_profile: Option<SshProfile>,
    // Transient SSH password. Stored in the credential store, never
    // in the application database.
    #[serde(default)]
    pub ssh_password: Option<String>,
}
