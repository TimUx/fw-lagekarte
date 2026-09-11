# FW Lagekarte - Dokumentations-Übersicht

Willkommen zur Dokumentation der FW Lagekarte! Diese Seite gibt einen Überblick über alle verfügbaren Dokumentations-Ressourcen.

## 📚 Dokumentations-Struktur

Die Dokumentation ist in mehrere Dateien aufgeteilt, die jeweils einen spezifischen Aspekt der Anwendung abdecken:

### Für Anwender

| Dokument | Zweck | Zielgruppe | Länge |
|----------|-------|------------|-------|
| **[README.md](README.md)** | Übersicht, Installation, Features | Alle Nutzer | ~10 Min. |
| **[QUICKSTART.md](QUICKSTART.md)** | Schnelleinstieg in 5 Minuten | Neue Nutzer | ~5 Min. |
| **[BENUTZERHANDBUCH.md](BENUTZERHANDBUCH.md)** | Ausführliche Bedienungsanleitung | Alle Nutzer | ~30 Min. |
| **[FEATURES.md](FEATURES.md)** | Detaillierte Feature-Beschreibungen | Interessierte Nutzer | ~15 Min. |

### Für Entwickler

| Dokument | Zweck | Zielgruppe | Länge |
|----------|-------|------------|-------|
| **[ARCHITEKTUR.md](ARCHITEKTUR.md)** | Technische Architektur und Entwickler-Dokumentation | Entwickler | ~20 Min. |

## 🎯 Wo soll ich anfangen?

### Ich bin neu hier und möchte die App ausprobieren
→ **[QUICKSTART.md](QUICKSTART.md)** - In 5 Minuten einsatzbereit!

### Ich möchte die App installieren
→ **[README.md](README.md#installation)** - Installation für Windows, Linux, macOS

### Ich möchte alle Funktionen kennenlernen
→ **[BENUTZERHANDBUCH.md](BENUTZERHANDBUCH.md)** - Ausführliche Anleitung mit Screenshots

### Ich möchte wissen, was die App alles kann
→ **[FEATURES.md](FEATURES.md)** - Vollständige Feature-Liste

### Ich möchte an der App mitentwickeln
→ **[ARCHITEKTUR.md](ARCHITEKTUR.md)** - Technische Dokumentation

## 📖 Schnellreferenz

### Installation

```bash
# Von GitHub Releases herunterladen
# Windows: FW-Lagekarte-Setup-X.X.X.exe
# Linux: FW-Lagekarte-X.X.X.AppImage oder .deb
# macOS: FW-Lagekarte-X.X.X.dmg

# Oder aus Quellcode
git clone https://github.com/TimUx/fw-lagekarte.git
cd fw-lagekarte
npm install
npm start
```

### Grundfunktionen

1. **Standort hinzufügen**: Rechtsklick auf Karte → "Standort hier hinzufügen"
2. **Fahrzeug hinzufügen**: Button "➕ Fahrzeug hinzufügen" → Formular ausfüllen
3. **Fahrzeug einsetzen**: Fahrzeug aus Seitenleiste auf Karte ziehen (Drag & Drop)
4. **Ansicht speichern**: Button "💾 Kartenansicht speichern"

### Multi-User-Modus

**Server starten**:
1. Button "🔄 Synchronisation"
2. Modus: "Server (Synchronisation bereitstellen)"
3. Speichern

**Client verbinden**:
1. Button "🔄 Synchronisation"
2. Modus: "Client (Zum Server verbinden)"
3. URL eingeben (z.B. `ws://192.168.1.100:8080`)
4. Speichern

### Tastenkombinationen

- **ESC** - Dialog schließen
- **Ctrl/Cmd + Plus** - Hineinzoomen
- **Ctrl/Cmd + Minus** - Herauszoomen
- **Ctrl/Cmd + 0** - Zoom zurücksetzen
- **F11** - Vollbild
- **Ctrl/Cmd + R** - Neu laden

## 📂 Dateistruktur

```
fw-lagekarte/
├── README.md                # Hauptdokumentation (Start hier!)
├── QUICKSTART.md            # 5-Minuten-Schnelleinstieg
├── BENUTZERHANDBUCH.md      # Ausführliches Handbuch
├── FEATURES.md              # Feature-Liste
├── ARCHITEKTUR.md           # Technische Dokumentation
├── DOKUMENTATION.md         # Diese Datei
│
├── main.js                  # Electron Hauptprozess
├── renderer.js              # UI-Logik
├── storage.js               # Datenverwaltung
├── sync.js                  # Synchronisation
├── embedded-server.js       # Integrierter Server
│
├── index.html               # Haupt-UI
├── readonly-viewer.html     # Web Viewer
├── proxy-settings.html      # Proxy-Konfiguration
│
└── assets/
    ├── screenshots/         # Screenshots für Dokumentation
    └── tactical-symbols/    # Taktische Zeichen (SVG)
```

## 🆘 Hilfe und Support

### Häufige Probleme

**Karte lädt nicht**:
→ [BENUTZERHANDBUCH.md - Proxy-Einstellungen](BENUTZERHANDBUCH.md#proxy-einstellungen)

**Multi-User funktioniert nicht**:
→ [BENUTZERHANDBUCH.md - Server-Modus Probleme](BENUTZERHANDBUCH.md#server-modus-probleme)

**Windows SmartScreen-Warnung**:
→ [BENUTZERHANDBUCH.md - SmartScreen umgehen](BENUTZERHANDBUCH.md#windows-smartscreen-warnung-umgehen)

### Support-Kanäle

- **Bugs melden**: [GitHub Issues](https://github.com/TimUx/fw-lagekarte/issues)
- **Fragen stellen**: [GitHub Discussions](https://github.com/TimUx/fw-lagekarte/discussions)
- **Quellcode**: [GitHub Repository](https://github.com/TimUx/fw-lagekarte)

## 📝 Dokumentation bearbeiten

Diese Dokumentation ist Open Source und lebt von Beiträgen:

1. Fork das Repository
2. Bearbeite die Markdown-Dateien
3. Erstelle einen Pull Request

Alle Markdown-Dateien befinden sich im Repository-Root.

## 🔄 Versionshistorie

Die Dokumentation wird kontinuierlich aktualisiert. Siehe [GitHub Releases](https://github.com/TimUx/fw-lagekarte/releases) für Version-spezifische Änderungen.

## 📄 Lizenz

FW Lagekarte und diese Dokumentation sind unter der ISC-Lizenz veröffentlicht.

Siehe [LICENSE](LICENSE) für Details.

---

**Zuletzt aktualisiert**: Dezember 2024

**Dokumentations-Version**: 1.0

**App-Version**: 0.2.1
