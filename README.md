# Tour d'Avant-Garde (TAG)

[![CI](https://github.com/wallacefranck13-ai/tag-tour-de-garde/actions/workflows/ci.yml/badge.svg)](https://github.com/wallacefranck13-ai/tag-tour-de-garde/actions/workflows/ci.yml)

Plateforme de prière, d'intercession et de suivi communautaire — pilotée par WhatsApp
et assistée par **Le Veilleur**, l'IA d'accueil de la Tour.

Version : 1.0 — Sprint 1 + une bonne partie du Sprint 2

## Objectif du Sprint 1

Permettre à un utilisateur de :

- se connecter via WhatsApp ;
- rejoindre la prière en cours ;
- déposer une requête de prière ;
- recevoir un suivi ;
- et aux responsables de voir les requêtes depuis le tableau de bord.

Plus deux fonctionnalités ajoutées dès ce sprint :

- **Intentions de Prière Mondiales** — une intention collective proposée chaque jour.
- **Le Flambeau de la Journée** — un responsable "Gardien du Flambeau" désigné chaque jour.

## Architecture

```
tag-tour-de-garde/
├── backend/     API NestJS + TypeORM (sql.js en développement)
├── frontend/    Tableau de bord (HTML/CSS/JS autonome, aucun build requis)
├── mobile/      Squelette Expo/React Native (26 tests, jamais lancé sur appareil — voir mobile/README.md)
├── docs/        État d'implémentation
├── docker-compose.yml
└── .github/workflows/ci.yml
```

### Backend — modules

| Module | Rôle |
|---|---|
| `users` | Utilisateurs + rôles (RESPONSABLE, INTERCESSEUR, MEMBRE) |
| `communities` | Communautés locales |
| `prayer-programs` | Programmes de prière du jour + étapes (`prayer_steps`) |
| `prayer-requests` | Requêtes de prière et leur statut |
| `intercession-teams` | Équipes d'intercession |
| `meetings` | Rencontres et réunions |
| `notifications` | Journal des notifications (WhatsApp/Email/Push/rappels) |
| `testimonies` | Témoignages, avec upload de photo |
| `action-of-faith` | Actes de foi |
| `world-intentions` | Intention de prière mondiale du jour |
| `flambeau` | Gardien du Flambeau du jour + checklist |
| `veilleur` | Le Veilleur — assistant IA (accueillir, guider, recevoir une requête, afficher le programme, rappeler les rencontres) |
| `whatsapp` | Webhook + moteur conversationnel (utilise Le Veilleur) + envoi réel via Graph API |
| `auth` | Authentification JWT + RBAC (RESPONSABLE/INTERCESSEUR) |
| `dashboard` | Agrégation des statistiques live + `/dashboard/stats` |
| `campaigns` | Campagnes collectives de prière (hors cahier des charges initial, ajouté pour la page Campagnes) |
| `reminders` | Rappels planifiés (`@nestjs/schedule`) : réunions à venir, requêtes en attente |
| `analytics` | Instantanés quotidiens des statistiques + historique |

Toutes les tables du cahier des charges (Tâche 2) sont créées : `users`, `roles`,
`communities`, `prayer_programs`, `prayer_steps`, `prayer_requests`,
`intercession_teams`, `meetings`, `notifications`, `testimonies`, `action_of_faith`
— plus `world_prayer_intentions`, `flambeau_assignments`, `whatsapp_sessions`,
`campaigns` et `daily_snapshots`.

## Lancer le backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed        # crée les données de démonstration (voir identifiants ci-dessous)
npm run start:dev
```

API disponible sur `http://localhost:3050/api/v1` (port choisi dans `.env` pour éviter les conflits locaux — changez `PORT` si besoin).

- Santé (avec vérification DB réelle) : `GET /api/v1/health`
- **Documentation API interactive (Swagger)** : `GET /api/docs`
- Tableau de bord live : `GET /api/v1/dashboard/overview`
- Statistiques globales : `GET /api/v1/dashboard/stats`
- Historique quotidien : `GET /api/v1/dashboard/history`
- Programme du jour : `GET /api/v1/prayer-programs/today`
- Intention mondiale du jour : `GET /api/v1/world-intentions/today`
- Flambeau du jour : `GET /api/v1/flambeau/today`
- Webhook WhatsApp (Meta Cloud API) : `GET|POST /api/v1/whatsapp/webhook`
- **Simulateur WhatsApp** (sans compte Meta) : `POST /api/v1/whatsapp/simulate` avec `{ "phone": "+243...", "text": "menu" }`
- Connexion : `POST /api/v1/auth/login` — responsable (`responsable@tourdavantgarde.org` / `password123`, tous droits) ou intercesseur (`marie@tourdavantgarde.org` / `password123`, requêtes de prière uniquement)
- Pagination optionnelle : `GET /api/v1/prayer-requests?page=1&limit=20` et
  `GET /api/v1/notifications?page=1&limit=20` — sans ces paramètres, réponse
  tableau inchangée ; avec, `{ data, meta: { total, page, limit, totalPages } }`.

Par défaut (`DB_DRIVER=sqljs`), la base est stockée dans `backend/data/tag.sqlite`
(créée automatiquement, `synchronize: true`). Pour passer sur PostgreSQL en
production, voir la section "Configuration" plus bas — aucun changement de
code requis.

### Tests

```bash
cd backend
npm test          # 34 tests unitaires
npm run test:e2e  # 9 tests d'intégration (vraie app + vraies requêtes HTTP)
```

Les tests unitaires couvrent l'authentification, le RBAC, Le Veilleur, le
routage du menu conversationnel WhatsApp, la configuration DB et l'envoi
d'e-mails. Les tests e2e (Supertest) vérifient le câblage réel bout-en-bout
sur une base sql.js dédiée et jetable : santé, forme d'erreur uniforme,
login, validation, parcours WhatsApp → requête de prière, RBAC.

### Docker (non testé en local ici — pas de Docker disponible — mais validé en CI, voir badge ci-dessus)

```bash
docker compose up --build
```

Lance le backend (port 3050) et le frontend (port 4300). Un service PostgreSQL
est prêt dans `docker-compose.yml`, commenté en attendant d'être branché.

## Lancer l'interface

Ouvrir `frontend/index.html` dans un navigateur (ou le servir avec `node
frontend/serve.js`, utilisé par le launch.json de prévisualisation). L'accès
au tableau de bord nécessite désormais une connexion (`POST /auth/login`,
identifiants ci-dessus, JWT stocké en `localStorage`). Une fois connecté, le
tableau de bord affiche les statistiques live, l'intention mondiale et le
Flambeau du jour ; si le backend est hors ligne, les pages retombent sur des
données de démonstration.

Le module **Simulateur WhatsApp** de la barre latérale permet de tester Le Veilleur
exactement comme un utilisateur WhatsApp (menu à 6 options, dépôt de requête, etc.)
sans avoir besoin d'un compte WhatsApp Business.

## Message d'accueil WhatsApp (Tâche 3)

```
🛡️ Bienvenue sur Tour d'Avant-Garde
"Une prière s'élève à chaque instant."

Nous sommes heureux de vous accueillir.
Veuillez choisir une option.

1️⃣ Rejoindre la prière en cours
2️⃣ Déposer une requête de prière
3️⃣ Recevoir le programme du jour
4️⃣ Voir la prochaine rencontre
5️⃣ Envoyer un témoignage
6️⃣ Parler à un responsable

Répondez simplement par le numéro correspondant.
```

## Modules UI présents

Connectés aux vraies données du backend (avec repli sur des données de
démonstration si le backend est hors ligne) :

- Tableau de bord (stats live, intention mondiale, Flambeau, session en cours, historique)
- Simulateur WhatsApp / Le Veilleur
- Demandes de prière (avec changement de statut)
- Réunions (création réservée aux responsables)
- Campagnes
- Groupes
- Chroniques de Tour d'Avant-Garde (témoignages, avec upload de photo)
- Statistiques (+ historique quotidien)
- Administration (annuaire des utilisateurs — réservé RESPONSABLE, masqué et bloqué pour les autres rôles)
- Notifications (journal des envois)
- Messages (messages WhatsApp "Parler à un responsable")

Page avec contenu statique structuré (hors périmètre backend, aucune table dédiée) :

- Ressources

## Validation des entrées

Tous les endpoints de mutation exposés (`auth/login`, `prayer-requests`,
`meetings`, `testimonies`, `campaigns`, `flambeau`, `communities`,
`prayer-programs`, `intercession-teams`, `action-of-faith`, `users`,
`whatsapp/simulate`) valident leur corps de requête via des DTO
`class-validator` — une requête malformée renvoie 400 au lieu d'être acceptée
silencieusement. `communities`, `prayer-programs` et `intercession-teams` sont
au passage devenus RESPONSABLE-only (ils n'avaient aucune protection avant).

## Stockage média

Les photos de témoignage (`POST /testimonies/:id/photo`) passent par un
`StorageService` abstrait : disque local par défaut, bascule automatique vers
S3 ou tout service compatible (MinIO, Cloudflare R2, DigitalOcean Spaces) dès
que `S3_BUCKET` est renseigné dans `.env` (voir `.env.example`).

## Mobile

Application Expo/React Native dans `mobile/` — navigation par onglets
(Tableau de bord / Demandes de prière / Réunions / Notifications), dépôt de
requêtes, création de réunions pour les responsables, contrôle de rôle, alertes
d'erreur, cache hors ligne et vérification de session JWT. Elle réutilise les
mêmes endpoints que le web.
26 tests (logique + rendu de composants sur les 5 écrans, `jest-expo`), intégrés au CI.
**Jamais lancée sur simulateur/appareil** dans cet environnement (pas d'Expo
CLI/simulateur disponible) — voir `mobile/README.md` pour le détail et la
suite.

## Configuration

- **Base de données** : `DB_DRIVER=sqljs` (défaut, zéro config) ou
  `DB_DRIVER=postgres` — voir `.env.example`. Basculer vers Postgres ne
  demande plus aucun changement de code, uniquement ces variables
  d'environnement (`getDatabaseConnectionOptions()` dans
  `backend/src/database/database.config.ts`, testé unitairement).
- **Frontend** : l'URL du backend se change dans `frontend/config.js`
  (`window.TAG_CONFIG.apiBase`), plus besoin de toucher `app.js` pour changer
  d'environnement de déploiement.
- **E-mail** : `SMTP_HOST` (+ `SMTP_PORT`/`SMTP_USER`/`SMTP_PASSWORD`) dans
  `.env` active l'envoi réel des relances de requêtes en attente aux
  responsables ; sans configuration, mode démo (journalisation uniquement).

## Sécurité

- `helmet` : en-têtes de sécurité HTTP sur toutes les réponses.
- Rate limiting (`@nestjs/throttler`) : 100 req/min par défaut, 5 tentatives/min
  sur `POST /auth/login` (protection anti-brute-force) — testé, 429 après 5 essais.
- RBAC vérifié à la fois côté backend (guards) et côté UI (liens masqués).
- Validation stricte des entrées (DTO + class-validator) sur tous les endpoints
  de mutation exposés.
- Filtre d'exceptions global : forme d'erreur cohérente sur toute l'API, pile
  d'appel des erreurs inattendues journalisée côté serveur uniquement.

## Prochaines étapes

Bloqué sur un élément externe que je n'ai pas dans cet environnement :

- **WhatsApp Cloud API réelle** — l'envoi via Graph API est déjà codé dans
  `WhatsappApiService`, il manque un compte Meta Business
  (`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`).
- Application mobile lancée sur simulateur/appareil réel — pas d'Expo
  CLI/simulateur ici (la logique et le rendu des composants sont testés,
  voir `mobile/README.md`).

Pas de blocage, juste pas encore fait :

- Redis/BullMQ (la version actuelle des rappels utilise `@nestjs/schedule`
  in-process, suffisant pour une seule instance).
- Application mobile : notifications push, build EAS, publication sur les
  stores.
- Déploiement effectif : les images Docker se construisent avec succès en CI
  (voir badge), mais rien n'est réellement déployé (registre, hébergeur,
  domaine, Postgres de prod).
