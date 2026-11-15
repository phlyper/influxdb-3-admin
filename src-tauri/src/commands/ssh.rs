use tauri::State;

use crate::{
    models::ssh::{SshTunnelConfig, SshTunnelStatus},
    ssh::manager::TunnelManager,
};

#[tauri::command]
pub async fn start_ssh_tunnel(
    config: SshTunnelConfig,
    manager: State<'_, TunnelManager>,
) -> Result<SshTunnelStatus, String> {
    manager.start(config).await
}

#[tauri::command]
pub async fn stop_ssh_tunnel(id: String, manager: State<'_, TunnelManager>) -> Result<(), String> {
    manager.stop(&id).await
}

#[tauri::command]
pub async fn ssh_tunnel_status(
    id: String,
    manager: State<'_, TunnelManager>,
) -> Result<bool, String> {
    Ok(manager.is_running(&id).await)
}

#[tauri::command]
pub async fn ssh_active_tunnels(manager: State<'_, TunnelManager>) -> Result<usize, String> {
    Ok(manager.active_count().await)
}
