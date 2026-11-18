import { Table2 } from "lucide-react";

import type { ColumnInfo, TableInfo } from "../../types/explorer";

interface Props {
  table: TableInfo | null;
  columns: ColumnInfo[];
  loading: boolean;
}

export default function SchemaViewer({
  table,
  columns,
  loading
}: Props) {
  if (!table) {
    return (
      <div className="explorer-empty">
        Select a table to inspect its schema.
      </div>
    );
  }

  return (
    <div className="schema-viewer">
      <div className="schema-heading">
        <Table2 size={16} />
        <div>
          <strong>{table.name}</strong>
          <span>
            {table.schema} · {table.table_type}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="explorer-empty">Loading columns...</div>
      ) : columns.length === 0 ? (
        <div className="explorer-empty">No columns found.</div>
      ) : (
        <table className="schema-table">
          <thead>
            <tr>
              <th>Column</th>
              <th>Type</th>
              <th>Nullable</th>
            </tr>
          </thead>

          <tbody>
            {columns.map(column => (
              <tr key={`${column.ordinal_position}-${column.name}`}>
                <td>{column.name}</td>
                <td><code>{column.data_type}</code></td>
                <td>{column.is_nullable ? "YES" : "NO"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
