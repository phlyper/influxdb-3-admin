export type ConnectionMode = "direct" | "ssh";

export type SshAuthMethod = "key" | "password";

export interface SshProfile {
  ssh_host: string;
  ssh_port: number;
  ssh_username: string;
  private_key_path?: string | null;
  auth_method: SshAuthMethod;
  has_password?: boolean;
  remote_host: string;
  remote_port: number;
  local_port: number;
}

export interface ConnectionProfile {
  id: string;
  name: string;
  url: string;
  connection_type: ConnectionMode;
  ssh_profile: SshProfile | null;
  has_token: boolean;
  created_at: string;
  updated_at: string;
}

export interface SaveConnectionInput {
  id?: string;
  name: string;
  url: string;
  connection_type: ConnectionMode;
  token?: string;
  ssh_profile?: SshProfile;
  ssh_password?: string;
}

export interface DirectConnectionDraft {
  url: string;
  token: string;
}

export interface SshConnectionDraft extends DirectConnectionDraft {
  tunnel_id: string;
  ssh_profile: SshProfile;
  ssh_password?: string;
}

export interface ProfileSaveMeta {
  tokenUpdated: boolean;
  sshPasswordUpdated: boolean;
}
