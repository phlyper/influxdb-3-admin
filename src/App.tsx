
import { useState } from "react";
import {
  Database,
  Server,
  ShieldCheck,
  Settings,
  Plus,
  Activity,
  Power,
  Terminal
} from "lucide-react";

import ConnectionManager from "./components/connections/ConnectionManager";

type ConnectionMode = "direct" | "ssh";

interface Connection {
  id: string;
  name: string;
  url: string;
  mode: ConnectionMode;
  connected: boolean;
}

export default function App() {

  const [connections, setConnections] = useState<Connection[]>([]);

  const [activeConnection, setActiveConnection] =
    useState<Connection | null>(null);

  const [showConnectionManager, setShowConnectionManager] =
    useState(true);

  const [connectionName, setConnectionName] =
    useState("InfluxDB Server");

  // ==========================================
  // ADD CONNECTION
  // ==========================================

  function handleConnected(
    url: string,
    mode: ConnectionMode
  ) {
    const newConnection: Connection = {
      id: crypto.randomUUID(),
      name: connectionName,
      url,
      mode,
      connected: true
    };

    setConnections(previous => [
      ...previous,
      newConnection
    ]);

    setActiveConnection(newConnection);
    setShowConnectionManager(false);
  }

  // ==========================================
  // SELECT CONNECTION
  // ==========================================

  function selectConnection(connection: Connection) {
    setActiveConnection(connection);
  }

  // ==========================================
  // DISCONNECT
  // ==========================================

  function disconnect() {
    setActiveConnection(null);
    setShowConnectionManager(true);
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
              onClick={() => {
                setConnectionName("InfluxDB Server");
                setShowConnectionManager(true);
              }}
              title="New connection"
            >
              <Plus size={17} />
            </button>
          </div>

          {connections.map(connection => (

            <button
              key={connection.id}
              className={`connection-item ${
                activeConnection?.id === connection.id
                  ? "active"
                  : ""
              }`}
              onClick={() => selectConnection(connection)}
            >

              {connection.mode === "ssh" ? (
                <ShieldCheck size={17} />
              ) : (
                <Server size={17} />
              )}

              <span>{connection.name}</span>

              <span className="status-dot" />

            </button>

          ))}

          {connections.length === 0 && (
            <p className="empty-connections">
              No connections yet
            </p>
          )}

        </div>

        <div className="sidebar-bottom">

          <button>
            <Activity size={17} />
            Monitoring
          </button>

          <button>
            <Terminal size={17} />
            SQL Workbench
          </button>

          <button>
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
              {activeConnection
                ? activeConnection.name
                : "Dashboard"}
            </h1>

            <p>
              InfluxDB 3 Core Administration
            </p>
          </div>

          {activeConnection && (

            <div className="header-actions">

              <span className="connection-status">
                <span className="status-dot" />
                Connected
              </span>

              <button
                className="disconnect-button"
                onClick={disconnect}
              >
                <Power size={16} />
                Disconnect
              </button>

            </div>

          )}

        </header>

        {/* CONNECTION MANAGER */}

        {showConnectionManager && (

          <section className="content-area">

            <div className="connection-name-input">
              <label>Connection name</label>

              <input
                value={connectionName}
                onChange={e =>
                  setConnectionName(e.target.value)
                }
                placeholder="My InfluxDB Server"
              />
            </div>

            <ConnectionManager
              onConnected={handleConnected}
            />

          </section>

        )}

        {/* DASHBOARD */}

        {!showConnectionManager && activeConnection && (

          <section className="dashboard-content">

            <div className="welcome-card">

              <Database size={35} />

              <h2>
                Welcome to InfluxAdmin
              </h2>

              <p>
                Connected to {activeConnection.url}
              </p>

              <span className="connection-mode">
                {activeConnection.mode === "ssh"
                  ? "SSH Tunnel"
                  : "Direct Connection"}
              </span>

            </div>

            <div className="dashboard-grid">

              <div className="dashboard-card">
                <Database size={25} />
                <h3>Databases</h3>
                <p>Explore your databases</p>
              </div>

              <div className="dashboard-card">
                <Terminal size={25} />
                <h3>SQL Workbench</h3>
                <p>Execute SQL queries</p>
              </div>

              <div className="dashboard-card">
                <Activity size={25} />
                <h3>Monitoring</h3>
                <p>Monitor server activity</p>
              </div>

              <div className="dashboard-card">
                <ShieldCheck size={25} />
                <h3>Security</h3>
                <p>Manage access tokens</p>
              </div>

            </div>

          </section>

        )}

        {/* EMPTY STATE */}

        {!showConnectionManager && !activeConnection && (

          <section className="empty-state">

            <Database size={45} />

            <h2>No active connection</h2>

            <button
              onClick={() => setShowConnectionManager(true)}
            >
              <Plus size={17} />
              New Connection
            </button>

          </section>

        )}

      </main>

    </div>
  );
}
