use reqwest::{Client, Method};
use serde_json::Value;

use crate::models::explorer::{ColumnInfo, TableInfo};

#[derive(Clone)]
pub struct InfluxClient {
    pub base_url: String,
    pub token: String,
    http: Client,
}

impl InfluxClient {
    pub fn new(url: String, token: String) -> Self {
        Self {
            base_url: url.trim_end_matches('/').to_string(),
            token,
            http: Client::new(),
        }
    }

    async fn request(
        &self,
        method: Method,
        path: &str,
        body: Option<Value>,
    ) -> Result<String, String> {
        let url = format!("{}{}", self.base_url, path);

        let mut request = self.http
            .request(method, url)
            .bearer_auth(&self.token);

        if let Some(json) = body {
            request = request.json(&json);
        }

        let response = request.send().await
            .map_err(|e| format!("Connection error: {e}"))?;

        let status = response.status();
        let content = response.text().await
            .map_err(|e| e.to_string())?;

        if !status.is_success() {
            return Err(format!(
                "InfluxDB error {}: {}",
                status, content
            ));
        }

        Ok(content)
    }

    pub async fn health(&self) -> Result<String, String> {
        self.request(
            Method::GET,
            "/health",
            None
        ).await
    }

    /// Checks both server reachability and token authentication.
    pub async fn test_connection(&self) -> Result<String, String> {
        let health = self.health().await?;

        // /health is unauthenticated, so perform one authenticated request
        // to validate the token.
        self.databases().await?;

        Ok(health)
    }

    pub async fn databases(&self) -> Result<String, String> {
        self.request(
            Method::GET,
            "/api/v3/configure/database?format=json",
            None
        ).await
    }

    pub async fn database_names(&self) -> Result<Vec<String>, String> {
        let raw = self.databases().await?;

        if raw.trim().is_empty() {
            return Ok(Vec::new());
        }

        let value: Value = serde_json::from_str(&raw)
            .map_err(|e| format!("Invalid database list response: {e}"))?;

        let rows = value.as_array()
            .ok_or_else(|| "Unexpected database list response".to_string())?;

        Ok(rows.iter()
            .filter_map(|row| row.get("iox::database").and_then(Value::as_str))
            .map(str::to_string)
            .collect())
    }

    pub async fn create_database(
        &self,
        name: String
    ) -> Result<String, String> {
        self.request(
            Method::POST,
            "/api/v3/configure/database",
            Some(serde_json::json!({
                "db": name
            }))
        ).await
    }

    pub async fn delete_database(
        &self,
        name: String
    ) -> Result<String, String> {
        let path = format!(
            "/api/v3/configure/database?db={}",
            url::form_urlencoded::byte_serialize(
                name.as_bytes()
            ).collect::<String>()
        );

        self.request(
            Method::DELETE,
            &path,
            None
        ).await
    }

    pub async fn query_sql(
        &self,
        database: String,
        query: String
    ) -> Result<String, String> {
        self.request(
            Method::POST,
            "/api/v3/query_sql",
            Some(serde_json::json!({
                "db": database,
                "q": query,
                "format": "jsonl"
            }))
        ).await
    }

    pub async fn query_rows(
        &self,
        database: String,
        query: String
    ) -> Result<Vec<Value>, String> {
        let raw = self.request(
            Method::POST,
            "/api/v3/query_sql",
            Some(serde_json::json!({
                "db": database,
                "q": query,
                "format": "json"
            }))
        ).await?;

        if raw.trim().is_empty() {
            return Ok(Vec::new());
        }

        let value: Value = serde_json::from_str(&raw)
            .map_err(|e| format!("Invalid query response: {e}"))?;

        match value {
            Value::Array(rows) => Ok(rows),
            _ => Err("Unexpected query response: expected a JSON array".into()),
        }
    }

    pub async fn tables(&self, database: String) -> Result<Vec<TableInfo>, String> {
        let rows = self.query_rows(database, "SHOW TABLES".to_string()).await?;

        Ok(rows.iter()
            .filter_map(|row| {
                let name = row.get("table_name")?.as_str()?.to_string();
                let schema = row.get("table_schema")?.as_str()?.to_string();
                let table_type = row.get("table_type")
                    .and_then(Value::as_str)
                    .unwrap_or("BASE TABLE")
                    .to_string();

                Some(TableInfo {
                    name,
                    schema,
                    table_type,
                })
            })
            .collect())
    }

    pub async fn table_columns(
        &self,
        database: String,
        schema: String,
        table: String,
    ) -> Result<Vec<ColumnInfo>, String> {
        if schema.trim().is_empty() {
            return Err("Table schema is required".into());
        }

        if table.trim().is_empty() {
            return Err("Table name is required".into());
        }

        let schema = escape_sql_literal(&schema);
        let table = escape_sql_literal(&table);

        let query = format!(
            "SELECT column_name, data_type, is_nullable, ordinal_position \
             FROM information_schema.columns \
             WHERE table_schema = '{schema}' AND table_name = '{table}' \
             ORDER BY ordinal_position"
        );

        let rows = self.query_rows(database, query).await?;

        Ok(rows.iter()
            .filter_map(|row| {
                let name = row.get("column_name")?.as_str()?.to_string();
                let data_type = row.get("data_type")
                    .and_then(Value::as_str)
                    .unwrap_or("Unknown")
                    .to_string();
                let is_nullable = row.get("is_nullable")
                    .and_then(Value::as_str)
                    .map(|value| value.eq_ignore_ascii_case("YES"))
                    .unwrap_or(false);
                let ordinal_position = row.get("ordinal_position")
                    .and_then(Value::as_i64)
                    .unwrap_or(0);

                Some(ColumnInfo {
                    name,
                    data_type,
                    is_nullable,
                    ordinal_position,
                })
            })
            .collect())
    }
}

fn escape_sql_literal(value: &str) -> String {
    value.replace('\'', "''")
}
