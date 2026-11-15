
import { useState } from "react";
import { sshApi, SshTunnelConfig } from "../../services/ssh";
import { Server, ShieldCheck, Power } from "lucide-react";

interface Props {
  onConnected: (url: string) => void;
}

export default function SshTunnelForm({
  onConnected
}: Props) {
  const [config, setConfig] = useState<SshTunnelConfig>({
    id: crypto.randomUUID(),
    name: "Remote InfluxDB",
    ssh_host: "",
    ssh_port: 22,
    ssh_username: "",
    private_key_path: "",
    remote_host: "127.0.0.1",
    remote_port: 8181,
    local_port: 18181
  });

  const [status, setStatus] = useState("Disconnected");
  const [error, setError] = useState("");

  function update(
    key: keyof SshTunnelConfig,
    value: string | number
  ) {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  }

  async function connect() {
    try {
      setError("");
      setStatus("Connecting...");

      const result = await sshApi.start(config);

      setStatus("Connected");

      onConnected(result.local_url);
    } catch (e) {
      setStatus("Connection failed");
      setError(String(e));
    }
  }

  async function disconnect() {
    try {
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

      <label>SSH Host</label>
      <input
        value={config.ssh_host}
        onChange={e => update("ssh_host", e.target.value)}
        placeholder="203.0.113.10"
      />

      <label>SSH Port</label>
      <input
        type="number"
        value={config.ssh_port}
        onChange={e => update("ssh_port", Number(e.target.value))}
      />

      <label>SSH Username</label>
      <input
        value={config.ssh_username}
        onChange={e => update("ssh_username", e.target.value)}
      />

      <label>Private Key Path</label>
      <input
        value={config.private_key_path ?? ""}
        onChange={e => update("private_key_path", e.target.value)}
        placeholder="/home/user/.ssh/id_ed25519"
      />

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
        value={config.remote_port}
        onChange={e => update("remote_port", Number(e.target.value))}
      />

      <label>Local Port</label>
      <input
        type="number"
        value={config.local_port}
        onChange={e => update("local_port", Number(e.target.value))}
      />

      <div className="ssh-actions">
        <button onClick={connect}>
          <Power size={16} />
          Connect SSH
        </button>

        <button onClick={disconnect}>
          Disconnect
        </button>
      </div>

      <p>Status: {status}</p>

      {error && <div className="error">{error}</div>}
    </div>
  );
}
