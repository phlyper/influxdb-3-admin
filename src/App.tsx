
import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  Database,
  LayoutDashboard,
  Loader2,
  Pencil,
  Plus,
  Power,
  Server,
  Settings,
  ShieldCheck,
  Table2,
  Terminal,
  Trash2
} from "lucide-react";

import ConnectionManager from "./components/connections/ConnectionManager";
import DatabaseExplorer from "./components/database/DatabaseExplorer";
import { connectionApi, influxApi } from "./services/tauri";
import { sshApi } from "./services/ssh";
import type {
  ConnectionProfile,
  ProfileSaveMeta
} from "./types/connections";

interface Session {
  profile: ConnectionProfile;
  token: string;
  url: string;
}

type MainView = "dashboard" | "explorer";

function profileSettingsChanged(
  session: Session,
  profile: ConnectionProfile
) {
  return (
    session.profile.connection_type !== profile.connection_type ||
    session.url !== profile.url ||
    JSON.stringify(session.profile.ssh_profile) !==
      JSON.stringify(profile.ssh_profile)
  );
}

export default function App() {

  const [profiles, setProfiles] = useState<ConnectionProfile[]>([]);
  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const [showConnectionManager, setShowConnectionManager] =
    useState(true);

  const [view, setView] = useState<MainView>("dashboard");

  const [connectionName, setConnectionName] =
    useState("InfluxDB Server");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [appError, setAppError] = useState("");

  const editingProfile = editingId
    ? profiles.find(profile => profile.id === editingId) ?? null
    : null;

  const activeSession = activeId
    ? sessions[activeId] ?? null
    : null;

  // ==========================================
  // LOAD SAVED CONNECTIONS
  // ==========================================

  useEffect(() => {
    void loadProfiles();
  }, []);

  async function loadProfiles() {
    setLoadingProfiles(true);

    try {
      const result = await connectionApi.list();
      setProfiles(result);
    } catch (error) {
      setAppError(String(error));
    } finally {
      setLoadingProfiles(false);
    }
  }

  // ==========================================
  // CONNECT
  // ==========================================

  function upsertProfile(
    previous: ConnectionProfile[],
    profile: ConnectionProfile
  ) {
    const remaining = previous.filter(item => item.id !== profile.id);

    return [...remaining, profile].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  function handleConnected(
    profile: ConnectionProfile,
    token: string,
    url: string
  ) {
    setProfiles(previous => upsertProfile(previous, profile));

    setSessions(previous => ({
      ...previous,
      [profile.id]: { profile, token, url }
    }));

    setActiveId(profile.id);
    setShowConnectionManager(false);
    setView("dashboard");
    setAppError("");
    setEditingId(null);
  }

  // A profile saved without testing stays in the sidebar but is
  // not opened: there is no verified session yet. If the saved
  // settings differ from the running session (or the token changed),
  // the session is closed so the new settings are used.
  function handleProfileSaved(
    profile: ConnectionProfile,
    meta: ProfileSaveMeta
  ) {
    setProfiles(previous => upsertProfile(previous, profile));

    const session = sessions[profile.id];

    if (
      session &&
      (meta.tokenUpdated ||
        meta.sshPasswordUpdated ||
        profileSettingsChanged(session, profile))
    ) {
      // Always ask the tunnel manager to stop: stopping an unknown
      // tunnel is a no-op, and the saved profile may have just been
      // converted from SSH to direct.
      void sshApi.stop(profile.id).catch(() => undefined);

      setSessions(previous => {
        const next = { ...previous };
        delete next[profile.id];
        return next;
      });

      setActiveId(current => (current === profile.id ? null : current));
    } else if (session) {
      // Only metadata changed: keep the live session but refresh
      // the profile snapshot used by the header.
      setSessions(previous => ({
        ...previous,
        [profile.id]: { ...session, profile }
      }));
    }

    setAppError("");
  }

  // ==========================================
  // EDIT SAVED CONNECTION
  // ==========================================

  function editProfile(profile: ConnectionProfile) {
    setEditingId(profile.id);
    setConnectionName(profile.name);
    setShowConnectionManager(true);
    setAppError("");
  }

  async function openProfile(profile: ConnectionProfile) {
    setEditingId(null);

    if (sessions[profile.id]) {
      setActiveId(profile.id);
      setShowConnectionManager(false);
      return;
    }

    setBusyId(profile.id);
    setAppError("");

    let tunnelStarted = false;

    try {
      const token = await connectionApi.token(profile.id);

      let url = profile.url;

      if (profile.connection_type === "ssh" && profile.ssh_profile) {
        const running = await sshApi.status(profile.id);

        if (running) {
          url = `http://127.0.0.1:${profile.ssh_profile.local_port}`;
        } else {
          const tunnel = await sshApi.start({
            id: profile.id,
            name: profile.name,
            ...profile.ssh_profile
          });

          tunnelStarted = true;
          url = tunnel.local_url;
        }
      }

      await influxApi.test({
        id: profile.id,
        name: profile.name,
        url,
        token
      });

      setSessions(previous => ({
        ...previous,
        [profile.id]: { profile, token, url }
      }));

      setActiveId(profile.id);
      setShowConnectionManager(false);
      setView("dashboard");
      setAppError("");
    } catch (error) {
      if (tunnelStarted) {
        await sshApi.stop(profile.id).catch(() => undefined);
      }

      setAppError(String(error));
    } finally {
      setBusyId(null);
    }
  }

  // ==========================================
  // DISCONNECT
  // ==========================================

  async function disconnect() {
    if (!activeSession) {
      setShowConnectionManager(true);
      return;
    }

    const session = activeSession;

    setBusyId(session.profile.id);

    try {
      if (session.profile.connection_type === "ssh") {
        await sshApi.stop(session.profile.id);
      }
    } catch (error) {
      setAppError(String(error));
    } finally {
      setSessions(previous => {
        const next = { ...previous };
        delete next[session.profile.id];
        return next;
      });

      setActiveId(null);
      setShowConnectionManager(true);
      setEditingId(null);
      setBusyId(null);
    }
  }

  // ==========================================
  // DELETE SAVED CONNECTION
  // ==========================================

  async function deleteProfile(profile: ConnectionProfile) {
    const confirmed = window.confirm(
      `Delete connection "${profile.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setBusyId(profile.id);
    setAppError("");

    try {
      if (
        sessions[profile.id] &&
        profile.connection_type === "ssh"
      ) {
        await sshApi.stop(profile.id).catch(() => undefined);
      }

      await connectionApi.remove(profile.id);

      setSessions(previous => {
        const next = { ...previous };
        delete next[profile.id];
        return next;
      });

      setProfiles(previous =>
        previous.filter(item => item.id !== profile.id)
      );

      if (editingId === profile.id) {
        setEditingId(null);
        setConnectionName("InfluxDB Server");
      }

      if (activeId === profile.id) {
        setActiveId(null);
        setShowConnectionManager(true);
      }
    } catch (error) {
      setAppError(String(error));
    } finally {
      setBusyId(null);
    }
  }

  function newConnection() {
    setEditingId(null);
    setConnectionName("InfluxDB Server");
    setShowConnectionManager(true);
    setAppError("");
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="app-container">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-logo">
          <Database size={25} />
          <span>InfluxAdmin</span>
        </div>

        <div className="sidebar-section">

          <div className="sidebar-section-title">
            CONNECTIONS

            <button
              onClick={newConnection}
              title="New connection"
            >
              <Plus size={17} />
            </button>
          </div>

          {loadingProfiles && (
            <p className="empty-connections">
              <Loader2 size={13} className="spin" />
              Loading connections...
            </p>
          )}

          {profiles.map(profile => {

            const connected = Boolean(sessions[profile.id]);

            return (
              <div className="connection-row" key={profile.id}>

                <button
                  className={`connection-item ${
                    activeId === profile.id ? "active" : ""
                  }`}
                  onClick={() => void openProfile(profile)}
                  title={
                    profile.has_token
                      ? profile.url
                      : `${profile.url} (no stored token)`
                  }
                >
                  {profile.connection_type === "ssh" ? (
                    <ShieldCheck size={17} />
                  ) : (
                    <Server size={17} />
                  )}

                  <span>{profile.name}</span>

                  {busyId === profile.id ? (
                    <Loader2 size={14} className="spin" />
                  ) : (
                    <span
                      className={`status-dot ${
                        connected ? "" : "offline"
                      }`}
                    />
                  )}
                </button>

                <button
                  className={`connection-edit ${
                    editingId === profile.id ? "active" : ""
                  }`}
                  onClick={() => editProfile(profile)}
                  title={`Edit ${profile.name}`}
                >
                  <Pencil size={14} />
                </button>

                <button
                  className="connection-delete"
                  onClick={() => void deleteProfile(profile)}
                  title={`Delete ${profile.name}`}
                >
                  <Trash2 size={14} />
                </button>

              </div>
            );
          })}

          {!loadingProfiles && profiles.length === 0 && (
            <p className="empty-connections">
              No saved connections
            </p>
          )}

        </div>

        <div className="sidebar-bottom">

          <button
            onClick={() => setView("explorer")}
            disabled={!activeSession}
            className={view === "explorer" ? "active" : ""}
          >
            <Database size={17} />
            Database Explorer
          </button>

          <button disabled title="Coming soon">
            <Activity size={17} />
            Monitoring
          </button>

          <button disabled title="Coming soon">
            <Terminal size={17} />
            SQL Workbench
          </button>

          <button disabled title="Coming soon">
            <Settings size={17} />
            Settings
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="main-content">

        {/* HEADER */}

        <header className="app-header">

          <div>
            <h1>
              {activeSession
                ? activeSession.profile.name
                : "Dashboard"}
            </h1>

            <p>
              {activeSession
                ? activeSession.url
                : "InfluxDB 3 Core Administration"}
            </p>
          </div>

          {activeSession && (

            <div className="header-actions">

              <div className="header-tabs">

                <button
                  className={view === "dashboard" ? "active" : ""}
                  onClick={() => setView("dashboard")}
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </button>

                <button
                  className={view === "explorer" ? "active" : ""}
                  onClick={() => setView("explorer")}
                >
                  <Table2 size={15} />
                  Explorer
                </button>

              </div>

              <span className="connection-status">
                <span className="status-dot" />
                Connected
              </span>

              <button
                className="disconnect-button"
                onClick={() => void disconnect()}
                disabled={busyId === activeSession.profile.id}
              >
                {busyId === activeSession.profile.id ? (
                  <Loader2 size={16} className="spin" />
                ) : (
                  <Power size={16} />
                )}
                Disconnect
              </button>

            </div>

          )}

        </header>

        {appError && (
          <div className="app-error">
            <AlertCircle size={17} />
            <span>{appError}</span>
            <button onClick={() => setAppError("")}>Dismiss</button>
          </div>
        )}

        {/* CONNECTION MANAGER */}

        {showConnectionManager && (

          <section className="content-area">

            <div className="connection-name-input">
              <label>Connection name</label>

              <input
                value={connectionName}
                onChange={event =>
                  setConnectionName(event.target.value)
                }
                placeholder="My InfluxDB Server"
              />
            </div>

            <ConnectionManager
              key={editingProfile?.id ?? "new-connection"}
              name={connectionName}
              editing={editingProfile}
              onConnected={handleConnected}
              onSaved={handleProfileSaved}
            />

          </section>

        )}

        {/* DASHBOARD */}

        {!showConnectionManager &&
          activeSession &&
          view === "dashboard" && (

          <section className="dashboard-content">

            <div className="welcome-card">

              <Database size={35} />

              <h2>
                Welcome to InfluxAdmin
              </h2>

              <p>
                Connected to {activeSession.url}
              </p>

              <span className="connection-mode">
                {activeSession.profile.connection_type === "ssh"
                  ? "SSH Tunnel"
                  : "Direct Connection"}
              </span>

            </div>

            <div className="dashboard-grid">

              <button
                className="dashboard-card dashboard-card-button"
                onClick={() => setView("explorer")}
              >
                <Database size={25} />
                <h3>Databases</h3>
                <p>Explore databases, tables and schemas</p>
              </button>

              <div className="dashboard-card">
                <Terminal size={25} />
                <h3>SQL Workbench</h3>
                <p>Coming soon</p>
              </div>

              <div className="dashboard-card">
                <Activity size={25} />
                <h3>Monitoring</h3>
                <p>Coming soon</p>
              </div>

              <div className="dashboard-card">
                <ShieldCheck size={25} />
                <h3>Security</h3>
                <p>Coming soon</p>
              </div>

            </div>

          </section>

        )}

        {/* DATABASE EXPLORER */}

        {!showConnectionManager &&
          activeSession &&
          view === "explorer" && (

          <DatabaseExplorer
            key={`${activeSession.profile.id}-${activeSession.url}`}
            connection={{
              id: activeSession.profile.id,
              name: activeSession.profile.name,
              url: activeSession.url,
              token: activeSession.token
            }}
          />

        )}

        {/* EMPTY STATE */}

        {!showConnectionManager && !activeSession && (

          <section className="empty-state">

            <Database size={45} />

            <h2>No active connection</h2>

            <button onClick={newConnection}>
              <Plus size={17} />
              New Connection
            </button>

          </section>

        )}

      </main>

    </div>
  );
}
