# AGENTS.md

## Project

InfluxAdmin is a Tauri 2 desktop app for administering InfluxDB 3 Core. The frontend is React 19 + TypeScript + Vite (`src/`); the backend is Rust (`src-tauri/`). There is no app server: all InfluxDB access goes through Rust commands over Tauri IPC.

## Commands

- `npm run tauri:dev` — run the full desktop app (Vite + Rust). Use this when testing IPC.
- `npm run dev` — browser-only Vite dev server on `127.0.0.1:1420`; Tauri `invoke` calls do not work here.
- `npm run build` — frontend check/build (`tsc && vite build`).
- `cargo check --manifest-path src-tauri/Cargo.toml` — backend check.
- `npm run tauri build` — build desktop bundles into `src-tauri/target/release/bundle/`.

There is no test, lint, or formatter script configured. Do not assume a test suite exists.

## Architecture and wiring

- InfluxDB Tauri commands live in `src-tauri/src/lib.rs` and must be added to `tauri::generate_handler!` there. SSH commands live in `src-tauri/src/commands/ssh.rs` and are also registered in `lib.rs`.
- Frontend IPC wrappers are `src/services/tauri.ts` (InfluxDB) and `src/services/ssh.ts` (SSH). When adding or renaming a command, update Rust registration and the wrapper together; keep `invoke` names and argument keys in sync.
- InfluxDB HTTP logic is centralized in `src-tauri/src/influxdb/client.rs`. It targets InfluxDB 3 Core endpoints (`/health`, `/api/v3/configure/database`, `/api/v3/query_sql`) and SQL, not Flux or InfluxDB v1/v2 APIs.
- `src/App.tsx` holds the entire UI state machine. There is no router or `pages/` directory; sidebar entries other than connections are placeholders.
- Connections and tokens are in-memory only. SQLite/keyring persistence is planned but not implemented, despite unused Rust dependencies in `Cargo.toml`.
- SSH tunnels spawn the system `ssh` binary. Password auth is unsupported, and `BatchMode=yes` plus `StrictHostKeyChecking=yes` mean the host key must already be in `known_hosts`. Tunnels bind `127.0.0.1` and are stopped on app exit.
- `src-tauri/capabilities/default.json` grants only `core:default`; update it when adding Tauri plugins.

## Styling and config

- Styling is plain CSS in `src/index.css`. Tailwind is listed as a dependency but is not wired into Vite, so Tailwind utility classes will not take effect unless you configure it.
- The Vite port is fixed at `1420` (`strictPort`) and must stay in sync with `devUrl` in `src-tauri/tauri.conf.json`.
- Linux build prerequisites are documented in `readme.md` and the CI workflows (`libwebkit2gtk-4.1-dev`, etc.).

## CI and stale docs

- `.github/workflows/` builds the web app and Linux/Windows desktop bundles on pushes to `main`, `master`, or `develop`. `release.yml` runs on `v*` tags or `release*` branches and publishes the bundles.
- `.opencode/structure.md` and `.opencode/sprint-*.md` are planning transcripts. They describe files and features that do not exist; trust the code and config over those documents.

---------------------------------------------


# AGENTS.md - InfluxAdmin

## 1. Project Overview

InfluxAdmin is a cross-platform desktop administration application
for InfluxDB 3 Core.

The application is designed to provide an advanced administration
experience inspired by pgAdmin, DBeaver and DataGrip.

### Main objectives

- Manage multiple InfluxDB 3 Core servers.
- Connect directly or through SSH tunnels.
- Explore databases and tables.
- Execute SQL queries.
- Manage database resources.
- Monitor server health and metrics.
- Manage connection profiles.
- Provide a modern dark desktop interface.
- Support Windows and Linux distributions.

### Technology stack

Backend:
- Rust
- Tauri 2
- Tokio
- Serde
- Reqwest
- SQLite

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS or existing project CSS
- Lucide React
- Tauri JavaScript API

Distribution:
- Windows: ZIP and EXE
- Debian/Ubuntu: DEB
- Fedora/RHEL: RPM

Target database:
- InfluxDB 3 Core

IMPORTANT:
Always verify API compatibility with InfluxDB 3 Core.
Do not assume InfluxDB 1.x or 2.x APIs are compatible.

---

## 2. Development Principles

Claude must follow these rules:

1. Inspect the existing project before modifying files.
2. Preserve existing functionality.
3. Avoid unnecessary architectural changes.
4. Never duplicate Tauri commands.
5. Keep Rust backend logic separate from command handlers.
6. Keep React components modular.
7. Use TypeScript strict typing.
8. Handle errors explicitly.
9. Never hardcode credentials.
10. Never expose authentication tokens in logs.
11. Never silently ignore errors.
12. Prefer maintainable and testable code.
13. Avoid unnecessary dependencies.
14. Do not introduce breaking changes without explanation.

Before modifying a file:
- Read the current implementation.
- Understand its dependencies.
- Check its imports and exports.
- Verify its callers.

After modifying a file:
- Run TypeScript build.
- Run Rust cargo check.
- Fix all errors introduced by the changes.

Do not replace complete files unnecessarily.

---

## 3. Project Architecture

Expected architecture:

influx-admin/
│
├── AGENTS.md
├── package.json
├── vite.config.ts
├── tsconfig.json
│
├── .github/
│   └── workflows/
│       └── release.yml
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   │
│   ├── components/
│   │   ├── connections/
│   │   │   ├── ConnectionManager.tsx
│   │   │   ├── ConnectionForm.tsx
│   │   │   └── SshTunnelForm.tsx
│   │   │
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── database/
│   │   ├── tables/
│   │   ├── query/
│   │   ├── monitoring/
│   │   └── settings/
│   │
│   ├── services/
│   │   ├── influxdb.ts
│   │   ├── ssh.ts
│   │   └── connections.ts
│   │
│   ├── hooks/
│   ├── types/
│   └── utils/
│
└── src-tauri/
    ├── Cargo.toml
    ├── tauri.conf.json
    │
    └── src/
        ├── main.rs
        ├── lib.rs
        │
        ├── commands/
        │   ├── mod.rs
        │   ├── ssh.rs
        │   ├── influxdb.rs
        │   └── connections.rs
        │
        ├── influxdb/
        │   ├── mod.rs
        │   └── client.rs
        │
        ├── ssh/
        │   ├── mod.rs
        │   ├── manager.rs
        │   └── tunnel.rs
        │
        ├── models/
        │   ├── mod.rs
        │   ├── ssh.rs
        │   └── connection.rs
        │
        ├── database/
        └── security/

This architecture is the target.
If the actual project differs, inspect it first and adapt carefully.

---

## 4. Backend Rules - Rust

### General

Use:
- Rust stable
- Tokio for asynchronous operations
- Serde for serialization
- Reqwest for HTTP communication
- Thiserror or anyhow where appropriate
- SQLx or rusqlite for SQLite, according to the existing project

Avoid:
- Blocking operations inside async functions.
- Unnecessary unsafe code.
- Unhandled unwrap() and expect().
- Global mutable state.

### Tauri commands

All Tauri commands must be defined in dedicated modules.

Example:

commands/ssh.rs
commands/influxdb.rs
commands/connections.rs

lib.rs must only register commands and initialize application state.

Example:

.invoke_handler(tauri::generate_handler![
    commands::ssh::start_ssh_tunnel,
    commands::ssh::stop_ssh_tunnel,
    commands::influxdb::test_connection,
])

IMPORTANT:
Never define the same #[tauri::command] function twice.

### Error handling

Return Result<T, String> for simple Tauri command interfaces.

For internal services, prefer structured error types.

Never return internal secrets in error messages.

---

## 5. InfluxDB 3 Core Integration

The application must target InfluxDB 3 Core.

### Required functionality

Connection:
- Test server connectivity.
- Validate authentication.
- Retrieve server health.
- Support multiple servers.
- Support HTTP and HTTPS.

Database management:
- List databases.
- Create databases.
- Delete databases where supported.
- Display database information.

SQL:
- Execute SQL queries.
- Display query results.
- Handle query errors.
- Support large result sets.
- Provide query execution time.

Administration:
- Explore tables.
- Inspect schemas.
- Display columns and data types.
- Manage supported resources.

Monitoring:
- Server health.
- Query performance.
- Database information.
- Connection status.

### Compatibility rules

Before implementing any InfluxDB endpoint:

1. Verify that the endpoint exists in InfluxDB 3 Core.
2. Verify its HTTP method.
3. Verify request parameters.
4. Verify authentication requirements.
5. Verify response format.
6. Check version-specific limitations.

Do not assume that every InfluxDB Enterprise or Cloud feature
is available in InfluxDB 3 Core.

Do not invent administration endpoints.

---

## 6. SSH Tunnel Management

SSH tunneling is a core feature.

### Requirements

Support:
- Multiple simultaneous tunnels.
- SSH host and port.
- SSH username.
- Private key authentication.
- SSH agent authentication where supported.
- Local forwarding.
- Remote InfluxDB destination.
- Tunnel start and stop.
- Tunnel status.
- Automatic cleanup.

### Architecture

ssh/
├── manager.rs
├── tunnel.rs
└── mod.rs

The manager is responsible for:
- Process lifecycle.
- Tunnel registry.
- Start and stop operations.
- Health checks.
- Cleanup.

The tunnel module is responsible for:
- Tunnel configuration.
- Port validation.
- Endpoint generation.

### SSH security

Mandatory rules:

- Never disable host key verification in production.
- Use known_hosts.
- Never log private keys.
- Never store private keys in SQLite.
- Never expose SSH credentials to React unnecessarily.
- Validate local port availability.
- Avoid shell command interpolation.
- Use safe process argument handling.
- Handle child process termination.
- Clean up tunnels on application shutdown.

Do not use StrictHostKeyChecking=no as a production default.

### Tunnel connection workflow

1. Validate SSH configuration.
2. Start SSH tunnel.
3. Verify local TCP forwarding.
4. Build local InfluxDB URL.
5. Test InfluxDB authentication.
6. Register active connection.
7. Monitor tunnel status.
8. Stop tunnel when disconnected.

SSH connection state and InfluxDB connection state
must remain separate.

---

## 7. Frontend Rules - React and TypeScript

### General

Use functional React components.

Use hooks for local component state.

Avoid:
- Any type where a real type can be defined.
- Large components containing unrelated functionality.
- Duplicate API calls.
- Direct access to backend internals.
- Hardcoded server credentials.

### Component organization

Each component should have a clear responsibility.

Examples:

ConnectionManager:
Manages connection modes.

ConnectionForm:
Manages direct InfluxDB connections.

SshTunnelForm:
Manages SSH configuration.

DatabaseExplorer:
Displays databases and tables.

QueryEditor:
Provides SQL editing and execution.

MonitoringDashboard:
Displays monitoring information.

### Backend communication

Use the Tauri API:

import { invoke } from "@tauri-apps/api/core";

Example:

const result = await invoke(
  "test_connection",
  {
    url,
    token
  }
);

All calls must:
- Handle loading states.
- Handle errors.
- Validate user input.
- Avoid exposing sensitive data.
- Use correctly typed responses.

### UI design

Design inspiration:
- DataGrip
- pgAdmin
- DBeaver

Visual direction:
- Dark theme.
- Professional desktop interface.
- Compact administration panels.
- Clear navigation.
- Consistent spacing.
- Accessible controls.

Suggested colors:

Background: #11151D
Sidebar: #171C26
Panel: #1B2230
Border: #303746
Primary: #0D9488
Accent: #2DD4BF
Text: #E5E7EB
Secondary: #929BAA
Error: #EF4444
Success: #22C55E

Use consistent styles throughout the application.

---

## 8. Connection Management

The application must support multiple server profiles.

Each profile should contain:

- Unique identifier.
- Connection name.
- InfluxDB URL.
- Authentication reference.
- Connection type.
- SSH configuration reference.
- Creation date.
- Last connection date.

Connection types:

- Direct
- SSH Tunnel

Credentials must be stored separately from ordinary connection metadata.

Use the operating system credential manager where possible.

Recommended:
- Windows Credential Manager.
- Linux Secret Service.
- macOS Keychain.

Never store API tokens in plaintext SQLite fields.

---

## 9. SQLite Persistence

SQLite is used for application metadata.

Recommended tables:

connections:
- id
- name
- url
- connection_type
- credential_reference
- created_at
- updated_at

ssh_profiles:
- id
- connection_id
- host
- port
- username
- private_key_reference
- local_port
- remote_host
- remote_port

settings:
- key
- value

Do not store:
- Plaintext InfluxDB tokens.
- Private SSH keys.
- Passwords.

Implement database migrations.

Use transactions for operations that modify multiple records.

---

## 10. Distribution and Build

The application uses Tauri 2.

Supported targets:

Windows:
- ZIP
- EXE

Linux:
- DEB
- RPM

Release automation:
.github/workflows/release.yml

Requirements:
- Build for each platform.
- Use appropriate platform runners.
- Publish only approved artifacts.
- Keep release assets clearly named.
- Do not publish intermediate build files.

Before changing release workflows:
- Inspect existing workflow.
- Check artifact paths.
- Verify Tauri bundle configuration.
- Ensure generated files exist.

---

## 11. Testing Requirements

Rust:

cargo check
cargo test

Frontend:

npm run build

Tauri development:

npm run tauri dev

Test at least:

- Direct connection.
- Invalid InfluxDB token.
- Unavailable InfluxDB server.
- SSH connection.
- SSH authentication failure.
- SSH host key mismatch.
- Local port conflict.
- Tunnel termination.
- Multiple simultaneous connections.
- Application shutdown.
- Invalid SQL.
- Empty database list.

Never claim a feature is tested if it was not actually tested.

---

## 12. Development Workflow for Claude

For every task, follow this process:

### Step 1 - Understand

Inspect relevant files.

Identify:
- Existing implementation.
- Dependencies.
- Related components.
- Existing commands.
- Potential breaking changes.

### Step 2 - Plan

Explain briefly:
- Files to modify.
- New files required.
- Dependencies required.
- Risks and compatibility issues.

### Step 3 - Implement

Make the smallest coherent changes.

Preserve existing code where possible.

Follow established conventions.

### Step 4 - Validate

Run:

npm run build

cd src-tauri
cargo check

Run relevant tests if available.

### Step 5 - Report

Summarize:
- Files modified.
- Features implemented.
- Dependencies added.
- Commands executed.
- Build status.
- Remaining limitations.

If compilation fails:
- Identify the exact error.
- Fix the root cause.
- Do not hide errors.
- Do not claim success prematurely.

---

## 13. Important Rules

Claude must NEVER:

- Replace working architecture without justification.
- Invent InfluxDB 3 Core endpoints.
- Duplicate Tauri commands.
- Disable SSH host verification.
- Store credentials in plaintext.
- Introduce unnecessary dependencies.
- Remove existing features without permission.
- Ignore TypeScript or Rust compiler errors.
- Claim successful compilation without checking.
- Change release artifact naming without checking CI.

Claude should always:

- Prefer small, maintainable changes.
- Keep frontend and backend contracts synchronized.
- Use explicit types.
- Document complex functionality.
- Validate security-sensitive operations.
- Preserve cross-platform compatibility.
- Explain breaking changes before implementing them.

---

## 14. Current Development Priorities

Suggested implementation roadmap:

### Phase 1 - Foundation

- [x] Tauri 2 initialization.
- [x] React frontend.
- [x] Dark interface.
- [x] Basic InfluxDB client.
- [x] SSH tunnel manager initial implementation.
- [ ] Stabilize Rust architecture.
- [ ] Complete TypeScript interfaces.

### Phase 2 - Connections

- [ ] Direct connection form.
- [ ] SSH connection form.
- [ ] Connection manager.
- [ ] Multi-server support.
- [ ] SQLite persistence.
- [ ] Secure credential storage.
- [ ] Connection reconnection.

### Phase 3 - Database Explorer

- [ ] Database listing.
- [ ] Database creation.
- [ ] Database deletion.
- [ ] Table explorer.
- [ ] Schema inspection.
- [ ] Column information.

### Phase 4 - SQL Workbench

- [ ] SQL editor.
- [ ] Syntax highlighting.
- [ ] Query execution.
- [ ] Results grid.
- [ ] Query history.
- [ ] Query export.
- [ ] Query execution timing.

### Phase 5 - Administration

- [ ] Server health.
- [ ] Monitoring dashboard.
- [ ] Token administration where supported.
- [ ] Server configuration inspection.
- [ ] Advanced database operations.

### Phase 6 - Distribution

- [ ] Windows ZIP.
- [ ] Windows EXE.
- [ ] Linux DEB.
- [ ] Linux RPM.
- [ ] Automated GitHub releases.
- [ ] Cross-platform testing.

---

## 15. Final Instruction

You are working on InfluxAdmin, a real desktop administration
application for InfluxDB 3 Core.

Your priority is to deliver reliable, secure, maintainable,
and production-quality software.

Do not implement features just to make the interface look complete.

Every visible feature must have a real backend implementation
or be clearly identified as a placeholder.

Always inspect the existing code before making changes.

When requirements are ambiguous, ask for clarification
instead of making potentially destructive assumptions.

Preserve backward compatibility whenever possible.
