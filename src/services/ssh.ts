
import { invoke } from "@tauri-apps/api/core";

import type { SshAuthMethod } from "../types/connections";

export interface SshTunnelConfig {
  id: string;
  name: string;
  ssh_host: string;
  ssh_port: number;
  ssh_username: string;
  private_key_path?: string | null;
  auth_method: SshAuthMethod;
  password?: string;
  remote_host: string;
  remote_port: number;
  local_port: number;
}

export interface SshTunnelStatus {
  id: string;
  running: boolean;
  local_url: string;
}

export interface SshTunnelInfo {
  id: string;
  name: string;
  running: boolean;
  local_url: string;
  ssh_host: string;
  ssh_username: string;
  remote_host: string;
  remote_port: number;
  local_port: number;
}

export const sshApi = {
  start: (config: SshTunnelConfig) =>
    invoke<SshTunnelStatus>(
      "start_ssh_tunnel",
      { config }
    ),

  stop: (id: string) =>
    invoke<void>("stop_ssh_tunnel", { id }),

  status: (id: string) =>
    invoke<boolean>("ssh_tunnel_status", { id }),

  list: () =>
    invoke<SshTunnelInfo[]>("list_ssh_tunnels")
};
