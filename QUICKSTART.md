# FW Lagekarte - Schnellstart

![FW Lagekarte Hauptansicht](assets/screenshots/hauptansicht.png)

## 🚀 Installation & Start

```bash
# 1. Repository klonen
git clone https://github.com/TimUx/fw-lagekarte.git
cd fw-lagekarte

# 2. Abhängigkeiten installieren
npm install

# 3. Anwendung starten
npm start
```

## 🎯 Erste Schritte

### Schritt 1: Standort hinzufügen

![Standort Dialog](assets/screenshots/standort-dialog.png)

1. Klicken Sie auf "➕ Standort hinzufügen"
2. Geben Sie den Namen ein (z.B. "Feuerwache Nord")
3. Klicken Sie auf die Karte um die Position zu markieren
4. Klicken Sie auf "Speichern"

### Schritt 2: Fahrzeuge hinzufügen

![Fahrzeug Dialog](assets/screenshots/fahrzeug-dialog.png)

1. Klicken Sie auf "➕ Fahrzeug hinzufügen"
2. Geben Sie Rufname ein (z.B. "Florian Hamburg 1/44/1")
3. Wählen Sie den Fahrzeugtyp (LF, DLK, TLF, etc.)
4. Geben Sie die Besatzung ein (z.B. "1/8")
5. Klicken Sie auf "Speichern"

### Schritt 3: Fahrzeuge einsetzen
1. Ziehen Sie ein Fahrzeug aus der linken Seitenleiste
2. Lassen Sie es auf der Karte am Einsatzort fallen
3. Das Fahrzeug wird grün markiert (im Einsatz)

### Schritt 4: Kartenansicht speichern
1. Zoomen und positionieren Sie die Karte wie gewünscht
2. Klicken Sie auf "💾 Kartenansicht speichern"
3. Die Ansicht wird beim nächsten Start wiederhergestellt

## 🎨 Benutzeroberfläche

```
┌─────────────────────────────────────────────────────────────┐
│ 🚒 FW Lagekarte - Einsatzübersicht                          │
│ [➕ Standort] [➕ Fahrzeug] [💾 Karte] [📤 Export] [📥 Import]│
├───────────────┬─────────────────────────────────────────────┤
│ Verfügbare    │                                             │
│ Fahrzeuge     │                                             │
│               │           Karte (OpenStreetMap)             │
│ ┌───────────┐ │                                             │
│ │ Florian   │ │          🏢 Feuerwache Nord                 │
│ │ Hamburg   │ │                                             │
│ │ 1/44/1    │ │     🚒 (Fahrzeug im Einsatz)                │
│ │ LF        │ │                                             │
│ │ Bes: 1/8  │ │                                             │
│ └───────────┘ │          🏢 Feuerwache Süd                  │
│               │                                             │
│ ┌───────────┐ │                                             │
│ │ Florian   │ │                                             │
│ │ Hamburg   │ │                                             │
│ │ 1/45/1    │ │                                             │
│ │ DLK       │ │                                             │
│ │ Bes: 1/3  │ │                                             │
│ └───────────┘ │                                             │
│               │                                             │
│ 2 Fahrzeuge   │                                             │
│ 1 im Einsatz  │                                             │
└───────────────┴─────────────────────────────────────────────┘
```

## 📚 Dokumentation

- **README.md** - Diese Datei
- **BENUTZERHANDBUCH.md** - Ausführliches Benutzerhandbuch
- **FEATURES.md** - Feature-Übersicht und technische Details
- **IMPLEMENTATION_SUMMARY.md** - Implementierungsdetails

## 🔧 Entwicklung

### Projektstruktur
```
fw-lagekarte/
├── main.js              # Electron Hauptprozess
├── preload.js           # Sicherer Preload-Script
├── renderer.js          # UI-Logik (522 Zeilen)
├── storage.js           # Datenpersistenz (129 Zeilen)
├── index.html           # HTML-Struktur
├── styles.css           # Styling (371 Zeilen)
├── package.json         # Abhängigkeiten
└── assets/              # Icons & Ressourcen
```

### Technologie-Stack
- **Electron 39.x** - Plattformübergreifendes Desktop-Framework
- **Leaflet.js 1.9.x** - Karten-Bibliothek
- **LocalForage 1.10.x** - Datenspeicherung
- **OpenStreetMap** - Kartendaten

## 🛡️ Sicherheit

✅ Context Isolation aktiviert
✅ XSS-Schutz durch HTML-Sanitization
✅ Keine Node-Integration im Renderer
✅ CodeQL-Scan: 0 Sicherheitslücken
✅ Alle Daten bleiben lokal

## 🌐 Offline-Fähigkeit

Die Anwendung funktioniert vollständig offline:
- Keine Internet-Verbindung für den Betrieb nötig
- Kartenkacheln werden gecacht
- Alle Daten lokal in IndexedDB
- Keine externe Server-Kommunikation

## 📦 Installer erstellen

```bash
# Alle Plattformen
npm run build

# Nur Windows
npm run build:win

# Nur Linux (AppImage & .deb)
npm run build:linux

# Nur macOS
npm run build:mac
```

Die Installer werden im `dist/`-Verzeichnis erstellt.

## 🖥️ Plattformunterstützung

Die Anwendung läuft auf allen gängigen Betriebssystemen:
- ✅ **Windows** - NSIS Installer (.exe)
- ✅ **Linux** - AppImage und .deb Pakete
- ✅ **macOS** - DMG Installer

Alle Funktionen sind auf allen Plattformen verfügbar.

## 💡 Tipps

- **ESC-Taste**: Schließt Dialoge
- **Drag & Drop**: Fahrzeuge auf Karte ziehen
- **Rechtsklick**: Marker auf Karte zeigen Details
- **Export**: Regelmäßig Backups erstellen
- **Zoom**: Mausrad oder +/- Buttons

## 🆘 Support

Bei Fragen oder Problemen:
1. Prüfen Sie die Dokumentation in BENUTZERHANDBUCH.md
2. Erstellen Sie ein Issue auf GitHub
3. Kontaktieren Sie den Maintainer

## 📄 Lizenz

Siehe LICENSE-Datei

---

**Viel Erfolg beim Einsatz! 🚒🚨**
