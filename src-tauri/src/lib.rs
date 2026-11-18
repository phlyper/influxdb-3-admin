mod commands;
mod database;
mod influxdb;
mod models;
mod security;
mod ssh;

use tauri::Manager;

use database::AppDatabase;
use ssh::manager::TunnelManager;

// ==========================================
// SSH ASKPASS HELPER
// ==========================================

// Environment variables used when the application binary re-launches
// itself as the OpenSSH askpass helper for password authentication.
pub const ASKPASS_MODE_ENV: &str = "INFLUXADMIN_ASKPASS";
pub const ASKPASS_SECRET_ENV: &str = "INFLUXADMIN_SSH_PASSWORD";

// Called from main() before Tauri starts. OpenSSH runs the askpass
// helper with the prompt as an argument and reads the password from
// stdout. Returns true when the process was an askpass invocation.
pub fn try_run_as_askpass() -> bool {
    if std::env::var(ASKPASS_MODE_ENV).ok().as_deref() != Some("1") {
        return false;
    }

    let secret = std::env::var(ASKPASS_SECRET_ENV).unwrap_or_default();

    use std::io::Write;

    let mut stdout = std::io::stdout();
    let _ = writeln!(stdout, "{secret}");
    let _ = stdout.flush();

    true
}

// ==========================================
// APPLICATION ENTRY POINT
// ==========================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // SSH Tunnel Manager
        .manage(TunnelManager::default())
        // Application metadata database
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir()?;
            let database_path = app_data_dir.join("influxadmin.db");

            let database = tauri::async_runtime::block_on(AppDatabase::init(database_path))
                .map_err(|error| -> Box<dyn std::error::Error> { error.into() })?;

            app.manage(database);

            Ok(())
        })
        // Register commands
        .invoke_handler(tauri::generate_handler![
            // InfluxDB
            commands::influxdb::test_connection,
            commands::influxdb::list_databases,
            commands::influxdb::create_database,
            commands::influxdb::delete_database,
            commands::influxdb::execute_sql,
            commands::influxdb::list_tables,
            commands::influxdb::get_table_columns,
            // Connections
            commands::connections::list_connection_profiles,
            commands::connections::save_connection_profile,
            commands::connections::delete_connection_profile,
            commands::connections::get_connection_token,
            // SSH
            commands::ssh::start_ssh_tunnel,
            commands::ssh::stop_ssh_tunnel,
            commands::ssh::ssh_tunnel_status,
            commands::ssh::ssh_active_tunnels,
            commands::ssh::list_ssh_tunnels,
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
