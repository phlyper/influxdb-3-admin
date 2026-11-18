Pour éviter que Claude développe des fonctionnalités incompatibles entre elles, je te conseille de lui faire suivre cet ordre :

| Priorité | Module            | Objectif                 |
| -------- | ----------------- | ------------------------ |
| 1        | Architecture Rust | Stabiliser les modules   |
| 2        | SSH Manager       | Finaliser les tunnels    |
| 3        | Connections       | Multi-serveurs et SQLite |
| 4        | Security          | Coffre de credentials    |
| 5        | Database Explorer | Bases, tables et schémas |
| 6        | SQL Workbench     | Éditeur SQL              |
| 7        | Monitoring        | Santé et performances    |
| 8        | Release           | Windows, DEB et RPM      |

Un conseil important : demande à Claude de commencer par auditer ton code actuel et de produire un rapport des fichiers manquants, des doublons et des erreurs de compilation avant de développer de nouveaux modules. Cela évitera notamment de reproduire le problème de double déclaration des commandes SSH que nous avons rencontré.
