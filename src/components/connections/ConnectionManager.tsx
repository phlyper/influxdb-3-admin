
import { useState } from "react";
import {
  Server,
  ShieldCheck
} from "lucide-react";

import SshTunnelForm from "./SshTunnelForm";
import ConnectionForm from "./ConnectionForm";
import { connectionApi } from "../../services/tauri";
import type {
  ConnectionMode,
  ConnectionProfile,
  DirectConnectionDraft,
  ProfileSaveMeta,
  SshConnectionDraft
} from "../../types/connections";

interface Props {
  name: string;
  editing?: ConnectionProfile | null;
  onConnected: (
    profile: ConnectionProfile,
    token: string,
    url: string
  ) => void;
  onSaved: (
    profile: ConnectionProfile,
    meta: ProfileSaveMeta
  ) => void;
}

export default function ConnectionManager({
  name,
  editing = null,
  onConnected,
  onSaved
}: Props) {

  const [mode, setMode] = useState<ConnectionMode>(
    editing?.connection_type ?? "direct"
  );

  function connectionName() {
    const trimmed = name.trim();

    if (!trimmed) {
      throw new Error("Connection name is required");
    }

    return trimmed;
  }

  async function saveDirectConnection(draft: DirectConnectionDraft) {
    const profile = await connectionApi.save({
      id: editing?.id,
      name: connectionName(),
      url: draft.url,
      connection_type: "direct",
      token: draft.token
    });

    onConnected(profile, draft.token, draft.url);
  }

  // Persists a direct configuration without testing the connection.
  async function saveDirectConfiguration(draft: DirectConnectionDraft) {
    const token = draft.token.trim();

    const profile = await connectionApi.save({
      id: editing?.id,
      name: connectionName(),
      url: draft.url,
      connection_type: "direct",
      token: token || undefined
    });

    onSaved(profile, {
      tokenUpdated: Boolean(token),
      sshPasswordUpdated: false
    });
  }

  async function saveSshConnection(draft: SshConnectionDraft) {
    const profile = await connectionApi.save({
      id: draft.tunnel_id,
      name: connectionName(),
      url: draft.url,
      connection_type: "ssh",
      token: draft.token,
      ssh_profile: draft.ssh_profile,
      ssh_password: draft.ssh_password
    });

    onConnected(profile, draft.token, draft.url);
  }

  // Persists the SSH configuration without starting the tunnel
  // or verifying the InfluxDB token.
  async function saveSshConfiguration(draft: SshConnectionDraft) {
    const token = draft.token.trim();
    const sshPassword = draft.ssh_password?.trim();

    const profile = await connectionApi.save({
      id: draft.tunnel_id,
      name: connectionName(),
      url: draft.url,
      connection_type: "ssh",
      token: token || undefined,
      ssh_profile: draft.ssh_profile,
      ssh_password: sshPassword || undefined
    });

    onSaved(profile, {
      tokenUpdated: Boolean(token),
      sshPasswordUpdated: Boolean(sshPassword)
    });
  }

  return (
    <div className="connection-manager">

      <div className="connection-header">
        <h2>{editing ? "Edit Connection" : "New Connection"}</h2>
        <p>
          {editing
            ? "Update this saved profile. If its settings change, the active session is closed and must be reconnected."
            : "Connect to your InfluxDB 3 Core instance."}
        </p>
      </div>

      <div className="connection-tabs">

        <button
          className={mode === "direct" ? "active" : ""}
          onClick={() => setMode("direct")}
        >
          <Server size={18} />
          Direct Connection
        </button>

        <button
          className={mode === "ssh" ? "active" : ""}
          onClick={() => setMode("ssh")}
        >
          <ShieldCheck size={18} />
          SSH Tunnel
        </button>

      </div>

      <div className="connection-content">

        {mode === "direct" && (
          <ConnectionForm
            editing={Boolean(editing)}
            profile={editing}
            onConnected={saveDirectConnection}
            onSaved={saveDirectConfiguration}
          />
        )}

        {mode === "ssh" && (
          <SshTunnelForm
            editing={Boolean(editing)}
            profile={editing}
            onConnected={saveSshConnection}
            onSaved={saveSshConfiguration}
          />
        )}

      </div>

    </div>
  );
}
