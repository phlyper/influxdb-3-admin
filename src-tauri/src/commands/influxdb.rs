use crate::{
    influxdb::client::InfluxClient,
    models::explorer::{ColumnInfo, TableInfo},
};

#[tauri::command]
pub async fn test_connection(url: String, token: String) -> Result<String, String> {
    let client = InfluxClient::new(url, token);
    client.test_connection().await
}

#[tauri::command]
pub async fn list_databases(url: String, token: String) -> Result<Vec<String>, String> {
    let client = InfluxClient::new(url, token);

    client.database_names().await
}

#[tauri::command]
pub async fn create_database(url: String, token: String, name: String) -> Result<String, String> {
    if name.trim().is_empty() {
        return Err("Database name is required".into());
    }

    let client = InfluxClient::new(url, token);
    client.create_database(name).await
}

#[tauri::command]
pub async fn delete_database(url: String, token: String, name: String) -> Result<String, String> {
    if name.trim().is_empty() {
        return Err("Database name is required".into());
    }

    let client = InfluxClient::new(url, token);
    client.delete_database(name).await
}

#[tauri::command]
pub async fn execute_sql(
    url: String,
    token: String,
    database: String,
    query: String,
) -> Result<String, String> {
    if database.trim().is_empty() {
        return Err("Database name is required".into());
    }

    if query.trim().is_empty() {
        return Err("SQL query is empty".into());
    }

    let client = InfluxClient::new(url, token);
    client.query_sql(database, query).await
}

#[tauri::command]
pub async fn list_tables(
    url: String,
    token: String,
    database: String,
) -> Result<Vec<TableInfo>, String> {
    if database.trim().is_empty() {
        return Err("Database name is required".into());
    }

    let client = InfluxClient::new(url, token);
    client.tables(database).await
}

#[tauri::command]
pub async fn get_table_columns(
    url: String,
    token: String,
    database: String,
    schema: String,
    table: String,
) -> Result<Vec<ColumnInfo>, String> {
    if database.trim().is_empty() {
        return Err("Database name is required".into());
    }

    if schema.trim().is_empty() {
        return Err("Table schema is required".into());
    }

    if table.trim().is_empty() {
        return Err("Table name is required".into());
    }

    let client = InfluxClient::new(url, token);
    client.table_columns(database, schema, table).await
}
