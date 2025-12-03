# FW Lagekarte - Feuerwehr Lagekarte für Großeinsätze

Eine Desktop-Anwendung zur Verwaltung von Feuerwehr-Einsatzlagen mit interaktiver Karte.

## Features

- 🗺️ **OpenStreetMap Integration** - Interaktive Kartenansicht mit OSM
- 🌍 **Mehrere Karten-Layer** - Wechsel zwischen OpenStreetMap, Satellit, Topographisch und Hybrid-Ansicht
- 🏢 **Standortverwaltung** - Feuerwehr-Standorte auf der Karte markieren und verwalten
- 🚒 **Fahrzeugverwaltung** - Fahrzeuge mit Typ, Rufname, Besatzung usw. anlegen
- 🎯 **Drag & Drop** - Fahrzeuge per Drag & Drop auf der Karte platzieren
- 💾 **Persistente Speicherung** - Alle Daten werden lokal gespeichert
- 🖨️ **Druckfunktion** - Professionelle Druckausgabe der Lagekarte mit Legende
- 🔄 **Netzwerk-Synchronisation** - Optional: Multi-User Echtzeit-Synchronisation über WebSocket
- ✏️ **Bearbeitung** - Standorte und Fahrzeuge können jederzeit bearbeitet oder gelöscht werden
- 🔌 **Offline-Fähig** - Funktioniert komplett offline (nach erstem Kartenladen)
- 💻 **Plattformübergreifend** - Läuft auf Windows, Linux und macOS

## Installation

### Voraussetzungen
- Node.js (v16 oder höher)
- npm

### Entwicklungsumgebung starten

```bash
# Abhängigkeiten installieren
npm install

# Anwendung starten
npm start
```

### Installer erstellen

```bash
# Alle Plattformen bauen
npm run build

# Nur Windows-Installer bauen
npm run build:win

# Nur Linux-Installer bauen (AppImage und .deb)
npm run build:linux

# Nur macOS-Installer bauen
npm run build:mac
```

Die Installer werden im `dist/`-Verzeichnis erstellt.

## Benutzung

### Standorte hinzufügen
1. Klicken Sie auf "➕ Standort hinzufügen"
2. Geben Sie Name und Adresse ein
3. Klicken Sie auf die Karte, um die Position zu wählen (oder geben Sie Koordinaten ein)
4. Klicken Sie auf "Speichern"

### Fahrzeuge hinzufügen
1. Klicken Sie auf "➕ Fahrzeug hinzufügen"
2. Geben Sie Rufname, Typ, Besatzung usw. ein
3. Klicken Sie auf "Speichern"
4. Das Fahrzeug erscheint in der linken Seitenleiste

### Fahrzeuge zum Einsatz schicken
1. Ziehen Sie ein Fahrzeug aus der Seitenleiste auf die Karte (Drag & Drop)
2. Das Fahrzeug wird an der Position platziert
3. Sie können das Fahrzeug auf der Karte weiter verschieben

### Fahrzeuge zurückrufen
1. Klicken Sie auf das Fahrzeug-Icon auf der Karte
2. Klicken Sie auf "↩️ Zurückrufen"
3. Das Fahrzeug erscheint wieder in der Seitenleiste

### Kartenansicht speichern
1. Zoomen und verschieben Sie die Karte zur gewünschten Ansicht
2. Klicken Sie auf "💾 Kartenansicht speichern"
3. Die Ansicht wird beim nächsten Start wiederhergestellt

## Technologie

- **Electron** - Plattformübergreifendes Desktop-Framework für Windows/Linux/macOS
- **Leaflet.js** - Interaktive Kartenvisualisierung
- **OpenStreetMap** - Kartendaten
- **LocalForage** - Lokale Datenspeicherung (IndexedDB)

## Lizenz

Siehe LICENSE-Datei
