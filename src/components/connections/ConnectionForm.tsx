
import { useState } from "react";
import {
  Server,
  Database,
  KeyRound,
  Link,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

import { invoke } from "@tauri-apps/api/core";

interface Props {
  onConnected: (url: string) => void;
}

export default function ConnectionForm({
  onConnected
}: Props) {

  const [name, setName] = useState("Local InfluxDB");
  const [url, setUrl] = useState("http://localhost:8181");
  const [token, setToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function connect() {

    setLoading(true);
    setError("");
    setSuccess(false);

    try {

      if (!url.trim()) {
        throw new Error("InfluxDB URL is required");
      }

      if (!token.trim()) {
        throw new Error("InfluxDB token is required");
      }

      const normalizedUrl = url.trim().replace(/\/+$/, "");

      // Test InfluxDB connection
      await invoke("test_connection", {
        url: normalizedUrl,
        token: token.trim()
      });

      setSuccess(true);

      // Notify parent component
      onConnected(normalizedUrl);

    } catch (err) {

      setError(String(err));

    } finally {

      setLoading(false);

    }
  }

  return (
    <div className="connection-form">

      <div className="form-title">
        <Server size={20} />

        <h3>Direct Connection</h3>
      </div>

      <p className="form-description">
        Connect directly to your InfluxDB 3 Core server.
      </p>

      {/* Connection Name */}
      <div className="form-group">

        <label>
          Connection Name
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My InfluxDB Server"
        />

      </div>

      {/* Server URL */}
      <div className="form-group">

        <label>
          <Link size={15} />
          InfluxDB URL
        </label>

        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="http://localhost:8181"
        />

      </div>

      {/* API Token */}
      <div className="form-group">

        <label>
          <KeyRound size={15} />
          API Token
        </label>

        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter your InfluxDB token"
        />

      </div>

      {/* Status */}
      {error && (
        <div className="connection-error">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="connection-success">
          <CheckCircle size={17} />
          <span>InfluxDB connection successful</span>
        </div>
      )}

      {/* Connect Button */}
      <button
        className="connect-button"
        onClick={connect}
        disabled={loading}
      >

        {loading ? (
          <>
            <Loader2 size={17} className="spin" />
            Connecting...
          </>
        ) : (
          <>
            <Database size={17} />
            Connect to InfluxDB
          </>
        )}

      </button>

    </div>
  );
}
