# 📱 Configuration Google Services - Multi-Environnement

## 🎯 Vue d'ensemble

Votre application est maintenant configurée pour utiliser **deux projets Firebase différents** selon l'environnement :

| Environnement   | Fichier                           | Build Type | Usage                   |
| --------------- | --------------------------------- | ---------- | ----------------------- |
| **DEVELOPMENT** | `google-services.json`            | debug      | Tests locaux, émulation |
| **PRODUCTION**  | `google-services-production.json` | release    | Store de production     |

## 📂 Structure des fichiers

```
android/app/
├── google-services.json              # ✓ DEVELOPMENT (projet Firebase dev)
├── google-services-production.json    # ✓ PRODUCTION (projet Firebase prod)
└── build.gradle                       # Configure la sélection automatique
```

## 🚀 Utilisation

### Build pour le développement

```bash
# Avec Expo
npx expo run:android --configuration debug

# Ou directement
cd android && ./gradlew assembleDebug
```

**Résultat :** L'app utilisera `google-services.json` (environnement dev)

### Build pour la production

#### Option 1 : Avec EAS (recommandé) 🔥

```bash
# Build pour production
eas build --platform android --profile production

# Build et submit directement au Play Store
eas build --platform android --profile production --auto-submit
```

**Résultat :** L'app utilisera `google-services-production.json` (environnement prod)

#### Option 2 : Build locale

```bash
cd android
./gradlew assembleRelease
```

**Résultat :** Génère l'APK de production avec `google-services-production.json`

## 🔄 Comment ça fonctionne ?

### 1️⃣ Sélection automatique lors de la build

Le fichier `android/app/build.gradle` contient une **tâche Gradle** qui :

```gradle
task selectGoogleServicesJson {
    doLast {
        if (gradle.startParameter.taskNames.any {
            it.contains("release") || it.contains("production")
        }) {
            // PRODUCTION: utiliser google-services-production.json
            println "🔴 BUILD PRODUCTION"
        } else {
            // DEVELOPMENT: utiliser google-services.json
            println "🟢 BUILD DEVELOPMENT"
        }
    }
}
```

Cette tâche s'exécute **avant chaque build** et sélectionne automatiquement le bon fichier.

### 2️⃣ Configuration EAS

Le fichier `eas.json` configure les profils de build :

```json
{
  "build": {
    "development": {
      "env": { "GOOGLE_SERVICES_JSON": "dev" }
    },
    "production": {
      "env": { "GOOGLE_SERVICES_JSON": "production" },
      "android": { "buildType": "release" }
    }
  }
}
```

Quand vous lancez `eas build --profile production`, cela déclenche un **buildType release**, qui utilise automatiquement `google-services-production.json`.

## ✅ Checklist avant de publier

- ✅ Vérifier que `google-services.json` existe dans `android/app/`
- ✅ Vérifier que `google-services-production.json` existe dans `android/app/`
- ✅ Vérifier que les deux fichiers ont les bonnes credentials Firebase
- ✅ Tester la build debug localement
- ✅ Tester la build release avec EAS
- ✅ Vérifier les logs de build pour confirmer le bon fichier est utilisé

### Logs pour vérifier le bon fichier

Lors du build, vous verrez dans les logs :

```
# Development
🟢 BUILD DEVELOPMENT: Utilisation de google-services.json

# Production
🔴 BUILD PRODUCTION: Copie de google-services-production.json
```

## 🔍 Dépannage

### Erreur: "google-services-production.json introuvable"

**Cause :** Le fichier manque dans `android/app/`

**Solution :**

```bash
# Vérifier que le fichier existe
ls android/app/google-services-*

# Si absent, récréer depuis Firebase Console
# (Voir FIREBASE_RULES_GUIDE.md)
```

### L'app utilise les mauvaises credentials

**Cause :** Le fichier sélectionné n'est pas le bon

**Solution :**

1. Vérifier le log de build pour voir quel fichier est utilisé
2. Vérifier que les credentials Firebase dans les fichiers sont corrects
3. Nettoyer le cache et rebuild :

```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

### Erreur lors du build release

```bash
./gradlew assembleRelease --info
```

Cela affichera les logs détaillés pour identifier le problème.

## 📝 Ajouter un 3e environnement (STAGING)

Si vous avez besoin d'un environnement de staging :

1. **Créer le fichier** `android/app/google-services-staging.json`
2. **Modifier** `eas.json` :

```json
{
  "build": {
    "staging": {
      "distribution": "internal",
      "env": { "GOOGLE_SERVICES_JSON": "staging" },
      "android": { "buildType": "release" }
    }
  }
}
```

3. **Build avec :** `eas build --platform android --profile staging`

## 🔒 Sécurité

### NE PAS

- ❌ Commiter les vraies credentials en public
- ❌ Partager les fichiers `google-services-*.json` par email
- ❌ Mettre les clés Firebase dans le code source

### À FAIRE

- ✅ Garder les fichiers JSON en local seulement
- ✅ Utiliser `.gitignore` pour `google-services-*.json`
- ✅ Mettre à jour les credentials via Firebase Console si compromises
- ✅ Utiliser une CI/CD sécurisée (GitHub Actions avec secrets)

## 🔗 Ressources

- [Google Firebase Console](https://console.firebase.google.com)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Android Build Variants](https://developer.android.com/build/build-variants)

---

**Version:** 1.0  
**Dernière mise à jour:** 2026-05-07
