import { useEffect, useState } from "react";
import {
  AlertCircle,
  Database,
  Loader2,
  Plus,
  RefreshCw,
  Trash2
} from "lucide-react";

import { influxApi, Connection } from "../../services/tauri";
import type { ColumnInfo, TableInfo } from "../../types/explorer";
import TableList from "./TableList";
import SchemaViewer from "./SchemaViewer";

interface Props {
  connection: Connection;
}

export default function DatabaseExplorer({ connection }: Props) {
  const [databases, setDatabases] = useState<string[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);

  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);

  const [newDatabase, setNewDatabase] = useState("");
  const [showSystemTables, setShowSystemTables] = useState(false);

  const [loadingDatabases, setLoadingDatabases] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [busyAction, setBusyAction] = useState(false);

  const [error, setError] = useState("");

  async function loadDatabases(preferredDatabase?: string) {
    setLoadingDatabases(true);
    setError("");

    try {
      const names = await influxApi.databases(connection);
      const sorted = [...names].sort((a, b) => a.localeCompare(b));

      setDatabases(sorted);

      setSelectedDatabase(previous => {
        if (preferredDatabase && sorted.includes(preferredDatabase)) {
          return preferredDatabase;
        }

        if (previous && sorted.includes(previous)) {
          return previous;
        }

        return sorted[0] ?? null;
      });
    } catch (e) {
      setError(String(e));
      setDatabases([]);
      setSelectedDatabase(null);
    } finally {
      setLoadingDatabases(false);
    }
  }

  async function loadTables(database: string) {
    setLoadingTables(true);
    setError("");

    try {
      const result = await influxApi.tables(connection, database);

      setTables(result);

      setSelectedTable(previous => {
        if (
          previous &&
          result.some(
            table =>
              table.name === previous.name &&
              table.schema === previous.schema
          )
        ) {
          return previous;
        }

        return result[0] ?? null;
      });
    } catch (e) {
      setError(String(e));
      setTables([]);
      setSelectedTable(null);
    } finally {
      setLoadingTables(false);
    }
  }

  useEffect(() => {
    void loadDatabases();
  }, [connection.id, connection.url]);

  useEffect(() => {
    if (!selectedDatabase) {
      setTables([]);
      setSelectedTable(null);
      return;
    }

    void loadTables(selectedDatabase);
  }, [selectedDatabase, connection.id, connection.url]);

  useEffect(() => {
    if (!selectedDatabase || !selectedTable) {
      setColumns([]);
      return;
    }

    let cancelled = false;

    setLoadingColumns(true);
    setError("");

    influxApi
      .columns(
        connection,
        selectedDatabase,
        selectedTable.schema,
        selectedTable.name
      )
      .then(result => {
        if (!cancelled) {
          setColumns(result);
        }
      })
      .catch(e => {
        if (!cancelled) {
          setError(String(e));
          setColumns([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingColumns(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDatabase, selectedTable, connection.id, connection.url]);

  useEffect(() => {
    const visible = showSystemTables
      ? tables
      : tables.filter(table => table.schema === "iox");

    if (
      selectedTable &&
      !visible.some(
        table =>
          table.name === selectedTable.name &&
          table.schema === selectedTable.schema
      )
    ) {
      setSelectedTable(visible[0] ?? null);
    }
  }, [showSystemTables, tables, selectedTable]);

  const visibleTables = showSystemTables
    ? tables
    : tables.filter(table => table.schema === "iox");

  async function createDatabase() {
    const name = newDatabase.trim();

    if (!name) {
      return;
    }

    setBusyAction(true);
    setError("");

    try {
      await influxApi.createDatabase(connection, name);
      setNewDatabase("");
      await loadDatabases(name);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusyAction(false);
    }
  }

  async function deleteDatabase() {
    if (!selectedDatabase || busyAction) {
      return;
    }

    const confirmed = window.confirm(
      `Delete database "${selectedDatabase}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setBusyAction(true);
    setError("");

    try {
      await influxApi.deleteDatabase(connection, selectedDatabase);
      await loadDatabases();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusyAction(false);
    }
  }

  const canDeleteDatabase =
    Boolean(selectedDatabase) &&
    selectedDatabase !== "_internal" &&
    !busyAction;

  return (
    <section className="explorer">
      <div className="explorer-toolbar">
        <div>
          <h2>Database Explorer</h2>
          <p>
            {connection.name} · {connection.url}
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() => void loadDatabases()}
          disabled={loadingDatabases}
        >
          <RefreshCw
            size={15}
            className={loadingDatabases ? "spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="explorer-error">
          <AlertCircle size={17} />
          <span>{error}</span>
          <button onClick={() => setError("")}>Dismiss</button>
        </div>
      )}

      <div className="explorer-grid">
        <aside className="explorer-panel">
          <div className="panel-title">
            <span>
              <Database size={15} />
              Databases
            </span>
            <span className="panel-count">{databases.length}</span>
          </div>

          <div className="database-create">
            <input
              value={newDatabase}
              onChange={event => setNewDatabase(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Enter") {
                  void createDatabase();
                }
              }}
              placeholder="New database name"
            />

            <button
              className="icon-button"
              onClick={() => void createDatabase()}
              disabled={busyAction || !newDatabase.trim()}
              title="Create database"
            >
              {busyAction ? (
                <Loader2 size={15} className="spin" />
              ) : (
                <Plus size={15} />
              )}
            </button>
          </div>

          <div className="database-list">
            {loadingDatabases ? (
              <div className="explorer-empty">
                <Loader2 size={15} className="spin" />
                Loading databases...
              </div>
            ) : databases.length === 0 ? (
              <div className="explorer-empty">No databases found.</div>
            ) : (
              databases.map(database => (
                <button
                  key={database}
                  className={`database-item ${
                    selectedDatabase === database ? "active" : ""
                  }`}
                  onClick={() => setSelectedDatabase(database)}
                >
                  <Database size={14} />
                  <span>{database}</span>
                </button>
              ))
            )}
          </div>

          <button
            className="danger-button"
            onClick={() => void deleteDatabase()}
            disabled={!canDeleteDatabase}
          >
            <Trash2 size={14} />
            Delete database
          </button>
        </aside>

        <div className="explorer-panel">
          <div className="panel-title">
            <span>Tables</span>

            <label className="panel-toggle">
              <input
                type="checkbox"
                checked={showSystemTables}
                onChange={event =>
                  setShowSystemTables(event.target.checked)
                }
              />
              System
            </label>
          </div>

          <TableList
            tables={visibleTables}
            selected={selectedTable}
            loading={loadingTables}
            emptyMessage={
              selectedDatabase
                ? "No tables found in this database."
                : "Select a database first."
            }
            onSelect={setSelectedTable}
          />
        </div>

        <div className="explorer-panel schema-panel">
          <div className="panel-title">
            <span>Schema</span>
          </div>

          <SchemaViewer
            table={selectedTable}
            columns={columns}
            loading={loadingColumns}
          />
        </div>
      </div>
    </section>
  );
}
