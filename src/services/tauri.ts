import { invoke } from "@tauri-apps/api/core";

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
    invoke<any>("list_databases", {
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
    })
};
