comment avoir un build pour windows

Oui ! InfluxAdmin avec Tauri 2 + Rust + React peut être compilé pour Windows, même si tu développes actuellement sur Linux.

Tauri permet de produire des installateurs Windows .exe et .msi.

Je te recommande de prévoir trois formats de distribution :

Plateforme

Format

Linux

.AppImage

Debian / Ubuntu

.deb

Windows

.msi et .exe

1. Deux méthodes pour compiler Windows
Méthode A — Depuis Windows : installer Rust, Node.js et les dépendances Tauri sur Windows. C'est la méthode la plus fiable.

Méthode B — Depuis Linux : utiliser une compilation croisée avec une chaîne de compilation Windows. C'est possible, mais plus complexe, notamment pour WebView2 et les dépendances natives.

Je recommande la méthode A pour commencer.

2. Préparer Windows
Sur ton PC Windows 10 ou 11, installe les composants suivants :

Microsoft Visual Studio Build Tools : sélectionner Desktop development with C++.

Télécharger 

Microsoft Edge WebView2 Runtime : nécessaire pour l'interface Tauri.

Télécharger 

Rust :

Installer Rust 

Node.js :

Installer Node.js 

Pour générer également le MSI, active la fonctionnalité Windows VBScript si elle est désactivée. 

Tauri
+2

3. Configurer InfluxAdmin pour Windows
Dans src-tauri/tauri.conf.json, remplace la configuration des targets par :


json
"bundle": {
  "active": true,
  "targets": ["nsis", "msi"],
  "category": "DeveloperTool",
  "shortDescription": "InfluxDB 3 Core Administration",
  "icon": [
    "icons/32x32.png",
    "icons/128x128.png",
    "icons/128x128@2x.png",
    "icons/icon.png"
  ]
}
Tu peux conserver une configuration commune pour Linux et Windows : Tauri produira uniquement les formats compatibles avec le système de compilation.

4. Compiler InfluxAdmin
Ouvre PowerShell dans le dossier du projet :


powershell
# Vérifier les outils
rustc --version
cargo --version
node --version
npm --version

# Installer les dépendances
npm install

# Compiler l'application
npm run tauri build
Résultat attendu
Tu obtiendras les installateurs dans :


text
src-tauri/
└── target/
    └── release/
        └── bundle/
            ├── msi/
            │   └── InfluxAdmin_0.1.0_x64_en-US.msi
            │
            └── nsis/
                └── InfluxAdmin_0.1.0_x64-setup.exe
Les noms précis peuvent varier selon la configuration. 

Tauri
+1

5. Encore mieux : compiler automatiquement avec GitHub Actions
Je te conseille cette solution pour InfluxAdmin : chaque publication de version pourra générer automatiquement les builds Linux et Windows.

Pipeline de compilation
GitHub

Code source

Release

Nouvelle version

Ubuntu Runner

AppImage + DEB

Windows Runner

EXE + MSI

GitHub Releases

Tous les installateurs disponibles au téléchargement

Voici un workflow de départ :

.github/workflows/build.yml


yaml

name: InfluxAdmin Build

on:
  push:
    tags:
      - "v*"
  workflow_dispatch:

jobs:
  build:
    strategy:
      matrix:
        include:
          - os: ubuntu-22.04
            args: --bundles appimage,deb
          - os: windows-latest
            args: --bundles nsis,msi

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Install Node
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install Linux dependencies
        if: runner.os == 'Linux'
        run: |
          sudo apt-get update
          sudo apt-get install -y \
            libwebkit2gtk-4.1-dev \
            build-essential \
            curl \
            wget \
            file \
            libxdo-dev \
            libssl-dev \
            librsvg2-dev \
            patchelf \
            libayatana-appindicator3-dev

      - name: Install frontend dependencies
        run: npm ci

      - name: Build application
        run: npm run tauri build -- ${{ matrix.args }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: influxadmin-${{ matrix.os }}
          path: src-tauri/target/release/bundle/**
Ce workflow est une base de compilation. Pour les MSI, vérifie que WiX et VBScript sont disponibles sur le runner Windows utilisé.

Documentation : Tauri — Distribution .

6. Une dernière recommandation pour InfluxAdmin
Je choisirais cette organisation :

Développement quotidien sur Linux.

Tests fonctionnels sur Linux et Windows.

Compilation locale Linux pour AppImage et DEB.

Compilation Windows via GitHub Actions pour MSI et EXE.

Publication des quatre formats dans GitHub Releases.

Petite question : tu souhaites que nous préparions maintenant le workflow GitHub Actions complet avec compilation automatique des quatre formats, ou préfères-tu d'abord tester une compilation Windows locale ?
