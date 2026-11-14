use reqwest::{Client, Method};
use serde_json::Value;

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

    pub async fn databases(&self) -> Result<String, String> {
        self.request(
            Method::GET,
            "/api/v3/configure/database?format=json",
            None
        ).await
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
}
