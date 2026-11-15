use keyring::Entry;

const SERVICE: &str = "io.influxadmin.desktop";

fn error_message(error: keyring::Error) -> String {
    format!("Credential store error: {error}")
}

fn set_secret_blocking(reference: &str, secret: &str) -> Result<(), String> {
    let entry = Entry::new(SERVICE, reference).map_err(error_message)?;

    entry.set_password(secret).map_err(error_message)
}

fn get_secret_blocking(reference: &str) -> Result<Option<String>, String> {
    let entry = Entry::new(SERVICE, reference).map_err(error_message)?;

    match entry.get_password() {
        Ok(secret) => Ok(Some(secret)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(error) => Err(error_message(error)),
    }
}

fn delete_secret_blocking(reference: &str) -> Result<(), String> {
    let entry = Entry::new(SERVICE, reference).map_err(error_message)?;

    match entry.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(error) => Err(error_message(error)),
    }
}

pub async fn set_secret(reference: &str, secret: &str) -> Result<(), String> {
    let reference = reference.to_string();
    let secret = secret.to_string();

    tokio::task::spawn_blocking(move || set_secret_blocking(&reference, &secret))
        .await
        .map_err(|error| format!("Credential task failed: {error}"))?
}

pub async fn get_secret(reference: &str) -> Result<Option<String>, String> {
    let reference = reference.to_string();

    tokio::task::spawn_blocking(move || get_secret_blocking(&reference))
        .await
        .map_err(|error| format!("Credential task failed: {error}"))?
}

pub async fn delete_secret(reference: &str) -> Result<(), String> {
    let reference = reference.to_string();

    tokio::task::spawn_blocking(move || delete_secret_blocking(&reference))
        .await
        .map_err(|error| format!("Credential task failed: {error}"))?
}
