# FW Lagekarte - Funktionsübersicht

## Übersicht

Die FW Lagekarte ist eine vollständige Desktop-Anwendung für Feuerwehr-Großeinsätze mit folgenden Hauptfunktionen:

## Implementierte Features ✅

### 1. Kartendarstellung
- ✅ OpenStreetMap Integration
- ✅ Zoom- und Navigationsfunktionen
- ✅ Speicherbare Kartenansicht
- ✅ Offline-Fähigkeit (gecachte Kartenkacheln)

### 2. Standortverwaltung
- ✅ Standorte hinzufügen (Name, Adresse, GPS-Koordinaten)
- ✅ Standorte auf Karte per Klick platzieren
- ✅ Standorte bearbeiten
- ✅ Standorte löschen
- ✅ Standort-Icons auf Karte (🏢 Symbol)
- ✅ Popup mit Standort-Details

### 3. Fahrzeugverwaltung
- ✅ Fahrzeuge hinzufügen mit:
  - Rufname (z.B. "Florian Hamburg 1/44/1")
  - Fahrzeugtyp (LF, DLK, TLF, RW, ELW, MTW, KTW, RTW, NEF)
  - Besatzung (z.B. "1/8")
  - Zugeordnete Station
  - Notizen
- ✅ Fahrzeuge bearbeiten
- ✅ Fahrzeuge löschen
- ✅ Fahrzeuge in Seitenleiste anzeigen

### 4. Drag & Drop Funktionalität
- ✅ Fahrzeuge aus Seitenleiste auf Karte ziehen
- ✅ Fahrzeuge auf Karte verschieben
- ✅ Fahrzeuge zurückrufen zur Seitenleiste
- ✅ Visuelles Feedback beim Ziehen
- ✅ Statusanzeige (verfügbar/im Einsatz)

### 5. Persistente Datenspeicherung
- ✅ LocalForage/IndexedDB für lokale Speicherung
- ✅ Automatisches Speichern aller Änderungen
- ✅ Daten bleiben nach Neustart erhalten
- ✅ Export-Funktion (JSON-Backup)
- ✅ Import-Funktion (Daten wiederherstellen)

### 6. Benutzeroberfläche
- ✅ Responsive Design
- ✅ Deutsche Benutzeroberfläche
- ✅ Modale Dialoge für Eingaben
- ✅ Statistik-Anzeige (Fahrzeuge gesamt/im Einsatz)
- ✅ Farbcodierung (verfügbar/eingesetzt)
- ✅ Tastaturkürzel (ESC zum Schließen)

### 7. Offline & Windows
- ✅ Electron Desktop-App
- ✅ Vollständig offline nutzbar
- ✅ Windows-Installer (.exe) erstellbar
- ✅ Keine externe Server-Verbindung nötig

## Technische Details

### Architektur
```
fw-lagekarte/
├── main.js           # Electron Hauptprozess
├── renderer.js       # UI-Logik & Event-Handler
├── storage.js        # Datenverwaltung (LocalForage)
├── index.html        # HTML-Struktur
├── styles.css        # Styling
├── package.json      # Abhängigkeiten & Konfiguration
└── assets/           # Icons & Ressourcen
```

### Verwendete Technologien
- **Electron 39.x** - Desktop-Framework
- **Leaflet.js 1.9.x** - Kartenvisualisierung
- **LocalForage 1.10.x** - Lokale Datenspeicherung
- **OpenStreetMap** - Kartendaten
- **Electron Builder** - Windows-Installer

### Datenstruktur

#### Station
```javascript
{
  id: 'station_1234567890',
  name: 'Feuerwache Nord',
  address: 'Hauptstraße 123',
  lat: 51.5074,
  lng: -0.1278
}
```

#### Fahrzeug
```javascript
{
  id: 'vehicle_1234567890',
  callsign: 'Florian Hamburg 1/44/1',
  type: 'LF',
  crew: '1/8',
  stationId: 'station_1234567890',
  notes: 'Mit Schaummittel',
  deployed: false,
  position: { lat: 51.5074, lng: -0.1278 }
}
```

## Nutzungsszenarien

### Szenario 1: Vorbereitung
1. Alle Feuerwehr-Standorte im Einsatzgebiet auf der Karte markieren
2. Verfügbare Fahrzeuge mit Details erfassen
3. Kartenansicht auf Einsatzgebiet einstellen und speichern

### Szenario 2: Einsatzleitung
1. Fahrzeuge per Drag & Drop zu Einsatzorten bewegen
2. Echtzeitübersicht über eingesetzte Ressourcen
3. Fahrzeuge bei Bedarf umpositionieren
4. Statistik im Blick: Wieviele Fahrzeuge noch verfügbar?

### Szenario 3: Nachbereitung
1. Einsatzdaten exportieren (Backup)
2. Alle Fahrzeuge zurückrufen
3. Nächster Einsatz: Daten importieren oder neu beginnen

## Vorteile

✅ **Offline-Fähig** - Keine Internetabhängigkeit im Einsatz
✅ **Einfach zu bedienen** - Intuitive Drag & Drop Oberfläche
✅ **Datenschutz** - Alle Daten bleiben lokal
✅ **Flexibel** - Beliebige Standorte und Fahrzeuge
✅ **Skalierbar** - Für kleine und große Einsätze geeignet
✅ **Portable** - Export/Import für Datensicherung

## Installation & Start

```bash
# Abhängigkeiten installieren
npm install

# Anwendung starten
npm start

# Windows-Installer erstellen
npm run build
```

## Weiterentwicklungsmöglichkeiten

Zukünftige Features könnten sein:
- 🔄 Netzwerk-Synchronisation für Multi-User
- 📊 Einsatzberichte und Statistiken
- 🖨️ Druckfunktion für Lagekarten
- 🎨 Anpassbare Fahrzeug-Icons
- 📍 GPS-Integration für Echtzeit-Tracking
- 🗺️ Mehrere Karten-Layer (Satellit, etc.)
- 📱 Mobile App-Version

## Support & Dokumentation

- README.md - Schnellstart-Anleitung
- BENUTZERHANDBUCH.md - Ausführliche Bedienungsanleitung
- GitHub Issues - Fehlerberichte und Feature-Requests
