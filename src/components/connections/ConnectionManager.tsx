
import { useState } from "react";
import {
  Server,
  ShieldCheck,
  Network
} from "lucide-react";

import SshTunnelForm from "./SshTunnelForm";
import ConnectionForm from "./ConnectionForm";

type ConnectionMode = "direct" | "ssh";

interface Props {
  onConnected: (url: string, mode: ConnectionMode) => void;
}

export default function ConnectionManager({
  onConnected
}: Props) {

  const [mode, setMode] = useState<ConnectionMode>("direct");

  return (
    <div className="connection-manager">

      <div className="connection-header">
        <h2>New Connection</h2>
        <p>
          Connect to your InfluxDB 3 Core instance.
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
            onConnected={(url) => onConnected(url, "direct")}
          />
        )}

        {mode === "ssh" && (
          <SshTunnelForm
            onConnected={(url) => onConnected(url, "ssh")}
          />
        )}

      </div>

    </div>
  );
}
