# AperoGame Mobile 🎲

Application mobile développée avec [Expo](https://expo.dev) et [React Native](https://reactnative.dev).

---

## Prérequis

- [Node.js](https://nodejs.org) >= 18
- [npm](https://www.npmjs.com) >= 9
- [Expo Go](https://expo.dev/go) sur iOS ou Android pour tester sur appareil physique

---

## Installation

```bash
npm install
```

---

## Lancement

### Démarrer le serveur de développement

```bash
npm start
```

Un QR code s'affiche dans le terminal. Scannez-le avec **Expo Go** (Android) ou l'appareil photo (iOS) pour lancer l'app sur votre téléphone.

### Lancer sur simulateur iOS

```bash
npm run ios
```

### Lancer sur émulateur Android

```bash
npm run android
```

### Lancer dans le navigateur

```bash
npm run web
```

---

## Build

Les builds de production sont gérés via **[EAS Build](https://docs.expo.dev/build/introduction/)** (Expo Application Services).

### Installation de EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Build iOS (`.ipa`)

```bash
eas build --platform ios
```

### Build Android (`.apk` / `.aab`)

```bash
eas build --platform android
```

### Build pour les deux plateformes

```bash
eas build --platform all
```

---

## Autres commandes

| Commande | Description |
|---|---|
| `npm run lint` | Analyse statique du code |
| `npm run reset-project` | Réinitialise le projet (déplace le code de démarrage dans `app-example`) |

---

## Conventions de contribution

### Messages de commit

Les messages de commit sont validés automatiquement par **Husky + Commitlint** à chaque `git commit`.

**Format :**
```
type: description courte
```

**Types autorisés :**

| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `style` | Formatage (sans changement de logique) |
| `refactor` | Refactorisation du code |
| `test` | Ajout ou modification de tests |
| `chore` | Maintenance (build, dépendances…) |
| `perf` | Amélioration des performances |
| `ci` | Changements CI/CD |
| `revert` | Annulation d'un commit précédent |

**Règles :**
- La description ne doit pas commencer par une majuscule
- 100 caractères maximum

**Exemples :**
```bash
git commit -m "feat: ajout de l'écran de jeu"   # ✅
git commit -m "fix: correction du score nul"     # ✅
git commit -m "Ajout de trucs"                   # ❌ type manquant
git commit -m "FEAT: nouvelle page"              # ❌ type en majuscules
```

---

### Titres de Merge Request

Les titres de MR sont validés automatiquement par la **CI/CD GitLab** à l'ouverture ou la modification d'une MR.

**Format :**
```
type: [Subject] description courte
```

- `type` — même liste que pour les commits
- `[Subject]` — contexte entre crochets (ex : `[Auth]`, `[Score]`, `[CI]`)
- `description courte` — 100 caractères maximum au total

**Exemples :**
```
feat: [Auth] ajout de la connexion Google        ✅
fix: [Score] correction du calcul des points     ✅
chore: [CI] mise à jour du pipeline              ✅
update: [Auth] type invalide                     ❌
feat: [Auth]                                     ❌ description manquante
feat: Auth ajout de la page                      ❌ crochets manquants
```
