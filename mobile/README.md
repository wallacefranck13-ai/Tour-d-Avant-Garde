# Tour d'Avant-Garde — Mobile (squelette)

**Statut : squelette de démarrage, non testé.** Cet environnement n'a ni Expo
CLI, ni simulateur, ni appareil physique connecté — ce code n'a donc pas pu
être exécuté ni vérifié. C'est un point de départ pour le Sprint "Application
mobile", pas une app terminée.

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

11 tests unitaires (Jest + ts-jest) sur `src/api.ts` — connexion, validité et
expiration du token JWT, repli sur le cache hors-ligne, distinction 403
(RBAC) vs backend injoignable. Tourne sans Expo ni simulateur (mock de
`fetch` et `@react-native-async-storage/async-storage`) ; ne couvre donc que
la logique du client API, pas le rendu des écrans.

## Ce qui manque pour une vraie app

- Notifications push, mode hors-ligne plus poussé si besoin (le cache actuel
  ne couvre que les listes déjà consultées).
- Tests de composants (rendu des écrans, navigation) avec
  `jest-expo`/`@testing-library/react-native`.
- Build EAS et publication sur les stores.
