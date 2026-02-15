---
name: react-modulaire
description: Développe des apps React scalables avec structure feature-based. Priorité simplicité (basique > complexe). Propose arbo + code + test avant génération. Utiliser pour nouvelles features React, refactors, ou quand l'utilisateur mentionne architecture modulaire, features, ou structure projet React.
---

# Projet React Modulaire

Développer une app React scalable avec structure feature-based. **Priorité absolue : simplicité d'abord** (basique > complexe). Toujours proposer **arbo + code + test** avant génération.

---

## Arborescence (feature-based)

```
src/
├── features/[feature]/     # ex: bingo/, auth/
│   # index.ts (barrel exports), components/, hooks/, services/, types/
├── shared/                 # components/, hooks/, utils/ réutilisables cross-features
├── hooks/                  # Hooks globaux
├── utils/                  # Helpers purs
├── App.tsx                 # Routing + Providers uniquement
└── main.tsx
```

**Règles strictes :**

- **Nouvelle feature** : créer `features/[nom]/` avec `index.ts` (barrel exports).
- **Jamais** mettre de code spécifique à une feature dans `App.tsx` ou à la racine de `src/`.
- `shared/` **uniquement** pour ce qui est réutilisé entre plusieurs features.

---

## Composants React

- Composants **fonctionnels + hooks** uniquement.
- **TypeScript** : `interface Props {}` pour **tous** les props et états.
- **Séparer** : composant UI d’un côté, hook logique de l’autre (ex. `BingoBoard` + `useBingo`).
- **< 100 lignes** par fichier ; découper sinon.
- **Nommage** : PascalCase pour les composants, camelCase pour les hooks.

---

## État et side-effects (simple first)

- **D’abord** : `useState` / `useEffect` basiques.
- **Context** uniquement pour state partagé (auth, theme).
- **Pas** de Redux / Zustand / TanStack sans accord explicite de l’utilisateur.
- **useMemo / useCallback** seulement en cas de bottleneck mesuré (ex. Profiler).

---

## Styling

- CSS Modules **ou** Tailwind selon le projet existant.
- Styles **scopés** : pas de CSS global sauf utilitaires partagés.

---

## Tests

- **1 test RTL/Jest par composant** : `render` + `userEvent` + `screen`.
- Gérer les erreurs : ErrorBoundary + `try/catch` pour le code async.

---

## Refactor / Collaboration

Avant de modifier du code :

1. **Diff** avant/après (ou résumé des changements).
2. **3 bullets** : quoi / pourquoi / impact.
3. Proposer une **version basique** en premier.

**Règles :**

- Ne pas modifier **plus d’une feature** sans validation.
- Demander : _« Basique OK ou on scale avec [X] ? »_ avant d’ajouter des libs ou de la complexité.

---

## Checklist nouvelle feature

- [ ] Créer `features/[nom]/` avec `index.ts`, `components/`, `hooks/`, `types/` (et `services/` si besoin).
- [ ] Exporter la feature via le barrel `index.ts`.
- [ ] Pas de code feature-specific dans `App.tsx` ou `src/` racine.
- [ ] Props/state typés avec `interface Props {}`.
- [ ] Composant + hook logique séparés si la logique dépasse quelques lignes.
- [ ] 1 test RTL/Jest pour le composant principal.
- [ ] Proposer arbo + code + test avant de générer.
