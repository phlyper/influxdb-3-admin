Définissons le projet InfluxAdmin en Rust. Mes choix : Design : Dark — style pgAdmin / DataGrip ; Framework : Tauri 2 + React ; Connexions : Multi-serveurs ; Périmètre : Toutes les fonctionnalités avancées ; Distribution : AppImage + DEB. Prépare le squelette complet du projet, les dépendances Rust et React, l'architecture et la première version fonctionnelle.


Se connecter
Inscription gratuite
cherche moi des outil de gestions pour influxdb v3

J'ai recherché les outils disponibles pour administrer, gérer, superviser et exploiter InfluxDB 3. Il existe plusieurs solutions, mais attention : certains outils compatibles avec InfluxDB 1 et 2 ne sont pas réellement compatibles avec toutes les fonctionnalités de la version 3.

Voici ma sélection.

1. Les outils de gestion d'InfluxDB 3
Getting Started with InfluxDB 3 Core: From Installation to First Query in 10 Minutes | InfluxData
 
1. InfluxDB 3 Explorer

Mon premier choix
Interface Web officielle.

Gestion des bases de données et tokens.

Exploration des tables et des données.

Exécution de requêtes SQL.

Visualisation des données.

Compatible Core et Enterprise.

Documentation et installation 
Grafana and Metrics for Monitoring | by Knoldus Inc. | Medium
 
2. Grafana

Idéal pour supervision
Tableaux de bord personnalisés.

Monitoring des métriques.

Graphiques en temps réel.

Alertes et notifications.

Connexion à InfluxDB 3 via SQL/Flight SQL selon le connecteur.

Site officiel 
Build A StackOverflow Dashboard (Part 2): Crafting BigQuery Views and Superset Charts | Preset
 
3. Apache Superset

Interface BI et analytique.

Exploration des données.

Tableaux de bord.

Connexion SQL via un connecteur compatible Flight SQL.

Site officiel 
Installer DBeaver | Algo Jungle
 
4. DBeaver

Client SQL graphique.

Exploration des schémas et tables.

Exécution de requêtes.

Export des résultats.

Attention : il faut vérifier le support du protocole Flight SQL et du driver utilisé avec ta version d'InfluxDB 3.

Site officiel 
How run Influx cli on a windows machine - InfluxDB 2 - InfluxData Community Forums
 
5. InfluxDB 3 CLI

Gestion des bases de données.

Gestion des tokens.

Administration du serveur.

Exécution de requêtes SQL et InfluxQL.

Automatisation via scripts.

Documentation officielle 
Less Friction, More Control: Here's What Shipped in Q1 | InfluxData
 
6. Telegraf

Collecte de métriques.

Monitoring des serveurs.

Collecte de données système et réseau.

Envoi des données vers InfluxDB 3.

Documentation officielle 
Les fonctionnalités et compatibilités sont documentées par InfluxData. 

docs.influxdata.com
+3

2. Comparatif rapide
Outil

Administration

Monitoring

Dashboard

InfluxDB 3 Explorer

Excellent

Limité

Oui

Grafana

Limité

Excellent

Excellent

Superset

Limité

Analytique

Excellent

DBeaver

SQL

Non

Limité

InfluxDB 3 CLI

Excellent

Scripts

Non

Telegraf

Collecte

Excellent

Non

3. Quelle architecture je recommande ?
Pour une infrastructure InfluxDB 3 auto-hébergée :

Sources de données

Serveurs • IoT • Applications • Réseau

Telegraf

Collecte et transmission des métriques

InfluxDB 3 Core / Enterprise

Stockage des séries temporelles

Explorer

Administration et SQL

Grafana

Dashboards et alertes

4. Pour mieux cibler ta recherche
Je voudrais savoir quel type d'outil tu recherches exactement.

1. Quelle version d'InfluxDB 3 utilises-tu ?


InfluxDB 3 Core (Open Source)

InfluxDB 3 Enterprise

InfluxDB 3 Cloud

Je ne sais pas
2. Quel est ton besoin principal ?


Administration complète (bases, utilisateurs, tokens, configuration)

Monitoring et supervision

Gestion des données et des tables

Sauvegarde et restauration

Gestion centralisée de plusieurs serveurs InfluxDB
3. Comment InfluxDB est-il installé ?


Docker / Docker Compose

Linux directement

Kubernetes

Cloud
4. Quel type d'interface souhaites-tu ?


Interface Web graphique

Application Desktop

Ligne de commande

Peu importe
Avec ces informations, je pourrai te faire une sélection plus précise, notamment des solutions open source et auto-hébergeables, avec leurs fonctionnalités, leurs limites et leurs liens GitHub.


Voici mes critères pour trouver des outils de gestion InfluxDB 3 : Version : Core. Besoin : Administration complète. Installation : Linux. Interface : Application desktop. Propose-moi les meilleures solutions compatibles, de préférence open source.

Pour ton besoin, je te conseille de privilégier les outils qui communiquent directement avec InfluxDB 3 Core, et non les anciens outils conçus pour InfluxDB 1 ou 2.

Il y a un point important : les applications Desktop open source offrant une administration complète d'InfluxDB 3 Core sont encore très limitées. Les clients SQL peuvent explorer les données, mais ne savent pas nécessairement gérer les tokens, les bases et la configuration du serveur.

Voici les solutions que je retiendrais.

1. Les meilleures solutions
A. InfluxDB 3 Explorer
Meilleur choix
Open source
Compatible Core
Features and workflows with Amazon Timestream for InfluxDB 3 | AWS Database Blog
 
What’s New in InfluxDB 3.2: Explorer  UI Now GA Plus Key Enhancements | InfluxData
 
Getting Started with InfluxDB 3 Core: From Installation to First Query in 10 Minutes | InfluxData

 
C'est de loin le meilleur choix pour ton besoin fonctionnel.

Fonctionnalités :

Création et suppression des bases de données.

Gestion des tokens administrateurs.

Exploration des tables et des données.

Requêtes SQL et InfluxQL.

Visualisation des séries temporelles.

Écriture de données.

Limite : ce n'est pas une application Desktop native. C'est une application Web que tu peux héberger localement sur ton Linux et ouvrir depuis ton navigateur.

Documentation : InfluxDB 3 Explorer . 

docs.influxdata.com
+3

B. DBeaver Community
Open source
Desktop Linux
Connect DBeaver Community to SQLite through ODBC
 
Une vraie application Desktop, disponible sous Linux.

Fonctionnalités :

Éditeur SQL.

Navigation dans les bases.

Consultation des tables et résultats.

Export des données.

Connexion à différents moteurs SQL.

Attention : son driver InfluxDB documenté est limité à certaines éditions payantes et ne constitue pas un administrateur complet d'InfluxDB 3 Core. Je ne le retiendrais pas comme solution principale. 

DBeaver Documentation
+1

Site : DBeaver Community .

C. Beekeeper Studio
Open source partiel
Desktop Linux
SQL Editor | Beekeeper Studio
 
Interface Desktop moderne.

Éditeur SQL.

Gestion de connexions.

Exploration de bases compatibles.

Limite : je n'ai pas trouvé de support natif officiellement documenté pour InfluxDB 3 Core. À considérer comme expérimentation, pas comme solution validée.

Site : Beekeeper Studio . 

GitHub

2. Mon classement
Critère

Explorer

DBeaver

Beekeeper

InfluxDB 3 Core

Oui

Partiel

Non validé

Interface Desktop native

Non

Oui

Oui

Gestion des bases

Oui

Limitée

Non validée

Gestion des tokens

Oui

Non

Non

Requêtes SQL

Oui

À vérifier

À vérifier

Open source

Oui

Oui

Partiel

3. Installation recommandée sur Linux
Je te propose d'installer InfluxDB 3 Explorer avec Docker.

C'est le meilleur compromis pour obtenir une véritable interface d'administration sans développer ton propre outil.


bash
docker pull influxdata/influxdb3-ui:1.11.2

docker run -d \
  --name influxdb3-explorer \
  --restart unless-stopped \
  -p 127.0.0.1:8888:8080 \
  influxdata/influxdb3-ui:1.11.2 \
  --mode=admin
Ensuite, ouvre :

http://localhost:8888

Configure la connexion avec :

URL : http://IP_SERVEUR:8181

Token : ton token administrateur InfluxDB 3 Core.

Mode : Administration.

La documentation officielle confirme ce fonctionnement. 

InfluxDB 3 Explorer Documentation
+2

4. Mon conseil final
Je choisirais InfluxDB 3 Explorer comme outil principal.

Mais si tu souhaites absolument une application Desktop native, avec une interface comparable à pgAdmin ou MySQL Workbench, il serait intéressant de développer une petite application dédiée à InfluxDB 3 Core.

Elle pourrait intégrer :

Gestion multi-serveurs.

Création, modification et suppression des bases.

Gestion des tokens.

Exploration des tables.

Éditeur SQL avec coloration syntaxique.

Visualisation des données.

Configuration du serveur.

Gestion des sauvegardes et restaurations.

Une question importante : serais-tu intéressé par une application Desktop open source dédiée à InfluxDB 3 Core, développée en Python (PySide6) ou Electron, avec une interface graphique complète similaire à pgAdmin ?

Je pourrais te proposer son architecture et ses fonctionnalités détaillées.


Cela pourrait aussi vous intéresser.
En savoir plus


Hatchable
The connector that ships the app
It does not stop at code. Hosting, a database, sign-in, and a live link.
Pub

good job

Merci ! 😊 Ravi d'avoir pu t'aider. Bonne continuation avec InfluxDB 3 Core ! 🚀


est  il possible de devlopper un outil d'administration d'influxdb v3 avec rust

Oui, absolument ! Et je pense même que Rust est un excellent choix pour développer un véritable outil d'administration Desktop dédié à InfluxDB 3 Core.

On peut créer une application comparable à pgAdmin pour PostgreSQL ou MySQL Workbench pour MySQL, mais spécialement conçue pour InfluxDB 3.

Bonne nouvelle : InfluxDB 3 dispose d'une API HTTP d'administration officielle et d'une bibliothèque cliente Rust. On n'a donc pas besoin de réinventer le protocole de communication. 

InfluxDB 3 Core Documentation
+2

1. Technologie que je recommande
Je partirais sur cette architecture :

Application Desktop Linux
InfluxAdmin
Nom provisoire du projet

新しい  UI | DataGrip ドキュメント
 
Interface graphique — Tauri 2

HTML / CSS / TypeScript

Framework : React

Backend — Rust

Gestion des connexions

Administration des bases

Gestion des tokens

Exécution SQL

Gestion des erreurs

HTTP API

Administration

Arrow Flight SQL

Requêtes et résultats

InfluxDB 3 Core

Linux • Docker • Serveur distant

2. Stack technique
Composant

Technologie

Langage principal

Rust

Framework Desktop

Tauri 2

Interface

React + TypeScript

UI

Tailwind CSS + shadcn/ui

Backend HTTP

reqwest

Async runtime

Tokio

Sérialisation

Serde

Client InfluxDB 3

influxdb3-client

Requêtes Flight SQL

Arrow Flight

Stockage local

SQLite

Graphiques

Apache ECharts

Références :

Tauri 2 

Client Rust InfluxDB 3 

Documentation Rust 

Apache Arrow Flight SQL 

3. Fonctionnalités de l'application
Je propose de construire les modules suivants.

Serverless Database Dashboard by Product SAAS for Cansaas on Dribbble
 
1. Dashboard

État du serveur.

Version InfluxDB.

Nombre de bases.

Informations système.

Métriques et statistiques.

Creating columns | Team Edition Documentation
 
2. Database Explorer

Créer une base.

Supprimer une base.

Lister les bases.

Explorer les tables.

Voir les colonnes et les types.

SQL Editor | Beekeeper Studio
 
3. SQL Workbench

Éditeur SQL.

Coloration syntaxique.

Historique des requêtes.

Autocomplétion.

Résultats sous forme de tableau.

Export CSV et JSON.

Admin dashboard | Okteto Documentation
 
4. Token Manager

Création des tokens.

Liste des tokens.

Gestion des permissions.

Expiration des tokens nommés.

Révocation et suppression.

The Top InfluxDB Dashboards
 
5. Monitoring

Santé du serveur.

Utilisation des ressources.

Métriques.

Activité des requêtes.

Graphiques temporels.

Overview of the Restores tab in the ADP Control web interface | ADP ES Arenadata Docs
 
6. Backup & Restore

Export des données.

Sauvegarde.

Import de données.

Restauration.

Gestion des fichiers Parquet.

Attention : certaines opérations de sauvegarde/restauration ne sont pas exposées de la même manière dans Core et Enterprise. Il faudra prévoir les fonctionnalités réellement disponibles dans Core plutôt que promettre une restauration native universelle. 

InfluxDB 3 Core Documentation
+2

4. Structure du projet Rust
Voici une organisation que je recommande :


text
influxadmin/
│
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   │
│   │   ├── influxdb/
│   │   │   ├── connection.rs
│   │   │   ├── databases.rs
│   │   │   ├── tables.rs
│   │   │   ├── tokens.rs
│   │   │   ├── queries.rs
│   │   │   ├── server.rs
│   │   │   └── monitoring.rs
│   │   │
│   │   ├── commands/
│   │   │   ├── connection.rs
│   │   │   ├── database.rs
│   │   │   ├── token.rs
│   │   │   └── query.rs
│   │   │
│   │   └── storage/
│   │       └── settings.rs
│   │
│   └── Cargo.toml
│
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Databases.tsx
│   │   ├── Tables.tsx
│   │   ├── SQLWorkbench.tsx
│   │   ├── Tokens.tsx
│   │   └── Settings.tsx
│   │
│   └── App.tsx
│
└── package.json
5. Communication avec InfluxDB 3 Core
Le point intéressant est que l'API officielle expose déjà les opérations nécessaires :

Fonction

Endpoint

Lister les bases

GET /api/v3/configure/database

Créer une base

POST /api/v3/configure/database

Supprimer une base

DELETE /api/v3/configure/database

Créer un token admin

POST /api/v3/configure/token/admin

Créer un token nommé

POST /api/v3/configure/token/named_admin

Supprimer un token

DELETE /api/v3/configure/token

Exécuter SQL

POST /api/v3/query_sql

Informations serveur

/health

Source : Liste officielle des endpoints InfluxDB 3 Core . 

InfluxDB 3 Core Documentation
+2

Pour le développement Rust, je recommande de séparer :

Le client HTTP pour l'administration.

Arrow Flight SQL pour les requêtes et les gros résultats.

Le client officiel influxdb3-client pour les opérations de données compatibles avec sa couverture fonctionnelle.

6. Plan de développement
Je découperais le développement en quatre phases.

Phase

Fonctionnalités

1 — MVP

Connexion, dashboard, bases, tables

2 — Administration

Tokens, SQL Workbench, historique

3 — Supervision

Graphiques, métriques, alertes

4 — Avancé

Multi-serveurs, export, sauvegardes

Objectif : une première version utilisable avec une interface Desktop Linux, puis une application complète.

7. Quelques choix à définir avant de commencer
Je te propose de définir le produit avant de générer le squelette Rust.

1. Design de l'application


Dark — style pgAdmin / DataGrip

Light — style DBeaver

Modern — style VS Code
2. Framework Desktop


Tauri 2 + React (recommandé)

Tauri 2 + Vue

Iced — Rust natif

Slint — Rust natif
3. Gestion des connexions


Un seul serveur

Plusieurs serveurs InfluxDB
4. Périmètre


Administration complète

Administration + Monitoring + SQL

Toutes les fonctionnalités avancées
5. Format de distribution Linux


AppImage + DEB

DEB + RPM

Tous les formats Linux
Mon choix personnel pour ce projet : Rust + Tauri 2 + React + SQLite, avec une architecture modulaire et multi-serveurs dès le départ. Cela permettrait de construire un véritable outil open source d'administration InfluxDB 3 Core, et pas simplement un éditeur SQL.


Connectez-vous pour un accompagnement personnalisé, étape par étape.

Continuer avec Google

S’inscrire ou se connecter
Définissons le projet InfluxAdmin en Rust. Mes choix : Design : Dark — style pgAdmin / DataGrip ; Framework : Tauri 2 + React ; Connexions : Multi-serveurs ; Périmètre : Toutes les fonctionnalités avancées ; Distribution : AppImage + DEB. Prépare le squelette complet du projet, les dépendances Rust et React, l'architecture et la première version fonctionnelle.

InfluxAdmin — conception et première version fonctionnelle
Projet
validé
 
Rust
+
Tauri
2
 
Linux
 
Open
source

Nous allons construire InfluxAdmin, une application Desktop professionnelle pour administrer plusieurs instances InfluxDB 3 Core.

L'objectif est de créer un véritable outil d'administration, inspiré de pgAdmin et DataGrip, et non un simple client SQL.

Je retiens les choix suivants :

Élément

Choix

Nom

InfluxAdmin

Backend

Rust

Desktop

Tauri 2

Frontend

React + TypeScript

Design

Dark, style DataGrip

Connexions

Multi-serveurs

Stockage local

SQLite

Base cible

InfluxDB 3 Core

Distribution

AppImage + DEB

Licence proposée

MIT

1. Architecture générale
InfluxAdmin
Desktop database administration

高效SQL编写与脚本管理 - DBeaver SQL编辑器使用指南
 
Frontend React + TypeScript

Dashboard • Explorer • SQL • Tokens • Monitoring

Tauri 2 — IPC

Communication sécurisée React / Rust

Rust Backend

Services • API HTTP • Flight SQL • Sécurité • SQLite

InfluxDB Core A

Serveur local

InfluxDB Core B

Serveur distant

SQLite local

Connexions • Préférences • Historique SQL

Principes importants
Les identifiants et tokens restent dans le stockage local sécurisé.

Chaque serveur possède sa propre configuration.

Les requêtes SQL sont exécutées sur le serveur sélectionné.

Les opérations destructives nécessitent une confirmation.

Les modules d'administration sont séparés du module de requêtes.

Le backend Rust contrôle les opérations autorisées : le frontend ne communique jamais directement avec InfluxDB.

2. Fonctionnalités prévues par version
Je propose de ne pas essayer de tout développer en une seule fois. Nous allons construire une base solide, puis ajouter les modules avancés.

Module

V0.1

V0.2

V1.0

Connexions multi-serveurs

Oui

Test de connexion

Oui

Liste des bases

Oui

Création / suppression de bases

Oui

SQL Workbench

Oui

Exploration des tables

Prévu

Gestion des tokens

Prévu

Monitoring et graphiques

Prévu

Export CSV / JSON / Parquet

Prévu

Cache management

Prévu

Processing Engine

Prévu

Sauvegarde et restauration

Prévu

Gestion des permissions avancées

Prévu

Les endpoints de la V0.1 sont bien disponibles dans l'API Core : bases de données, SQL et santé du serveur. Les opérations avancées seront ajoutées selon les capacités réellement exposées par Core. 

InfluxDB 3 Core Documentation
+2

3. Structure complète du dépôt

text
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
4. Dépendances Rust
Voici les dépendances principales du backend.

src-tauri/Cargo.toml


toml

[package]
name = "influxadmin"
version = "0.1.0"
description = "InfluxDB 3 Core Desktop Administration"
edition = "2021"

[lib]
name = "influxadmin_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }

serde = { version = "1", features = ["derive"] }
serde_json = "1"

tokio = { version = "1", features = ["full"] }
reqwest = { version = "0.12", features = ["json", "rustls-tls"] }

sqlx = { version = "0.8", features = [
  "runtime-tokio",
  "sqlite",
  "macros"
] }

keyring = { version = "3", features = ["linux-native"] }

uuid = { version = "1", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }

thiserror = "2"
anyhow = "1"
url = "2"
EOF
Le client HTTP sera notre couche principale pour les fonctions d'administration. Nous pourrons intégrer influxdb3-client pour les fonctionnalités Arrow Flight et les opérations de données qui en bénéficient. Ce client Rust est destiné à InfluxDB 3 Core et Enterprise. 

InfluxCommunity/influxdb3-rust · GitHub

5. Dépendances React
package.json


json

{
  "name": "influxadmin",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "tauri": "tauri"
  },
  "dependencies": {
    "@tauri-apps/api": "^2",
    "react": "^19",
    "react-dom": "^19",
    "lucide-react": "^0.468",
    "zustand": "^5",
    "@monaco-editor/react": "^4",
    "recharts": "^2",
    "sonner": "^2"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2",
    "@vitejs/plugin-react": "^4",
    "typescript": "^5",
    "vite": "^6",
    "tailwindcss": "^4"
  }
}
Le choix de Monaco Editor est intéressant : il permet d'avoir une expérience proche de VS Code dans le SQL Workbench.

6. Première version fonctionnelle du backend Rust
Pour éviter de multiplier les couches abstraites, la V0.1 va utiliser un client HTTP commun avec une configuration indépendante pour chaque instance InfluxDB.

Voici le cœur fonctionnel.

Correction pratique : le fichier Cargo.toml précédent doit se terminer à tailwindcss uniquement dans le fichier React. Pour le fichier Rust, voici sa version propre et complète :

src-tauri/Cargo.toml


toml

[package]
name = "influxadmin"
version = "0.1.0"
edition = "2021"

[lib]
name = "influxadmin_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2" }

[dependencies]
tauri = { version = "2" }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
reqwest = { version = "0.12", features = ["json", "rustls-tls"] }
sqlx = { version = "0.8", features = ["runtime-tokio", "sqlite", "macros"] }
keyring = { version = "3", features = ["linux-native"] }
uuid = { version = "1", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
thiserror = "2"
anyhow = "1"
url = "2"
A. Client InfluxDB
src-tauri/src/influxdb/client.rs


rust

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
Les chemins d'API et le format SQL utilisés ici correspondent à la documentation InfluxDB 3 Core. 

InfluxDB 3 Core Documentation
+2

B. Commandes Tauri
src-tauri/src/lib.rs


rust

mod influxdb;

use influxdb::client::InfluxClient;
use serde_json::Value;

#[tauri::command]
async fn test_connection(
    url: String,
    token: String,
) -> Result<String, String> {
    let client = InfluxClient::new(url, token);
    client.health().await
}

#[tauri::command]
async fn list_databases(
    url: String,
    token: String,
) -> Result<Value, String> {
    let client = InfluxClient::new(url, token);
    let result = client.databases().await?;

    serde_json::from_str(&result)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_database(
    url: String,
    token: String,
    name: String,
) -> Result<String, String> {
    if name.trim().is_empty() {
        return Err("Database name is required".into());
    }

    let client = InfluxClient::new(url, token);
    client.create_database(name).await
}

#[tauri::command]
async fn delete_database(
    url: String,
    token: String,
    name: String,
) -> Result<String, String> {
    let client = InfluxClient::new(url, token);
    client.delete_database(name).await
}

#[tauri::command]
async fn execute_sql(
    url: String,
    token: String,
    database: String,
    query: String,
) -> Result<String, String> {
    if query.trim().is_empty() {
        return Err("SQL query is empty".into());
    }

    let client = InfluxClient::new(url, token);
    client.query_sql(database, query).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            test_connection,
            list_databases,
            create_database,
            delete_database,
            execute_sql
        ])
        .run(tauri::generate_context!())
        .expect("Error while running InfluxAdmin");
}
src-tauri/src/main.rs


rust

fn main() {
    influxadmin_lib::run();
}
Dans src-tauri/src/influxdb/mod.rs :


rust
pub mod client;
Cette première couche permet déjà de tester une connexion, récupérer les bases, en créer et en supprimer, et exécuter une requête SQL.

7. Première interface React
Nous allons créer une interface sombre avec une barre latérale, un gestionnaire de connexions et un espace de travail.

pgtools — desktop IDE для PostgreSQL
 
A. Service de communication Tauri
src/services/tauri.ts


typescript

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
B. Application principale
src/App.tsx


tsx

import { useState } from "react";
import { influxApi, Connection } from "./services/tauri";
import {
  Database,
  Server,
  Play,
  Plus,
  Activity,
  Terminal
} from "lucide-react";

export default function App() {
  const [connection, setConnection] =
    useState<Connection | null>(null);

  const [url, setUrl] =
    useState("http://127.0.0.1:8181");

  const [token, setToken] = useState("");
  const [database, setDatabase] = useState("");
  const [query, setQuery] = useState(
    "SELECT * FROM system.tables LIMIT 10"
  );

  const [databases, setDatabases] = useState<string[]>([]);
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [error, setError] = useState("");

  async function connect() {
    try {
      setError("");

      const c: Connection = {
        id: crypto.randomUUID(),
        name: "InfluxDB Core",
        url,
        token
      };

      await influxApi.test(c);

      const data = await influxApi.databases(c);

      setConnection(c);
      setDatabases(data.databases ?? []);
      setStatus("Connected");
    } catch (e) {
      setError(String(e));
      setStatus("Connection failed");
    }
  }

  async function executeQuery() {
    if (!connection || !database) return;

    try {
      setError("");

      const response = await influxApi.query(
        connection,
        database,
        query
      );

      setResult(response);
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>InfluxAdmin</h2>

        <div className="section-title">
          CONNECTIONS
        </div>

        <div className="connection">
          <Server size={16} />
          InfluxDB Core
        </div>

        <div className="section-title">
          WORKSPACE
        </div>

        <button onClick={connect}>
          <Activity size={16} />
          Connect
        </button>

        <button onClick={() => setResult("")}>
          <Terminal size={16} />
          SQL Workbench
        </button>

        <button onClick={async () => {
          if (connection) {
            const data = await influxApi.databases(connection);
            setDatabases(data.databases ?? []);
          }
        }}>
          <Database size={16} />
          Refresh databases
        </button>

        <div className="section-title">
          DATABASES
        </div>

        {databases.map(db => (
          <button
            key={db}
            className="database"
            onClick={() => setDatabase(db)}
          >
            <Database size={14} />
            {db}
          </button>
        ))}
      </aside>

      <main className="main">
        <header className="topbar">
          <span>InfluxAdmin / SQL Workbench</span>
          <span>{status}</span>
        </header>

        <section className="connection-panel">
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="InfluxDB URL"
          />

          <input
            value={token}
            onChange={e => setToken(e.target.value)}
            type="password"
            placeholder="Admin token"
          />

          <button onClick={connect}>
            Connect
          </button>
        </section>

        <section className="workspace">
          <h3>SQL Workbench</h3>

          <select
            value={database}
            onChange={e => setDatabase(e.target.value)}
          >
            <option value="">Select database</option>
            {databases.map(db => (
              <option key={db} value={db}>
                {db}
              </option>
            ))}
          </select>

          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
          />

          <button onClick={executeQuery}>
            <Play size={16} />
            Execute SQL
          </button>

          <h3>Results</h3>
          <pre>{result || "No results yet"}</pre>

          {error && (
            <div className="error">{error}</div>
          )}
        </section>
      </main>
    </div>
  );
}
Cette interface est un premier écran de travail volontairement minimal. Elle ne constitue pas encore le produit final : le système de connexions persistantes, les modales d'administration et la grille de résultats seront les prochaines étapes.

C. Design CSS
src/index.css


css

:root {
  font-family: Inter, system-ui, sans-serif;
  color: #e2e8f0;
  background: #111827;
  font-synthesis: none;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 950px;
  min-height: 100vh;
}

button, input, select, textarea {
  font: inherit;
}

button {
  display: flex;
  align-items: center;
  gap: 9px;
  background: #263449;
  color: #e2e8f0;
  border: 1px solid #37465c;
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background: #33465f;
}

input, select, textarea {
  background: #172234;
  color: #e2e8f0;
  border: 1px solid #37465c;
  padding: 11px;
  border-radius: 6px;
  outline: none;
}

input:focus, textarea:focus {
  border-color: #3b82f6;
}

.app {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 245px;
  flex-shrink: 0;
  background: #151e2d;
  border-right: 1px solid #29364a;
  padding: 20px 14px;
}

.sidebar h2 {
  color: #60a5fa;
  font-size: 20px;
  margin: 0 0 30px;
}

.section-title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  color: #8291a7;
  margin: 24px 8px 12px;
}

.sidebar button {
  width: 100%;
  justify-content: flex-start;
  background: transparent;
  border: none;
  margin-bottom: 4px;
}

.connection {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  color: #93c5fd;
}

.main {
  flex: 1;
  overflow: auto;
}

.topbar {
  height: 58px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #151e2d;
  border-bottom: 1px solid #29364a;
  font-size: 13px;
}

.connection-panel {
  display: flex;
  gap: 10px;
  padding: 22px;
}

.connection-panel input {
  flex: 1;
  min-width: 0;
}

.workspace {
  padding: 22px;
}

.workspace h3 {
  font-size: 15px;
  margin: 8px 0 18px;
}

.workspace select {
  display: block;
  margin-bottom: 12px;
  min-width: 220px;
}

.workspace textarea {
  width: 100%;
  height: 230px;
  resize: vertical;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.6;
}

.workspace pre {
  padding: 18px;
  background: #151e2d;
  border: 1px solid #29364a;
  border-radius: 7px;
  min-height: 150px;
  white-space: pre-wrap;
  overflow: auto;
}

.error {
  margin-top: 15px;
  padding: 12px;
  color: #fca5a5;
  background: #451a24;
  border-radius: 6px;
}
src/main.tsx


tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
8. Configuration Tauri 2
src-tauri/tauri.conf.json


json

{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "InfluxAdmin",
  "version": "0.1.0",
  "identifier": "io.influxadmin.desktop",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "InfluxAdmin",
        "width": 1440,
        "height": 900,
        "minWidth": 950,
        "minHeight": 650,
        "center": true,
        "resizable": true
      }
    ],
    "security": {
      "csp": "default-src 'self'; connect-src ipc: http://ipc.localhost https: http:; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' asset: data:;"
    }
  },
  "bundle": {
    "active": true,
    "targets": ["appimage", "deb"],
    "category": "Development",
    "shortDescription": "InfluxDB 3 Core Administration",
    "longDescription": "Desktop administration tool for InfluxDB 3 Core",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.png"
    ]
  }
}
src-tauri/capabilities/default.json


json

{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "InfluxAdmin desktop permissions",
  "windows": ["main"],
  "permissions": [
    "core:default"
  ]
}
La politique CSP devra être ajustée selon les fonctionnalités de l'interface et les connexions HTTP/HTTPS. Il faut notamment éviter d'autoriser des scripts distants.

9. Installation et compilation sur Linux
Sur Ubuntu/Debian, installer les dépendances système :


bash
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
Installer Node.js et Rust si nécessaire :


bash
# Rust
curl https://sh.rustup.rs -sSf | sh

source "$HOME/.cargo/env"

# Vérification
rustc --version
cargo --version
node --version
npm --version
Créer le projet :


bash
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
Après avoir intégré les fichiers précédents, démarrer le développement :


bash
npm run tauri dev
Compilation des paquets Linux :


bash
npm run tauri build
Les artefacts seront produits dans :


text
src-tauri/target/release/bundle/
├── appimage/
│   └── InfluxAdmin_0.1.0_amd64.AppImage
└── deb/
    └── influxadmin_0.1.0_amd64.deb
Les noms exacts des fichiers dépendent de l'architecture et de la configuration de compilation.

10. Fichiers complémentaires indispensables
Pour que le projet Vite/Tauri démarre correctement, ajouter également :

src-tauri/build.rs


rust
fn main() {
    tauri_build::build()
}
vite.config.ts


typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: "127.0.0.1"
  }
});
index.html

<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>InfluxAdmin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
11. Points techniques à ne pas négliger
Il y a quatre éléments importants avant de considérer InfluxAdmin comme prêt pour la production.

Sécurité des tokens : dans le prototype, les tokens sont uniquement conservés en mémoire React et transmis au backend Rust. Il faut implémenter keyring pour les stocker dans le gestionnaire de secrets Linux, et ne jamais les enregistrer en clair dans SQLite.

Persistance : SQLite doit conserver les noms, URL, options et identifiants des connexions. Les secrets doivent rester séparés.

Compatibilité Core : certaines fonctions d'Enterprise ne sont pas disponibles dans Core. Le menu doit refléter les capacités du serveur.

Requêtes : prévoir l'annulation, les délais d'attente, la pagination ou le streaming et la gestion des erreurs.

À noter également : InfluxDB 3 Core n'utilise pas Flux et impose actuellement une limite de fenêtre temporelle d'environ 72 heures pour les requêtes. Les périodes de rétention sont également immuables après création d'une base. 

InfluxDB 3 Core Documentation
+1

12. Résultat visé pour InfluxAdmin 1.0
InfluxAdmin

Vision produit
Deploy PgAdmin [Updated Feb ’26]
 
6+
Modules principaux

Multi
Serveurs InfluxDB

Rust
Backend natif

Linux
AppImage et DEB

Modules du produit

 Dashboard

 Multi-connection Manager

 Database Explorer

 SQL Workbench

 Token Manager

 Monitoring

 Backup Manager

 Server Configuration

13. Notre prochaine étape : construire le vrai MVP
Je recommande de commencer par quatre tâches dans cet ordre :

Connexion multi-serveurs persistante avec SQLite et Keyring.

Dashboard affichant la santé et les informations du serveur.

Database Explorer avec création et suppression.

SQL Workbench avec Monaco Editor et tableau de résultats.

Une précision : les extraits ci-dessus constituent un squelette de développement et non une archive complète déjà compilée et testée. Il faudra intégrer les fichiers, vérifier les versions des dépendances et effectuer les tests sur une instance InfluxDB 3 Core.

Mon objectif serait d'obtenir une première version InfluxAdmin 0.1.0 réellement exécutable, avec les quatre modules précédents, avant de développer les fonctionnalités avancées.

C'est une bonne base pour en faire un véritable projet open source publiable sur GitHub.


Pour le squelette d’InfluxAdmin, voici une option d’assistant IA pour le développement d’applications.


Use AI Inc
Build a Small App
Plan, write and debug code in one AI chat
Pub

ChatGPT est une IA, et peut se tromper.

Nouveau chat
Images
Plugins
Voir les offres et les tarifs
Aide

Recherche approfondie
Paramètres
Obtenez des réponses personnalisées
Connectez-vous pour obtenir des réponses sur la base des chats enregistrés, créer des images et charger des fichiers.

Discussion avec ChatGPT
Demander à ChatGPT

Sources

InfluxDB 3 Core Documentation
InfluxDB HTTP API

InfluxDB 3 Core Documentation
All endpoints

InfluxDB 3 Core Documentation
Use SQL or InfluxQL and InfluxDB v3 HTTP query API

InfluxCommunity/influxdb3-rust · GitHub
GitHub

InfluxDB 3 Core Documentation
Create a database

InfluxDB 3 Core Documentation
Query data | Get started with InfluxDB 3 Core
