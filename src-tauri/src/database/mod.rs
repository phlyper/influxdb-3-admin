use std::path::PathBuf;

use chrono::Utc;
use sqlx::{
    sqlite::{SqliteConnectOptions, SqlitePoolOptions, SqliteRow},
    Row, SqlitePool,
};

use crate::models::{
    connection::{ConnectionProfile, ConnectionType, SaveConnectionInput, SshProfile},
    ssh::SshAuthMethod,
};

const PROFILE_QUERY: &str = r#"
    SELECT
        c.id,
        c.name,
        c.url,
        c.connection_type,
        c.credential_reference,
        c.has_token,
        c.created_at,
        c.updated_at,
        s.ssh_host,
        s.ssh_port,
        s.ssh_username,
        s.private_key_path,
        s.auth_method,
        s.has_password,
        s.remote_host,
        s.remote_port,
        s.local_port
    FROM connections c
    LEFT JOIN ssh_profiles s ON s.connection_id = c.id
"#;

pub struct AppDatabase {
    pool: SqlitePool,
}

impl AppDatabase {
    pub async fn init(path: PathBuf) -> Result<Self, String> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)
                .map_err(|error| format!("Unable to create application data directory: {error}"))?;
        }

        let options = SqliteConnectOptions::new()
            .filename(&path)
            .create_if_missing(true)
            .foreign_keys(true);

        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect_with(options)
            .await
            .map_err(|error| format!("Unable to open application database: {error}"))?;

        sqlx::raw_sql(include_str!("../../migrations/0001_init.sql"))
            .execute(&pool)
            .await
            .map_err(|error| format!("Unable to initialize application database: {error}"))?;

        // Existing databases were created before SSH password support.
        // SQLite has no ADD COLUMN IF NOT EXISTS, so the columns are
        // added here only when missing.
        ensure_column(&pool, "ssh_profiles", "auth_method", "TEXT NOT NULL DEFAULT 'key'")
            .await?;
        ensure_column(&pool, "ssh_profiles", "has_password", "INTEGER NOT NULL DEFAULT 0")
            .await?;

        Ok(Self { pool })
    }

    pub async fn list_profiles(&self) -> Result<Vec<ConnectionProfile>, String> {
        let query = format!("{PROFILE_QUERY} ORDER BY c.name COLLATE NOCASE");

        let rows = sqlx::query(&query)
            .fetch_all(&self.pool)
            .await
            .map_err(database_error)?;

        rows.iter().map(row_to_profile).collect()
    }

    pub async fn get_profile(&self, id: &str) -> Result<ConnectionProfile, String> {
        let query = format!("{PROFILE_QUERY} WHERE c.id = ?");

        let row = sqlx::query(&query)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
            .map_err(database_error)?;

        row.as_ref()
            .map(row_to_profile)
            .transpose()?
            .ok_or_else(|| "Connection profile not found".to_string())
    }

    pub async fn save_profile(
        &self,
        input: &SaveConnectionInput,
        id: &str,
        token_provided: bool,
        has_password: bool,
    ) -> Result<ConnectionProfile, String> {
        if input.connection_type == ConnectionType::Ssh && input.ssh_profile.is_none() {
            return Err("SSH configuration is required for SSH connections".into());
        }

        let now = Utc::now().to_rfc3339();
        let credential_reference = credential_reference(id);

        let mut transaction = self.pool.begin().await.map_err(database_error)?;

        let existing_created_at: Option<String> =
            sqlx::query_scalar("SELECT created_at FROM connections WHERE id = ?")
                .bind(id)
                .fetch_optional(&mut *transaction)
                .await
                .map_err(database_error)?;

        let created_at = existing_created_at.unwrap_or_else(|| now.clone());

        sqlx::query(
            r#"
            INSERT INTO connections (
                id,
                name,
                url,
                connection_type,
                credential_reference,
                has_token,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                url = excluded.url,
                connection_type = excluded.connection_type,
                credential_reference = excluded.credential_reference,
                has_token = CASE
                    WHEN excluded.has_token = 1 THEN 1
                    ELSE connections.has_token
                END,
                updated_at = excluded.updated_at
            "#,
        )
        .bind(id)
        .bind(input.name.trim())
        .bind(input.url.trim())
        .bind(input.connection_type.as_str())
        .bind(&credential_reference)
        .bind(if token_provided { 1_i64 } else { 0_i64 })
        .bind(&created_at)
        .bind(&now)
        .execute(&mut *transaction)
        .await
        .map_err(database_error)?;

        sqlx::query("DELETE FROM ssh_profiles WHERE connection_id = ?")
            .bind(id)
            .execute(&mut *transaction)
            .await
            .map_err(database_error)?;

        if let Some(ssh) = input.ssh_profile.as_ref() {
            sqlx::query(
                r#"
                INSERT INTO ssh_profiles (
                    connection_id,
                    ssh_host,
                    ssh_port,
                    ssh_username,
                    private_key_path,
                    auth_method,
                    has_password,
                    remote_host,
                    remote_port,
                    local_port
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                "#,
            )
            .bind(id)
            .bind(ssh.ssh_host.trim())
            .bind(i64::from(ssh.ssh_port))
            .bind(ssh.ssh_username.trim())
            .bind(ssh.private_key_path.as_deref().map(str::trim).filter(|value| !value.is_empty()))
            .bind(ssh.auth_method.as_str())
            .bind(if has_password { 1_i64 } else { 0_i64 })
            .bind(ssh.remote_host.trim())
            .bind(i64::from(ssh.remote_port))
            .bind(i64::from(ssh.local_port))
            .execute(&mut *transaction)
            .await
            .map_err(database_error)?;
        }

        transaction.commit().await.map_err(database_error)?;

        self.get_profile(id).await
    }

    pub async fn delete_profile(&self, id: &str) -> Result<Option<String>, String> {
        let credential_reference: Option<String> =
            sqlx::query_scalar("SELECT credential_reference FROM connections WHERE id = ?")
                .bind(id)
                .fetch_optional(&self.pool)
                .await
                .map_err(database_error)?;

        sqlx::query("DELETE FROM connections WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(database_error)?;

        Ok(credential_reference)
    }

    pub async fn credential_reference(&self, id: &str) -> Result<Option<String>, String> {
        sqlx::query_scalar("SELECT credential_reference FROM connections WHERE id = ?")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
            .map_err(database_error)
    }

    pub async fn has_ssh_password(&self, id: &str) -> Result<bool, String> {
        let value: Option<i64> =
            sqlx::query_scalar("SELECT has_password FROM ssh_profiles WHERE connection_id = ?")
                .bind(id)
                .fetch_optional(&self.pool)
                .await
                .map_err(database_error)?;

        Ok(value.map(|value| value != 0).unwrap_or(false))
    }
}

pub fn credential_reference(id: &str) -> String {
    format!("connection:{id}")
}

pub fn ssh_password_reference(id: &str) -> String {
    format!("ssh-password:{id}")
}

async fn ensure_column(
    pool: &SqlitePool,
    table: &str,
    column: &str,
    definition: &str,
) -> Result<(), String> {
    let rows = sqlx::query(&format!("PRAGMA table_info({table})"))
        .fetch_all(pool)
        .await
        .map_err(database_error)?;

    let exists = rows.iter().any(|row| {
        row.try_get::<String, _>("name")
            .map(|name| name == column)
            .unwrap_or(false)
    });

    if !exists {
        sqlx::query(&format!(
            "ALTER TABLE {table} ADD COLUMN {column} {definition}"
        ))
        .execute(pool)
        .await
        .map_err(database_error)?;
    }

    Ok(())
}

fn database_error(error: sqlx::Error) -> String {
    format!("Application database error: {error}")
}

fn port_from_database(value: i64) -> Result<u16, String> {
    u16::try_from(value).map_err(|_| format!("Invalid port stored in database: {value}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_database_path() -> PathBuf {
        std::env::temp_dir().join(format!(
            "influxadmin-test-{}.db",
            uuid::Uuid::new_v4()
        ))
    }

    fn direct_input() -> SaveConnectionInput {
        SaveConnectionInput {
            id: None,
            name: "Local InfluxDB".into(),
            url: "http://127.0.0.1:8181".into(),
            connection_type: ConnectionType::Direct,
            token: None,
            ssh_profile: None,
            ssh_password: None,
        }
    }

    #[tokio::test]
    async fn creates_updates_and_deletes_connection_profiles() {
        let path = test_database_path();
        let database = AppDatabase::init(path.clone()).await.unwrap();

        let created = database
            .save_profile(&direct_input(), "test-connection", false, false)
            .await
            .unwrap();

        assert_eq!(created.name, "Local InfluxDB");
        assert_eq!(created.connection_type, ConnectionType::Direct);
        assert!(created.ssh_profile.is_none());
        assert!(!created.has_token);

        let mut ssh_input = direct_input();
        ssh_input.connection_type = ConnectionType::Ssh;
        ssh_input.ssh_profile = Some(SshProfile {
            ssh_host: "example.test".into(),
            ssh_port: 22,
            ssh_username: "influxadmin".into(),
            private_key_path: None,
            auth_method: SshAuthMethod::Password,
            has_password: false,
            remote_host: "127.0.0.1".into(),
            remote_port: 8181,
            local_port: 18181,
        });

        let updated = database
            .save_profile(&ssh_input, "test-connection", true, true)
            .await
            .unwrap();

        assert_eq!(updated.connection_type, ConnectionType::Ssh);
        assert!(updated.ssh_profile.is_some());
        assert!(updated.has_token);

        let updated_ssh = updated.ssh_profile.unwrap();
        assert_eq!(updated_ssh.auth_method, SshAuthMethod::Password);
        assert!(updated_ssh.has_password);
        assert!(database
            .has_ssh_password("test-connection")
            .await
            .unwrap());

        let reference = database
            .credential_reference("test-connection")
            .await
            .unwrap();

        assert_eq!(reference.as_deref(), Some("connection:test-connection"));

        let profiles = database.list_profiles().await.unwrap();
        assert_eq!(profiles.len(), 1);

        // Editing a profile can convert it back to a direct
        // connection without losing the stored token.
        let converted = database
            .save_profile(&direct_input(), "test-connection", false, false)
            .await
            .unwrap();

        assert_eq!(converted.connection_type, ConnectionType::Direct);
        assert!(converted.ssh_profile.is_none());
        assert!(converted.has_token);
        assert!(!database
            .has_ssh_password("test-connection")
            .await
            .unwrap());

        let deleted_reference = database
            .delete_profile("test-connection")
            .await
            .unwrap();

        assert_eq!(
            deleted_reference.as_deref(),
            Some("connection:test-connection")
        );
        assert!(database.list_profiles().await.unwrap().is_empty());

        drop(database);
        let _ = std::fs::remove_file(path);
    }
}

fn row_to_profile(row: &SqliteRow) -> Result<ConnectionProfile, String> {
    let connection_type: String = row.try_get("connection_type").map_err(database_error)?;
    let has_token: i64 = row.try_get("has_token").map_err(database_error)?;
    let ssh_host: Option<String> = row.try_get("ssh_host").map_err(database_error)?;

    let ssh_profile = match ssh_host {
        Some(ssh_host) => {
            let ssh_port: i64 = row.try_get("ssh_port").map_err(database_error)?;
            let remote_port: i64 = row.try_get("remote_port").map_err(database_error)?;
            let local_port: i64 = row.try_get("local_port").map_err(database_error)?;
            let auth_method: Option<String> = row.try_get("auth_method").map_err(database_error)?;
            let has_password: Option<i64> = row.try_get("has_password").map_err(database_error)?;

            Some(SshProfile {
                ssh_host,
                ssh_port: port_from_database(ssh_port)?,
                ssh_username: row.try_get("ssh_username").map_err(database_error)?,
                private_key_path: row.try_get("private_key_path").map_err(database_error)?,
                auth_method: SshAuthMethod::from_database(
                    auth_method.as_deref().unwrap_or("key"),
                )?,
                has_password: has_password.map(|value| value != 0).unwrap_or(false),
                remote_host: row.try_get("remote_host").map_err(database_error)?,
                remote_port: port_from_database(remote_port)?,
                local_port: port_from_database(local_port)?,
            })
        }
        None => None,
    };

    Ok(ConnectionProfile {
        id: row.try_get("id").map_err(database_error)?,
        name: row.try_get("name").map_err(database_error)?,
        url: row.try_get("url").map_err(database_error)?,
        connection_type: ConnectionType::from_database(&connection_type)?,
        ssh_profile,
        has_token: has_token != 0,
        created_at: row.try_get("created_at").map_err(database_error)?,
        updated_at: row.try_get("updated_at").map_err(database_error)?,
    })
}
