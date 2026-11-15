
import { invoke } from "@tauri-apps/api/core";

export interface SshTunnelConfig {
  id: string;
  name: string;
  ssh_host: string;
  ssh_port: number;
  ssh_username: string;
  private_key_path?: string;
  remote_host: string;
  remote_port: number;
  local_port: number;
}

export interface SshTunnelStatus {
  id: string;
  running: boolean;
  local_url: string;
}

export const sshApi = {
  start: (config: SshTunnelConfig) =>
    invoke<SshTunnelStatus>(
      "start_ssh_tunnel",
      { config }
    ),

  stop: (id: string) =>
    invoke<void>("stop_ssh_tunnel", { id })
};
