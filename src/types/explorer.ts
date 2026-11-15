export interface TableInfo {
  name: string;
  schema: string;
  table_type: string;
}

export interface ColumnInfo {
  name: string;
  data_type: string;
  is_nullable: boolean;
  ordinal_position: number;
}
