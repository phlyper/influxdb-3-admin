import { invoke } from "@tauri-apps/api/core";

import type {
  ConnectionProfile,
  SaveConnectionInput
} from "../types/connections";
import type { ColumnInfo, TableInfo } from "../types/explorer";

export interface Connection {
  id: string;
  name: string;
  url: string;
  token: string;
}

export const influxApi = {
  test: (connection: Connection) =>
    invoke<string>("test_connection", {
      url: connection.url,
      token: connection.token
    }),

  databases: (connection: Connection) =>
    invoke<string[]>("list_databases", {
      url: connection.url,
      token: connection.token
    }),

  createDatabase: (
    connection: Connection,
    name: string
  ) =>
    invoke<string>("create_database", {
      url: connection.url,
      token: connection.token,
      name
    }),

  deleteDatabase: (
    connection: Connection,
    name: string
  ) =>
    invoke<string>("delete_database", {
      url: connection.url,
      token: connection.token,
      name
    }),

  query: (
    connection: Connection,
    database: string,
    query: string
  ) =>
    invoke<string>("execute_sql", {
      url: connection.url,
      token: connection.token,
      database,
      query
    }),

  tables: (
    connection: Connection,
    database: string
  ) =>
    invoke<TableInfo[]>("list_tables", {
      url: connection.url,
      token: connection.token,
      database
    }),

  columns: (
    connection: Connection,
    database: string,
    schema: string,
    table: string
  ) =>
    invoke<ColumnInfo[]>("get_table_columns", {
      url: connection.url,
      token: connection.token,
      database,
      schema,
      table
    })
};

export const connectionApi = {
  list: () =>
    invoke<ConnectionProfile[]>("list_connection_profiles"),

  save: (input: SaveConnectionInput) =>
    invoke<ConnectionProfile>("save_connection_profile", { input }),

  remove: (id: string) =>
    invoke<void>("delete_connection_profile", { id }),

  token: (id: string) =>
    invoke<string>("get_connection_token", { id })
};
