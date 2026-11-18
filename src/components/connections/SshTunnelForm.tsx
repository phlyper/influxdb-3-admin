
import { useState } from "react";
import { sshApi, SshTunnelConfig } from "../../services/ssh";
import { connectionApi, influxApi } from "../../services/tauri";
import type {
  ConnectionProfile,
  SshAuthMethod,
  SshConnectionDraft
} from "../../types/connections";
import {
  Server,
  ShieldCheck,
  Power,
  KeyRound,
  Loader2,
  Save,
  CheckCircle
} from "lucide-react";

interface Props {
  editing?: boolean;
  profile?: ConnectionProfile | null;
  onConnected: (draft: SshConnectionDraft) => Promise<void>;
  onSaved: (draft: SshConnectionDraft) => Promise<void>;
}

function isValidPort(value: number) {
  return Number.isInteger(value) && value > 0 && value <= 65535;
}

export default function SshTunnelForm({
  editing = false,
  profile = null,
  onConnected,
  onSaved
}: Props) {
  const [config, setConfig] = useState<SshTunnelConfig>(() => {
    const ssh = profile?.ssh_profile;

    return {
      id: profile?.id ?? crypto.randomUUID(),
      name: profile?.name ?? "Remote InfluxDB",
      ssh_host: ssh?.ssh_host ?? "",
      ssh_port: ssh?.ssh_port ?? 22,
      ssh_username: ssh?.ssh_username ?? "",
      private_key_path: ssh?.private_key_path ?? "",
      auth_method: ssh?.auth_method ?? "key",
      remote_host: ssh?.remote_host ?? "127.0.0.1",
      remote_port: ssh?.remote_port ?? 8181,
      local_port: ssh?.local_port ?? 18181
    };
  });

  const [token, setToken] = useState("");
  const [sshPassword, setSshPassword] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  function update(
    key: keyof SshTunnelConfig,
    value: string | number
  ) {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  }

  function setAuthMethod(authMethod: SshAuthMethod) {
    setConfig(prev => ({
      ...prev,
      auth_method: authMethod
    }));
  }

  function sshProfile() {
    return {
      ssh_host: config.ssh_host.trim(),
      ssh_port: config.ssh_port,
      ssh_username: config.ssh_username.trim(),
      private_key_path: config.private_key_path?.trim() || undefined,
      auth_method: config.auth_method,
      remote_host: config.remote_host.trim(),
      remote_port: config.remote_port,
      local_port: config.local_port
    };
  }

  function validateConfiguration() {
    if (!config.ssh_host.trim()) {
      throw new Error("SSH host is required");
    }

    if (!config.ssh_username.trim()) {
      throw new Error("SSH username is required");
    }

    if (!config.remote_host.trim()) {
      throw new Error("Remote InfluxDB host is required");
    }

    if (
      !isValidPort(config.ssh_port) ||
      !isValidPort(config.remote_port) ||
      !isValidPort(config.local_port)
    ) {
      throw new Error(
        "SSH and tunnel ports must be between 1 and 65535"
      );
    }
  }

  // Save the SSH configuration only. The tunnel is not started
  // and the InfluxDB token is not verified.
  async function save() {
    setError("");
    setSavedMessage("");
    setSaving(true);

    try {
      validateConfiguration();

      await onSaved({
        url: `http://127.0.0.1:${config.local_port}`,
        token: token.trim(),
        tunnel_id: config.id,
        ssh_profile: sshProfile(),
        ssh_password: sshPassword.trim() || undefined
      });

      // The password is now in the credential store; do not keep it
      // in component state.
      setSshPassword("");

      setStatus("Saved");
      setSavedMessage(
        editing
          ? "SSH configuration updated. No connection was tested."
          : "Configuration saved. No connection was tested."
      );
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  // The token field starts empty when editing. Fall back to the
  // token stored in the operating system credential store.
  async function resolveToken() {
    const typed = token.trim();

    if (typed) {
      return typed;
    }

    if (profile?.has_token) {
      return connectionApi.token(profile.id);
    }

    return "";
  }

  async function connect() {
    let tunnelStarted = false;

    setError("");
    setSavedMessage("");
    setLoading(true);

    try {
      validateConfiguration();

      if (
        config.auth_method === "password" &&
        !sshPassword.trim() &&
        !profile?.ssh_profile?.has_password
      ) {
        throw new Error("SSH password is required");
      }

      const normalizedToken = await resolveToken();

      if (!normalizedToken) {
        throw new Error("InfluxDB token is required");
      }

      setStatus("Opening SSH tunnel...");

      const tunnel = await sshApi.start({
        ...config,
        ...sshProfile(),
        password: sshPassword.trim() || undefined
      });

      tunnelStarted = true;
      setStatus("Testing InfluxDB authentication...");

      // Verify the tunnel and the InfluxDB token before saving the profile.
      await influxApi.test({
        id: config.id,
        name: config.name,
        url: tunnel.local_url,
        token: normalizedToken
      });

      await onConnected({
        url: tunnel.local_url,
        token: normalizedToken,
        tunnel_id: config.id,
        ssh_profile: sshProfile(),
        ssh_password: sshPassword.trim() || undefined
      });

      // The password is now in the credential store; do not keep it
      // in component state.
      setSshPassword("");

      setStatus("Connected");
    } catch (e) {
      if (tunnelStarted) {
        await sshApi.stop(config.id).catch(() => undefined);
      }

      setStatus("Connection failed");
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function disconnect() {
    try {
      setError("");
      await sshApi.stop(config.id);
      setStatus("Disconnected");
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="ssh-form">
      <h2>
        <ShieldCheck size={20} />
        SSH Tunnel Configuration
      </h2>

      <p className="form-description">
        The host key must already be present in your known_hosts file.
        InfluxAdmin never disables host key verification. Use a private
        key, your SSH agent, or a password.
      </p>

      <label>SSH Host</label>
      <input
        value={config.ssh_host}
        onChange={e => update("ssh_host", e.target.value)}
        placeholder="203.0.113.10"
      />

      <label>SSH Port</label>
      <input
        type="number"
        min={1}
        max={65535}
        value={config.ssh_port}
        onChange={e => update("ssh_port", Number(e.target.value))}
      />

      <label>SSH Username</label>
      <input
        value={config.ssh_username}
        onChange={e => update("ssh_username", e.target.value)}
        placeholder="influxadmin"
      />

      <label>Authentication Method</label>
      <select
        className="auth-method"
        value={config.auth_method}
        onChange={e =>
          setAuthMethod(e.target.value as SshAuthMethod)
        }
      >
        <option value="key">Private key / SSH agent</option>
        <option value="password">Password</option>
      </select>

      {config.auth_method === "key" ? (
        <>
          <label>Private Key Path</label>
          <input
            value={config.private_key_path ?? ""}
            onChange={e => update("private_key_path", e.target.value)}
            placeholder="/home/user/.ssh/id_ed25519"
          />

          <p className="form-hint">
            Leave empty to use your SSH agent or the default key.
          </p>
        </>
      ) : (
        <>
          <label>SSH Password</label>
          <input
            type="password"
            value={sshPassword}
            onChange={e => setSshPassword(e.target.value)}
            placeholder={
              profile?.ssh_profile?.has_password
                ? "Leave empty to keep the stored password"
                : "Enter the SSH password"
            }
            autoComplete="new-password"
          />

          <p className="form-hint">
            {profile?.ssh_profile?.has_password
              ? "A password is already stored in the operating system credential store. Leave the field empty to keep it. "
              : ""}
            Passwords are stored by the operating system, never in the
            application database. Only password and keyboard-interactive
            authentication are supported; additional prompts such as
            one-time codes are not.
          </p>
        </>
      )}

      <hr />

      <h3>
        <Server size={17} />
        InfluxDB Destination
      </h3>

      <label>Remote Host</label>
      <input
        value={config.remote_host}
        onChange={e => update("remote_host", e.target.value)}
      />

      <label>Remote Port</label>
      <input
        type="number"
        min={1}
        max={65535}
        value={config.remote_port}
        onChange={e => update("remote_port", Number(e.target.value))}
      />

      <label>Local Port</label>
      <input
        type="number"
        min={1}
        max={65535}
        value={config.local_port}
        onChange={e => update("local_port", Number(e.target.value))}
      />

      <hr />

      <h3>
        <KeyRound size={17} />
        InfluxDB Authentication
      </h3>

      <label>API Token</label>
      <input
        type="password"
        value={token}
        onChange={e => setToken(e.target.value)}
        placeholder={
          profile?.has_token
            ? "Leave empty to keep the stored token"
            : "Enter your InfluxDB token"
        }
        autoComplete="off"
      />

      {profile?.has_token && (
        <p className="form-hint">
          A token is already stored for this connection.
          Leave the field empty to keep it.
        </p>
      )}

      {error && <div className="connection-error">{error}</div>}

      {savedMessage && (
        <div className="connection-success">
          <CheckCircle size={15} />
          <span>{savedMessage}</span>
        </div>
      )}

      <div className="ssh-actions">
        <button
          className="connect-button"
          onClick={connect}
          disabled={loading || saving}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="spin" />
              Connecting...
            </>
          ) : (
            <>
              <Power size={16} />
              Connect SSH
            </>
          )}
        </button>

        <button
          className="secondary-button"
          onClick={save}
          disabled={loading || saving}
          title="Save this configuration without starting the tunnel or testing the token"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save
            </>
          )}
        </button>

        <button
          className="secondary-button"
          onClick={disconnect}
          disabled={loading || saving}
        >
          Disconnect
        </button>
      </div>

      <p className="ssh-status">Status: {status}</p>
    </div>
  );
}
