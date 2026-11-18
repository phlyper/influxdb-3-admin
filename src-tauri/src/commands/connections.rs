use tauri::State;
use url::Url;
use uuid::Uuid;

use crate::{
    database::{credential_reference, ssh_password_reference, AppDatabase},
    models::{
        connection::{ConnectionProfile, ConnectionType, SaveConnectionInput, SshProfile},
        ssh::SshAuthMethod,
    },
    security,
};

#[tauri::command]
pub async fn list_connection_profiles(
    db: State<'_, AppDatabase>,
) -> Result<Vec<ConnectionProfile>, String> {
    db.list_profiles().await
}

#[tauri::command]
pub async fn save_connection_profile(
    input: SaveConnectionInput,
    db: State<'_, AppDatabase>,
) -> Result<ConnectionProfile, String> {
    validate_connection(&input)?;

    let id = input
        .id
        .clone()
        .unwrap_or_else(|| Uuid::new_v4().to_string());

    let token = input
        .token
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_string);

    let reference = credential_reference(&id);

    if let Some(token) = token.as_deref() {
        // Store the secret in the operating system credential store.
        // The application database only keeps a reference.
        security::set_secret(&reference, token).await?;
    }

    // SSH password authentication. The password is stored in the
    // credential store under its own reference; switching back to key
    // authentication (or to a direct connection) removes it.
    let password_reference = ssh_password_reference(&id);

    let password_auth = input.connection_type == ConnectionType::Ssh
        && input
            .ssh_profile
            .as_ref()
            .map(|ssh| ssh.auth_method == SshAuthMethod::Password)
            .unwrap_or(false);

    let ssh_password = input
        .ssh_password
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_string);

    let has_password = if password_auth {
        match ssh_password.as_deref() {
            Some(password) => {
                security::set_secret(&password_reference, password).await?;
                true
            }
            // Keep an existing password when only the metadata changes.
            None => db.has_ssh_password(&id).await?,
        }
    } else {
        false
    };

    if !has_password {
        security::delete_secret(&password_reference).await?;
    }

    db.save_profile(&input, &id, token.is_some(), has_password)
        .await
}

#[tauri::command]
pub async fn delete_connection_profile(
    id: String,
    db: State<'_, AppDatabase>,
) -> Result<(), String> {
    let reference = db.delete_profile(&id).await?;

    if let Some(reference) = reference {
        security::delete_secret(&reference).await?;
    }

    // Remove any SSH password stored for this profile.
    security::delete_secret(&ssh_password_reference(&id)).await?;

    Ok(())
}

#[tauri::command]
pub async fn get_connection_token(
    id: String,
    db: State<'_, AppDatabase>,
) -> Result<String, String> {
    let reference = db
        .credential_reference(&id)
        .await?
        .ok_or_else(|| "Connection profile not found".to_string())?;

    security::get_secret(&reference)
        .await?
        .ok_or_else(|| "No token is stored for this connection".to_string())
}

fn validate_connection(input: &SaveConnectionInput) -> Result<(), String> {
    let name = input.name.trim();

    if name.is_empty() {
        return Err("Connection name is required".into());
    }

    if name.chars().count() > 120 {
        return Err("Connection name is too long".into());
    }

    validate_url(&input.url)?;

    if input.connection_type == ConnectionType::Ssh {
        let ssh = input
            .ssh_profile
            .as_ref()
            .ok_or_else(|| "SSH configuration is required for SSH connections".to_string())?;

        validate_ssh_profile(ssh)?;
    }

    Ok(())
}

fn validate_url(value: &str) -> Result<(), String> {
    let trimmed = value.trim();

    if trimmed.is_empty() {
        return Err("InfluxDB URL is required".into());
    }

    let parsed = Url::parse(trimmed).map_err(|_| "Invalid InfluxDB URL".to_string())?;

    if parsed.scheme() != "http" && parsed.scheme() != "https" {
        return Err("InfluxDB URL must start with http:// or https://".into());
    }

    if parsed.host_str().is_none() {
        return Err("InfluxDB URL must include a host".into());
    }

    Ok(())
}

fn validate_ssh_profile(ssh: &SshProfile) -> Result<(), String> {
    if ssh.ssh_host.trim().is_empty() {
        return Err("SSH host is required".into());
    }

    if ssh.ssh_username.trim().is_empty() {
        return Err("SSH username is required".into());
    }

    if ssh.remote_host.trim().is_empty() {
        return Err("Remote InfluxDB host is required".into());
    }

    if ssh.ssh_port == 0 || ssh.remote_port == 0 || ssh.local_port == 0 {
        return Err("SSH and tunnel ports must be greater than zero".into());
    }

    Ok(())
}
