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

3. **Index Firestore**

   - Si tu as l’erreur *"The query requires an index"* en créant une grille, **clique sur le lien donné dans le message d’erreur** dans le terminal : il ouvre la console Firebase avec l’index pré-rempli. Clique sur « Create index » et attends 1–2 min que l’index se construise.
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
