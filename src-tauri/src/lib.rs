mod commands;
mod influxdb;
mod models;
mod ssh;

use serde_json::Value;
use tauri::Manager;

use influxdb::client::InfluxClient;
use ssh::manager::TunnelManager;

// ==========================================
// INFLUXDB COMMANDS
// ==========================================

#[tauri::command]
async fn test_connection(url: String, token: String) -> Result<String, String> {
    let client = InfluxClient::new(url, token);
    client.health().await
}

#[tauri::command]
async fn list_databases(url: String, token: String) -> Result<Value, String> {
    let client = InfluxClient::new(url, token);

    let result = client.databases().await?;

    serde_json::from_str(&result).map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_database(url: String, token: String, name: String) -> Result<String, String> {
    if name.trim().is_empty() {
        return Err("Database name is required".into());
    }

    let client = InfluxClient::new(url, token);
    client.create_database(name).await
}

#[tauri::command]
async fn delete_database(url: String, token: String, name: String) -> Result<String, String> {
    if name.trim().is_empty() {
        return Err("Database name is required".into());
    }

    let client = InfluxClient::new(url, token);
    client.delete_database(name).await
}

#[tauri::command]
async fn execute_sql(
    url: String,
    token: String,
    database: String,
    query: String,
) -> Result<String, String> {
    if database.trim().is_empty() {
        return Err("Database name is required".into());
    }

    if query.trim().is_empty() {
        return Err("SQL query is empty".into());
    }

    let client = InfluxClient::new(url, token);
    client.query_sql(database, query).await
}

// ==========================================
// APPLICATION ENTRY POINT
// ==========================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // SSH Tunnel Manager
        .manage(TunnelManager::default())
        // Register commands
        .invoke_handler(tauri::generate_handler![
            // InfluxDB
            test_connection,
            list_databases,
            create_database,
            delete_database,
            execute_sql,
            // SSH
            commands::ssh::start_ssh_tunnel,
            commands::ssh::stop_ssh_tunnel,
            commands::ssh::ssh_tunnel_status,
            commands::ssh::ssh_active_tunnels,
        ])
        .build(tauri::generate_context!())
        .expect("InfluxAdmin initialization failed")
        .run(|app_handle, event| {
            if let tauri::RunEvent::Exit = event {
                let manager = app_handle.state::<TunnelManager>();

                tauri::async_runtime::block_on(async {
                    manager.stop_all().await;
                });
            }
        });
}
