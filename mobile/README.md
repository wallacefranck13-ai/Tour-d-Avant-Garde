# Tour d'Avant-Garde — Mobile (squelette)

**Statut : squelette avec 19 tests (logique + rendu), jamais lancé sur un
appareil.** Cet environnement n'a ni Expo CLI, ni simulateur, ni appareil
physique connecté — l'app n'a donc jamais pu être vue tourner réellement.
C'est un point de départ solide pour le Sprint "Application mobile", pas une
app terminée.

## Contenu

- Navigation (`App.tsx`) — `NavigationContainer` + onglets (`@react-navigation/bottom-tabs`) :
  Tableau de bord / Demandes / Réunions, affichés une fois connecté.
- Écran de connexion (`src/screens/LoginScreen.tsx`) — valide les champs
  localement puis appelle `POST /auth/login` avec retour d'erreur visible.
- Écran tableau de bord (`src/screens/DashboardScreen.tsx`) — affiche les
  statistiques live, l'intention mondiale et la session en cours via
  `GET /dashboard/overview`, avec pull-to-refresh et alerte en cas d'échec.
- Écran Demandes de prière (`src/screens/PrayerRequestsScreen.tsx`) — dépôt
  d'une requête, liste des demandes et changement de statut selon le rôle.
- Écran Réunions (`src/screens/MeetingsScreen.tsx`) — liste des rencontres à venir
  et permet à un responsable d'en créer une.
- Écran Notifications (`src/screens/NotificationsScreen.tsx`) — consulte le
  journal des alertes pour les responsables et intercesseurs, avec cache local.
- Client API (`src/api.ts`) — réutilise exactement les mêmes endpoints que le
  frontend web, token JWT stocké via `AsyncStorage`.

## Pour démarrer (non vérifié dans cet environnement)

```bash
cd mobile
npm install
npx expo start
```

Sur un appareil physique avec Expo Go, remplacez `localhost` par l'adresse IP
locale de votre machine dans `src/api.ts` (`API_BASE`), le téléphone ne pouvant
pas résoudre `localhost` vers votre PC.

## Tests

```bash
cd mobile
npm install
npm test
```

**19 tests** (Jest, preset `jest-expo`), en deux couches :

- **11 tests de logique** (`src/api.test.ts`) — connexion, validité et
  expiration du token JWT, repli sur le cache hors-ligne, distinction 403
  (RBAC) vs backend injoignable. `fetch` et `AsyncStorage` mockés.
- **8 tests de rendu de composants** (`@testing-library/react-native`),
  `../api` entièrement mocké :
  - `LoginScreen` — validation locale, appel de `login()`, message d'erreur
    serveur affiché.
  - `DashboardScreen` — statistiques affichées une fois chargées, bannière
    hors-ligne, déconnexion.
  - `PrayerRequestsScreen` — **contrôle de rôle dans l'UI** : un membre ne
    peut pas ouvrir le sélecteur de statut, un responsable peut l'ouvrir et
    changer le statut d'une requête.

Tourne sans Expo CLI ni simulateur/appareil — `jest-expo` fournit
l'environnement de test (mocks natifs RN) sans lancer de vraie app.

## Ce qui manque pour une vraie app

- Notifications push, mode hors-ligne plus poussé si besoin (le cache actuel
  ne couvre que les listes déjà consultées).
- Tests de composants pour `MeetingsScreen` et `NotificationsScreen` (même
  infra déjà en place, juste pas encore écrits).
- Build EAS et publication sur les stores.
- Faire tourner l'app pour de vrai (Expo Go / simulateur / build) — jamais
  fait dans aucun environnement jusqu'ici, seule la logique et le rendu
  isolé des composants ont pu être vérifiés.
