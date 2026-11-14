L'erreur est identifiée ! Ce n'est pas un problème Rust ni TypeScript. Tauri ne trouve pas les icônes déclarées dans tauri.conf.json.

Le fichier manquant est :


text
src-tauri/icons/32x32.png
1. Solution recommandée : générer les icônes automatiquement
À la racine du projet InfluxAdmin, installe l'outil Tauri Icon :


bash
npm install -D @tauri-apps/cli
Prépare une image source carrée au format PNG, idéalement 1024x1024 :


text
assets/icon.png
Puis exécute :


bash
npx tauri icon assets/icon.png
Tauri va générer automatiquement les icônes nécessaires dans :


text
src-tauri/icons/
├── 32x32.png
├── 128x128.png
├── 128x128@2x.png
├── icon.png
├── icon.icns
└── icon.ico
2. Vérifier ta configuration Tauri
Dans src-tauri/tauri.conf.json, conserve :


json
"bundle": {
  "active": true,
  "targets": ["appimage", "deb", "nsis", "msi"],
  "icon": [
    "icons/32x32.png",
    "icons/128x128.png",
    "icons/128x128@2x.png",
    "icons/icon.png"
  ]
}
Attention : les chemins sont relatifs au dossier src-tauri.

3. Ajouter les icônes dans Git
Très important pour ton workflow GitHub Actions :


bash
git add src-tauri/icons/
git add src-tauri/tauri.conf.json

git commit -m "fix: add Tauri application icons"
git push
Ne mets surtout pas src-tauri/icons/ dans ton .gitignore.

4. Relancer la compilation

bash
npm run tauri build
Ou relance ton workflow GitHub Actions.

Correction attendue
L'erreur failed to open icon devrait disparaître.

5. Une suggestion pour InfluxAdmin
Je te recommande de créer une véritable identité visuelle pour l'application :

Turquoise Database line icon isolated on blue background. Network databases, disc with progress bar. Backup concept. Vector Illustration
 
InfluxAdmin

Application icon

Logo bleu turquoise, base de données stylisée, fond sombre.

Cela permettra d'avoir une icône cohérente sur Linux, Windows, dans la barre des tâches et dans les installateurs.
