influxadmin/
│
├── README.md
├── LICENSE
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── StatusBar.tsx
│   │   │
│   │   ├── connections/
│   │   │   ├── ConnectionList.tsx
│   │   │   └── ConnectionDialog.tsx
│   │   │
│   │   ├── database/
│   │   │   ├── DatabaseList.tsx
│   │   │   └── DatabaseDialog.tsx
│   │   │
│   │   └── sql/
│   │       ├── SqlEditor.tsx
│   │       └── QueryResults.tsx
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Connections.tsx
│   │   ├── Databases.tsx
│   │   ├── SqlWorkbench.tsx
│   │   ├── Tokens.tsx
│   │   └── Settings.tsx
│   │
│   ├── services/
│   │   └── tauri.ts
│   │
│   ├── stores/
│   │   └── connectionStore.ts
│   │
│   └── types/
│       └── index.ts
│
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json
│   │
│   └── src/
│       ├── main.rs
│       ├── lib.rs
│       │
│       ├── commands/
│       │   ├── connections.rs
│       │   ├── databases.rs
│       │   └── queries.rs
│       │
│       ├── influxdb/
│       │   ├── client.rs
│       │   ├── database.rs
│       │   ├── query.rs
│       │   └── health.rs
│       │
│       ├── models/
│       │   └── connection.rs
│       │
│       └── storage/
│           ├── database.rs
│           └── secrets.rs
│
└── icons/
