# NightBingo

App mobile de bingo prédiction sociale (React Native Expo + Firebase).

## Setup

1. **Installation**

   ```bash
   npm install
   ```

2. **Firebase**
   - Créer un projet Firebase, activer Auth (email/password + anonyme) et Firestore.
   - Copier `.env.example` vers `.env` et remplir les variables `EXPO_PUBLIC_FIREBASE_*`.

### Google Sign-In (Android + Play Store)

1. Activer le provider Google dans Firebase Auth.
2. Ajouter la variable `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` dans `.env` avec l'OAuth client Web de Firebase (client_type 3).
3. Dans Firebase Project Settings, ajouter les empreintes SHA-1/SHA-256 Android pour `com.nightbingo.app`:
   - debug keystore (tests locaux)
   - upload key (ta signature locale/EAS)
   - App Signing key Google Play (obligatoire en production)
4. Télécharger le `google-services.json` mis a jour et le remplacer a la racine du projet.
5. Rebuild natif Android apres changement de config: `npx expo run:android`.

Sans ces empreintes release (surtout la App Signing key Play), la connexion Google peut fonctionner en debug mais echouer apres publication Play Store.

3. **Index Firestore**
   - Si tu as l’erreur _"The query requires an index"_ en créant une grille, **clique sur le lien donné dans le message d’erreur** dans le terminal : il ouvre la console Firebase avec l’index pré-rempli. Clique sur « Create index » et attends 1–2 min que l’index se construise.
   - Sinon, crée l’index à la main : Firestore → Indexes → Add index → Collection `cells`, champs `gameId` (Ascending), `index` (Ascending).

4. **Lancer**
   ```bash
   npx expo start
   ```

## Structure (feature-based)

- `src/features/auth` — Connexion (anonyme, email)
- `src/features/servers` — Serveurs (liste, créer, rejoindre par code)
- `src/features/games` — Parties (créer, grille, validation, classement)
- `src/shared` — Config Firebase, composants réutilisables (GridCell, Leaderboard)
- `src/navigation` — Stack React Navigation

## Règles métier

- Lobby : remplir les cases (min 10 caractères). La partie ne démarre que quand la grille est pleine (admin).
- Active : un joueur tape une case → statut "pending". L’admin valide ou rejette. On ne peut pas valider sa propre case.
- Classement en temps réel : nombre de cases validées par utilisateur.
