
import { useState } from "react";
import {
  Server,
  Database,
  KeyRound,
  Link,
  Loader2,
  CheckCircle,
  AlertCircle,
  Save
} from "lucide-react";

import { connectionApi, influxApi } from "../../services/tauri";
import type {
  ConnectionProfile,
  DirectConnectionDraft
} from "../../types/connections";

interface Props {
  editing?: boolean;
  profile?: ConnectionProfile | null;
  onConnected: (draft: DirectConnectionDraft) => Promise<void>;
  onSaved: (draft: DirectConnectionDraft) => Promise<void>;
}

export default function ConnectionForm({
  editing = false,
  profile = null,
  onConnected,
  onSaved
}: Props) {

  const [url, setUrl] = useState(
    profile?.url ?? "http://localhost:8181"
  );
  const [token, setToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  function normalizeUrl() {
    if (!url.trim()) {
      throw new Error("InfluxDB URL is required");
    }

    const normalizedUrl = url.trim().replace(/\/+$/, "");

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(normalizedUrl);
    } catch {
      throw new Error("Invalid InfluxDB URL");
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new Error("InfluxDB URL must start with http:// or https://");
    }

    return normalizedUrl;
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

  async function save() {
    setSaving(true);
    setError("");
    setSuccess(false);
    setSavedMessage("");

    try {
      const normalizedUrl = normalizeUrl();

      await onSaved({
        url: normalizedUrl,
        token: token.trim()
      });

      setSavedMessage(
        editing
          ? "Connection updated. No connection was tested."
          : "Connection saved. No connection was tested."
      );
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  async function connect() {

    setLoading(true);
    setError("");
    setSuccess(false);
    setSavedMessage("");

    try {

      const normalizedUrl = normalizeUrl();

      const normalizedToken = await resolveToken();

      if (!normalizedToken) {
        throw new Error("InfluxDB token is required");
      }

      // Test InfluxDB connection and token authentication.
      await influxApi.test({
        id: profile?.id ?? "draft",
        name: profile?.name ?? "draft",
        url: normalizedUrl,
        token: normalizedToken
      });

      // Persist the profile and notify the parent component.
      await onConnected({
        url: normalizedUrl,
        token: normalizedToken
      });

      setSuccess(true);

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
        The token is stored in the operating system credential store.
      </p>

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

      {savedMessage && (
        <div className="connection-success">
          <CheckCircle size={17} />
          <span>{savedMessage}</span>
        </div>
      )}

      <div className="form-actions">

        {/* Connect Button */}
        <button
          className="connect-button"
          onClick={connect}
          disabled={loading || saving}
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

        <button
          className="secondary-button"
          onClick={save}
          disabled={loading || saving}
          title="Save this configuration without testing the connection"
        >
          {saving ? (
            <>
              <Loader2 size={17} className="spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={17} />
              Save
            </>
          )}
        </button>

      </div>

    </div>
  );
}
