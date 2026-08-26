# État d'implémentation — Tour d'Avant-Garde (TAG)

## Sprint 1 + Sprint 2 (hors WhatsApp réel) — Implémenté

**Backend (NestJS + TypeORM)**

- 17 entités : `users`, `roles`, `communities`, `prayer_programs`, `prayer_steps`,
  `prayer_requests`, `intercession_teams`, `meetings`, `notifications`,
  `testimonies`, `action_of_faith`, `world_prayer_intentions`,
  `flambeau_assignments`, `whatsapp_sessions`, `campaigns`, `daily_snapshots`.
- **Base de données configurable sans code** (`backend/src/database/database.config.ts`,
  testé unitairement) : `DB_DRIVER=sqljs` par défaut (zéro config), ou
  `DB_DRIVER=postgres` (`DATABASE_URL` ou champs séparés + `DB_SSL`) — la
  bascule vers Postgres ne demande plus que des variables d'environnement.
- Module `whatsapp` : webhook Meta Cloud API (vérification + réception) qui
  répond réellement via `WhatsappApiService` (Graph API) dès que les identifiants
  sont renseignés dans `.env` ; sinon journalise et continue en mode démo.
  Endpoint `/whatsapp/simulate` conservé pour tester sans compte Meta.
- Module `veilleur` : assistant IA avec les 5 missions Sprint 1.
- Module `dashboard` : agrégation live + `/dashboard/stats` (compteurs globaux).
- Module `world-intentions` et `flambeau` : les deux fonctionnalités bonus du
  cahier des charges, avec gestion interactive (checklist, encouragement)
  réservée au RESPONSABLE.
- Module `auth` : JWT + RBAC par rôle (`@Roles()` / `RolesGuard`), appliqué à
  toutes les routes de mutation ainsi qu'à `GET /users` (annuaire réservé
  RESPONSABLE). Les routes de lecture publiques et le webhook WhatsApp restent
  ouverts.
- Module `campaigns` : campagnes collectives (hors cahier des charges initial,
  ajouté pour remplacer les données factices de la page Campagnes).
- Module `reminders` : rappels planifiés via `@nestjs/schedule` (remplace
  Redis/BullMQ, indisponible dans cet environnement) — rappel de réunion dans
  l'heure précédant son début, relance des requêtes `NEW` non traitées depuis
  plus de 6h vers les responsables.
- Module `analytics` : instantané quotidien des statistiques (`daily_snapshots`),
  capturé automatiquement à 23h55 et consultable via `GET /dashboard/history`
  (+ capture manuelle `POST /dashboard/history/capture` pour les tests).
- Module `storage` : upload de photo pour les témoignages
  (`POST /testimonies/:id/photo`), réservé RESPONSABLE/INTERCESSEUR. Stockage
  abstrait : disque local par défaut (servi sous `/uploads`), bascule
  automatique vers S3 ou tout service compatible (MinIO, Cloudflare R2,
  DigitalOcean Spaces) dès que `S3_BUCKET` est renseigné dans `.env`.
- **Validation des entrées (DTO + class-validator)** sur tous les endpoints de
  mutation exposés : `auth/login`, `prayer-requests`, `meetings`,
  `testimonies`, `campaigns`, `flambeau`, `communities`, `prayer-programs`
  (avec étapes imbriquées), `intercession-teams`, `action-of-faith`, `users`,
  `whatsapp/simulate`. Avant cette passe, le `ValidationPipe` global était
  inactif (aucune vraie classe DTO n'existait) : les endpoints acceptaient
  n'importe quel JSON. Testé : requêtes malformées → 400, requêtes valides →
  succès. `communities`, `prayer-programs` et `intercession-teams` sont
  désormais aussi protégés RESPONSABLE (ils ne l'étaient pas du tout avant).
- **Sécurité** : `helmet` (en-têtes de sécurité HTTP) + `@nestjs/throttler`
  (100 req/min par défaut, 5 tentatives/min sur `/auth/login` contre le
  brute-force). Testé : 6ᵉ tentative de connexion → 429, lectures normales non
  affectées.
- **Documentation API interactive** : Swagger/OpenAPI sur `GET /api/docs`
  (plugin `@nestjs/swagger` activé dans `nest-cli.json`, génère les schémas à
  partir des DTO existants sans annotation manuelle). Testé : document OpenAPI
  généré et accessible.
- **Pagination optionnelle** (`backend/src/common/pagination.ts` +
  `PaginationQueryDto`) sur `GET /prayer-requests`, `GET /notifications`,
  `GET /testimonies`, `GET /meetings` et `GET /campaigns` : sans
  `?page=`/`?limit=`, réponse tableau inchangée (compatibilité
  frontend/mobile) ; avec, réponse `{ data, meta: { total, page, limit,
  totalPages } }`. Testé unitairement et en e2e (les deux formes).
- Module `notifications` étendu avec `EmailService` (SMTP via `nodemailer`) :
  même pattern que `WhatsappApiService`/`StorageService` — mode démo
  (journalisation) sans configuration, envoi réel dès que `SMTP_HOST` est
  renseigné. Branché sur la relance des requêtes en attente (`RemindersService`)
  pour notifier les responsables par e-mail en plus du journal interne.
- **Filtre d'exceptions global** (`AllExceptionsFilter`) : forme de réponse
  d'erreur cohérente sur toute l'API (`statusCode`, `error`, `message`, `path`,
  `timestamp`), erreurs inattendues journalisées côté serveur avec leur pile
  d'appel (jamais renvoyée au client). Testé : 404/400/401 vérifiés en forme.
- **Contrôle de santé enrichi** : `GET /health` vérifie désormais la connexion
  réelle à la base (`SELECT 1`) et renvoie `uptimeSeconds` + le driver actif.
- Script de seed (`npm run seed`) : charge `.env`, rôles, communauté,
  responsable + intercesseurs (dont un compte de connexion), programme du jour
  à 4 étapes, requêtes de démonstration, prochaine rencontre, intention
  mondiale, Flambeau du jour, campagnes de démonstration. Utilise le même
  helper de configuration DB que l'application (pas de divergence possible).
- **34 tests unitaires** (`npm test`, Jest) couvrant `AuthService`, `RolesGuard`,
  `VeilleurService`, `WhatsappService` (routage du menu conversationnel),
  `PrayerRequestsService` (dont pagination), `getDatabaseConnectionOptions`
  (sqljs/postgres) et `EmailService`.
- **10 tests d'intégration end-to-end** (`npm run test:e2e`, Jest + Supertest) :
  vraie application NestJS, vraies requêtes HTTP, base sql.js dédiée et
  jetable (isolée du fichier de développement, nettoyée après coup). Vérifie
  le câblage réel bout-en-bout : santé + statut DB, forme d'erreur 404
  cohérente, login (échec/succès), validation DTO avec détail, parcours complet
  WhatsApp → création de requête → visible en base, RBAC (401 sans token, 200
  avec token responsable). Tous verts.
- **Docker** : `Dockerfile` (backend + frontend), `docker-compose.yml` à la
  racine (service Postgres prêt mais commenté, bascule via `DB_DRIVER`).
  Toujours non testé en local (Docker non installé dans cet environnement),
  mais **les deux images se construisent avec succès sur le runner CI**
  (`docker build` réel, voir ci-dessous) — première validation en conditions
  réelles.
- **CI** : `.github/workflows/ci.yml` (build + tests unitaires + tests e2e
  backend, build des images Docker). Le dépôt est maintenant sur GitHub
  (`wallacefranck13-ai/tag-tour-de-garde`, privé) et **le pipeline tourne et
  passe au vert** sur chaque push vers `main`. Deux bugs réels révélés par le
  tout premier run (jamais visibles en local, Windows) et corrigés :
  - TypeORM échouait à charger `sql.js` sur le runner Linux
    (`this.sqlite is not a function`) — corrigé en passant
    `driver: require('sql.js')` explicitement dans
    `database.config.ts` plutôt que de compter sur le chargement interne de
    TypeORM.
  - `backend/data/` n'existe pas sur un clone frais (entièrement ignoré par
    git) → `ENOENT` à l'écriture de la base sql.js des tests e2e — corrigé
    avec un `.gitkeep` et un `mkdirSync` récursif défensif dans le setup des
    tests.

**Frontend**

- Écran de connexion (JWT en `localStorage`), déconnexion automatique si le
  token expire ou est invalide.
- **Configuration externalisée** : l'URL du backend vit dans `frontend/config.js`
  (`window.TAG_CONFIG.apiBase`), chargé avant `app.js` — changer
  d'environnement de déploiement ne touche plus au code applicatif.
- Toutes les pages connectées aux vraies données, avec repli sur données de
  démonstration si le backend est hors ligne : Demandes de prière, Réunions,
  Campagnes, Groupes, Chroniques (témoignages + photo), Statistiques
  (+ historique), Administration (utilisateurs), Notifications, Messages.
- UI sensible au rôle : lien "Administration" masqué pour les non-responsables
  (en plus du blocage backend) ; checklist du Flambeau, publication
  d'encouragement, création de réunion et upload de photo réservés/adaptés
  selon le rôle connecté.
- Bannière "Intention mondiale du jour", carte "Flambeau de la journée",
  historique quotidien avec capture manuelle pour le RESPONSABLE.
- Module **Simulateur WhatsApp** : chat qui appelle `/whatsapp/simulate`.

**Mobile (squelette, non exécuté sur simulateur/appareil)**

- `mobile/` : app Expo/React Native avec navigation par onglets (Tableau de
  bord, Demandes de prière avec changement de statut, Réunions,
  Notifications), même client API que le web (`src/api.ts`), token JWT via
  `AsyncStorage`. **Non exécutée** dans cet environnement (pas d'Expo CLI, pas
  de simulateur/appareil disponible) — voir `mobile/README.md`.
- Déjà en place, malgré l'absence d'exécution réelle (code écrit et
  maintenant testé unitairement, voir ci-dessous) : retour d'erreur visible
  sur chaque écran (`Alert`/message inline), contrôle de rôle dans l'UI
  (statut des requêtes et création de réunion réservés selon le rôle,
  message "accès limité" sur les notifications pour un rôle non autorisé),
  cache hors-ligne (`AsyncStorage`) avec bannière "backend hors ligne" et
  reprise sur les données mises en cache.
- **26 tests** (`cd mobile && npm test`, Jest avec le preset `jest-expo`, sans
  Expo CLI ni simulateur/appareil) : 11 tests de logique sur `src/api.ts`
  (connexion, validité/expiration JWT, repli sur cache hors-ligne, 403 RBAC
  vs backend injoignable) + 15 tests de rendu de composants
  (`@testing-library/react-native`, `../api` mocké) couvrant les 5 écrans
  (`LoginScreen`, `DashboardScreen`, `PrayerRequestsScreen`, `MeetingsScreen`,
  `NotificationsScreen`) — vérifient notamment le **contrôle de rôle dans
  l'UI** (un membre ne voit pas le sélecteur de statut ni le bouton de
  création de réunion, un responsable peut changer le statut d'une requête et
  créer une réunion) et la distinction RBAC (403) vs backend injoignable côté
  UI. Intégré au CI (job `mobile` dans `.github/workflows/ci.yml`) — stable
  sur plusieurs relances consécutives après correction d'un flake initial
  (fake timers globaux incompatibles avec `FlatList` sous charge CI).

### Reste bloqué sur un élément externe

- **WhatsApp Cloud API réelle** : l'envoi est codé (`WhatsappApiService`), il
  manque un compte Meta Business (`WHATSAPP_ACCESS_TOKEN`,
  `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`).

### Reste à faire (aucun blocage, pas encore fait)

- RBAC affiné : granularité plus fine si de nouveaux rôles apparaissent.
- Vraie file de tâches distribuée (BullMQ + Redis) si le volume de rappels ou
  un déploiement multi-instance l'exige — la solution actuelle
  (`@nestjs/schedule`, in-process) suffit pour une seule instance.
- App mobile : notifications push, build EAS et publication sur les stores.
  Reste bloqué sur un élément externe (pas d'Expo CLI, simulateur ou
  appareil dans cet environnement) : impossible de lancer l'app pour la voir
  tourner réellement, seuls la logique et le rendu isolé des composants ont
  pu être vérifiés (les 5 écrans sont maintenant couverts).
- Déploiement effectif : `render.yaml` (Blueprint Render, backend Docker +
  frontend statique, `JWT_SECRET`/`WHATSAPP_VERIFY_TOKEN` auto-générés,
  `config.js` du frontend réécrit au build avec l'URL réelle du backend) est
  prêt et poussé, mais **jamais appliqué** — nécessite un compte Render créé
  par l'utilisateur (accès externe indisponible ici). Vraie instance
  PostgreSQL à connecter (le code est prêt, voir `.env.example`) — toujours
  sur sql.js en développement, Docker
  toujours indisponible en local dans cet environnement.
