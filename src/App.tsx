import { useState } from "react";
import { influxApi, Connection } from "./services/tauri";
import {
  Database,
  Server,
  Play,
  Plus,
  Activity,
  Terminal
} from "lucide-react";

export default function App() {
  const [connection, setConnection] =
    useState<Connection | null>(null);

  const [url, setUrl] =
    useState("http://127.0.0.1:8181");

  const [token, setToken] = useState("");
  const [database, setDatabase] = useState("");
  const [query, setQuery] = useState(
    "SELECT * FROM system.tables LIMIT 10"
  );

  const [databases, setDatabases] = useState<string[]>([]);
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [error, setError] = useState("");

  async function connect() {
    try {
      setError("");

      const c: Connection = {
        id: crypto.randomUUID(),
        name: "InfluxDB Core",
        url,
        token
      };

      await influxApi.test(c);

      const data = await influxApi.databases(c);

      setConnection(c);
      setDatabases(data.databases ?? []);
      setStatus("Connected");
    } catch (e) {
      setError(String(e));
      setStatus("Connection failed");
    }
  }

  async function executeQuery() {
    if (!connection || !database) return;

    try {
      setError("");

      const response = await influxApi.query(
        connection,
        database,
        query
      );

      setResult(response);
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>InfluxAdmin</h2>

        <div className="section-title">
          CONNECTIONS
        </div>

        <div className="connection">
          <Server size={16} />
          InfluxDB Core
        </div>

        <div className="section-title">
          WORKSPACE
        </div>

        <button onClick={connect}>
          <Activity size={16} />
          Connect
        </button>

        <button onClick={() => setResult("")}>
          <Terminal size={16} />
          SQL Workbench
        </button>

        <button onClick={async () => {
          if (connection) {
            const data = await influxApi.databases(connection);
            setDatabases(data.databases ?? []);
          }
        }}>
          <Database size={16} />
          Refresh databases
        </button>

        <div className="section-title">
          DATABASES
        </div>

        {databases.map(db => (
          <button
            key={db}
            className="database"
            onClick={() => setDatabase(db)}
          >
            <Database size={14} />
            {db}
          </button>
        ))}
      </aside>

      <main className="main">
        <header className="topbar">
          <span>InfluxAdmin / SQL Workbench</span>
          <span>{status}</span>
        </header>

        <section className="connection-panel">
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="InfluxDB URL"
          />

          <input
            value={token}
            onChange={e => setToken(e.target.value)}
            type="password"
            placeholder="Admin token"
          />

          <button onClick={connect}>
            Connect
          </button>
        </section>

        <section className="workspace">
          <h3>SQL Workbench</h3>

          <select
            value={database}
            onChange={e => setDatabase(e.target.value)}
          >
            <option value="">Select database</option>
            {databases.map(db => (
              <option key={db} value={db}>
                {db}
              </option>
            ))}
          </select>

          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
          />

          <button onClick={executeQuery}>
            <Play size={16} />
            Execute SQL
          </button>

          <h3>Results</h3>
          <pre>{result || "No results yet"}</pre>

          {error && (
            <div className="error">{error}</div>
          )}
        </section>
      </main>
    </div>
  );
}
