# Release-Prozess

Dieses Dokument beschreibt, wie man ein neues Release für FW Lagekarte erstellt.

## Voraussetzungen

- Push-Rechte für das Repository
- Git installiert

## Release erstellen

### 1. Version aktualisieren

Aktualisiere die Version in `package.json`:

```bash
# Für ein Prerelease (Alpha/Beta/RC)
npm version prerelease --preid=alpha

# Für ein Minor Release
npm version minor

# Für ein Patch Release
npm version patch

# Für ein Major Release
npm version major
```

### 2. Tag erstellen und pushen

```bash
# Tag erstellen (wird automatisch von npm version erstellt)
git tag v0.1.0-alpha.1

# Tag zum GitHub pushen
git push origin v0.1.0-alpha.1
```

### 3. GitHub Actions Build

Nach dem Push des Tags startet automatisch der GitHub Actions Workflow:

1. **Build-Phase**: Erstellt Executables für:
   - Windows (NSIS Installer - `.exe`)
   - Linux (AppImage und Debian Package - `.AppImage`, `.deb`)
   - macOS (DMG - `.dmg`)

2. **Release-Phase**: Erstellt automatisch ein GitHub Release:
   - Bei Tags mit `alpha`, `beta` oder `rc` wird ein Prerelease erstellt
   - Alle Build-Artefakte werden dem Release hinzugefügt

### 4. Release veröffentlichen

Das Release wird automatisch erstellt. Du kannst es unter [Releases](https://github.com/TimUx/fw-lagekarte/releases) finden.

Bei einem Prerelease:
- ✅ Automatisch als "Prerelease" markiert
- ⚠️ Warnung, dass dies keine stabile Version ist

## Manueller Build (lokal)

Falls du die Builds lokal testen möchtest:

```bash
# Alle Plattformen bauen
npm run build

# Nur Windows
npm run build:win

# Nur Linux
npm run build:linux

# Nur macOS
npm run build:mac
```

Die Builds werden im `dist/`-Verzeichnis erstellt.

## Versionsschema

Wir folgen [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (z.B. `1.0.0`)
  - MAJOR: Breaking Changes
  - MINOR: Neue Features (rückwärtskompatibel)
  - PATCH: Bugfixes

- **Prerelease**: `MAJOR.MINOR.PATCH-PREID.NUMBER` (z.B. `0.1.0-alpha.1`)
  - alpha: Frühe Testversion
  - beta: Feature-komplett, in Testing
  - rc: Release Candidate

## Beispiele

```bash
# Erstes Alpha Release
npm version 0.1.0-alpha.1 --no-git-tag-version
git commit -am "Release v0.1.0-alpha.1"
git tag v0.1.0-alpha.1
git push origin v0.1.0-alpha.1

# Zweites Alpha Release
npm version prerelease --preid=alpha
git push origin v0.1.0-alpha.2

# Beta Release
npm version 0.1.0-beta.1 --no-git-tag-version
git commit -am "Release v0.1.0-beta.1"
git tag v0.1.0-beta.1
git push origin v0.1.0-beta.1

# Finales Release
npm version 0.1.0 --no-git-tag-version
git commit -am "Release v0.1.0"
git tag v0.1.0
git push origin v0.1.0
```

## Troubleshooting

### Build schlägt fehl

1. Überprüfe die GitHub Actions Logs
2. Teste den Build lokal mit `npm run build`
3. Stelle sicher, dass alle Abhängigkeiten korrekt installiert sind

### Release wurde nicht erstellt

1. Überprüfe, ob der Tag mit `v` beginnt (z.B. `v0.1.0-alpha.1`)
2. Überprüfe die GitHub Actions Permissions
3. Stelle sicher, dass der Workflow-Lauf erfolgreich war
