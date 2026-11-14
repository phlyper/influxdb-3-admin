# InfluxDB Admin v3

# influxdb-3-admin
influxdb-3-admin

### Installation et compilation sur Linux

Sur Ubuntu/Debian, installer les dépendances système :

```sh
sudo apt update

sudo apt install -y \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libwebkit2gtk-4.1-dev \
  patchelf \
  pkg-config \
  libsecret-1-dev
```

Installer Node.js et Rust si nécessaire :

```sh
# Rust
curl https://sh.rustup.rs -sSf | sh

source "$HOME/.cargo/env"

# Vérification
rustc --version
cargo --version
node --version
npm --version
```
Créer le projet :
```sh
mkdir influxadmin
cd influxadmin

npm create vite@latest . -- --template react-ts

npm install

npm install @tauri-apps/api \
  lucide-react zustand \
  @monaco-editor/react recharts sonner

npm install -D @tauri-apps/cli

npm install @tailwindcss/vite tailwindcss

npm run tauri init
```
Après avoir intégré les fichiers précédents, démarrer le développement :
```
npm run tauri dev
```
Compilation des paquets Linux :
```
npm run tauri build
```
Les artefacts seront produits dans :
```
src-tauri/target/release/bundle/
├── appimage/
│   └── InfluxAdmin_0.1.0_amd64.AppImage
└── deb/
    └── influxadmin_0.1.0_amd64.deb
```

tauri.conf.json
"bundle": {
  "active": true,
  "targets": ["all"]
}
