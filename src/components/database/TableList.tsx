import { Table2 } from "lucide-react";

import type { TableInfo } from "../../types/explorer";

interface Props {
  tables: TableInfo[];
  selected: TableInfo | null;
  loading: boolean;
  emptyMessage: string;
  onSelect: (table: TableInfo) => void;
}

export default function TableList({
  tables,
  selected,
  loading,
  emptyMessage,
  onSelect
}: Props) {
  if (loading) {
    return <div className="explorer-empty">Loading tables...</div>;
  }

  if (tables.length === 0) {
    return <div className="explorer-empty">{emptyMessage}</div>;
  }

  return (
    <div className="table-list">
      {tables.map(table => {
        const active =
          selected?.name === table.name &&
          selected?.schema === table.schema;

        return (
          <button
            key={`${table.schema}.${table.name}`}
            className={`table-item ${active ? "active" : ""}`}
            onClick={() => onSelect(table)}
          >
            <Table2 size={15} />

            <span className="table-name">{table.name}</span>

            {table.schema !== "iox" && (
              <span className="schema-badge">{table.schema}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
