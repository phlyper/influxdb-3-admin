CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    connection_type TEXT NOT NULL CHECK (connection_type IN ('direct', 'ssh')),
    credential_reference TEXT NOT NULL,
    has_token INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ssh_profiles (
    connection_id TEXT PRIMARY KEY NOT NULL
        REFERENCES connections(id) ON DELETE CASCADE,
    ssh_host TEXT NOT NULL,
    ssh_port INTEGER NOT NULL,
    ssh_username TEXT NOT NULL,
    private_key_path TEXT,
    auth_method TEXT NOT NULL DEFAULT 'key',
    has_password INTEGER NOT NULL DEFAULT 0,
    remote_host TEXT NOT NULL,
    remote_port INTEGER NOT NULL,
    local_port INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_connections_name
    ON connections(name);
