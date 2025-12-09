# Architektur - FW Lagekarte

Technische Dokumentation der Architektur und Implementierung der FW Lagekarte.

## Inhaltsverzeichnis

- [Überblick](#überblick)
- [Projektstruktur](#projektstruktur)
- [Architekturkomponenten](#architekturkomponenten)
- [Datenfluss](#datenfluss)
- [Synchronisation](#synchronisation)
- [Sicherheit](#sicherheit)
- [Entwicklung](#entwicklung)

## Überblick

FW Lagekarte ist eine **Electron-basierte Desktop-Anwendung**, die aus folgenden Hauptkomponenten besteht:

- **Electron Main Process** - Anwendungslebenszyklus und System-Integration
- **Renderer Process** - UI und Benutzerinteraktion
- **Storage Layer** - Persistente Datenspeicherung
- **Sync Module** - Multi-User-Synchronisation
- **Embedded Server** - WebSocket + HTTP Server

## Projektstruktur

```
fw-lagekarte/
├── main.js                    # Electron Hauptprozess
├── preload.js                 # Preload-Script (Context Bridge)
├── renderer.js                # UI-Logik und Event-Handler
├── storage.js                 # Datenverwaltung (LocalForage)
├── sync.js                    # Synchronisations-Modul
├── embedded-server.js         # Integrierter WebSocket + HTTP Server
├── tactical-symbols.js        # Taktische Zeichen (FwDV 100)
├── constants.js               # Geteilte Konstanten
├── index.html                 # Haupt-HTML (UI)
├── readonly-viewer.html       # Web Viewer (Read-Only)
├── proxy-settings.html        # Proxy-Konfiguration
├── doc-viewer.html            # Dokumentations-Viewer
├── styles.css                 # Styling
├── package.json               # Abhängigkeiten und Build-Config
├── assets/
│   ├── tactical-symbols/      # SVG-Symbole für Fahrzeugtypen
│   ├── screenshots/           # Screenshots für Dokumentation
│   ├── icon.png               # App-Icon (PNG)
│   ├── icon.ico               # App-Icon (Windows)
│   └── icon.icns              # App-Icon (macOS)
├── README.md                  # Hauptdokumentation
├── QUICKSTART.md              # Schnellstart-Anleitung
├── BENUTZERHANDBUCH.md        # Ausführliches Benutzerhandbuch
├── FEATURES.md                # Feature-Liste
└── ARCHITEKTUR.md             # Diese Datei
```

## Architekturkomponenten

### 1. Electron Main Process (`main.js`)

Der Hauptprozess ist verantwortlich für:

- **Fenster-Management**: Erstellen und Verwalten von BrowserWindows
- **Menü-Erstellung**: Anwendungsmenü mit Datei, Bearbeiten, Ansicht, Hilfe
- **Proxy-Konfiguration**: System-, PAC-, manuelle und direkte Proxy-Modi
- **Dokumentations-Viewer**: Öffnen von Markdown-Dateien
- **IPC-Kommunikation**: Kommunikation mit Renderer-Prozess

**Sicherheitsfeatures**:
- Context Isolation aktiviert
- Node Integration deaktiviert
- Sandboxing aktiviert
- Preload-Script für sichere API-Exposition

```javascript
// Beispiel: Fenster-Erstellung mit Sicherheitseinstellungen
mainWindow = new BrowserWindow({
  width: 1400,
  height: 900,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true
  }
});
```

### 2. Preload Script (`preload.js`)

Sichere Brücke zwischen Main und Renderer Process:

```javascript
// Exposition von APIs für Renderer
contextBridge.exposeInMainWorld('electronAPI', {
  openProxySettings: () => ipcRenderer.invoke('open-proxy-settings'),
  openDocumentation: (docName) => ipcRenderer.invoke('open-documentation', docName)
});
```

### 3. Renderer Process (`renderer.js`)

Hauptlogik der Anwendung:

**Verantwortlichkeiten**:
- Initialisierung der Leaflet-Karte
- Event-Handling für UI-Interaktionen
- Fahrzeug- und Standortverwaltung
- Drag & Drop-Funktionalität
- Integration mit Storage und Sync-Modulen

**Hauptfunktionen**:
- `initMap()` - Karten-Initialisierung
- `addStation()` - Standort hinzufügen
- `addVehicle()` - Fahrzeug hinzufügen
- `deployVehicle()` - Fahrzeug auf Karte platzieren
- `recallVehicle()` - Fahrzeug zurückrufen
- `renderVehicles()` - Seitenleiste aktualisieren

### 4. Storage Layer (`storage.js`)

Abstraktionsschicht für Datenpersistenz:

**Verwendete Technologie**: LocalForage (IndexedDB-Wrapper)

**Gespeicherte Daten**:
```javascript
// Stations
{
  id: 'station_1234567890',
  name: 'Feuerwache Nord',
  address: 'Hauptstraße 123',
  lat: 51.5074,
  lng: -0.1278
}

// Vehicles
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

// Map View
{
  center: { lat: 51.5074, lng: -0.1278 },
  zoom: 13,
  layer: 'osm'
}

// Sync Config
{
  mode: 'standalone|server|client',
  serverUrl: 'ws://192.168.1.100:8080',
  serverPort: 8080,
  clientId: 'unique-client-id'
}
```

**API**:
```javascript
// Stationen
await Storage.getStations()
await Storage.addStation(station)
await Storage.updateStation(id, updates)
await Storage.deleteStation(id)

// Fahrzeuge
await Storage.getVehicles()
await Storage.addVehicle(vehicle)
await Storage.updateVehicle(id, updates)
await Storage.deleteVehicle(id)

// Kartenansicht
await Storage.getMapView()
await Storage.saveMapView(view)

// Import/Export
await Storage.exportData()
await Storage.importData(data)
```

### 5. Sync Module (`sync.js`)

Netzwerk-Synchronisation für Multi-User-Betrieb:

**Modi**:
- **Standalone** - Keine Synchronisation (Standard)
- **Server** - Stellt Synchronisation bereit
- **Client** - Verbindet zu Server

**WebSocket-Protokoll**:
```javascript
// Station hinzufügen
{
  type: 'add_station',
  data: { id, name, address, lat, lng }
}

// Fahrzeug aktualisieren
{
  type: 'update_vehicle',
  data: { id, position, deployed }
}

// Vollständiger Zustand (bei Verbindung)
{
  type: 'full_sync',
  data: {
    stations: [...],
    vehicles: [...]
  }
}
```

**Features**:
- Automatische Wiederverbindung bei Verbindungsabbruch
- Inkrementelle Updates (keine vollständigen Syncs)
- Verbindungsstatus-Anzeige
- Client-Zähler auf Server-Seite

### 6. Embedded Server (`embedded-server.js`)

Integrierter WebSocket + HTTP Server:

**Komponenten**:
- **Express HTTP Server** - Dient den Web Viewer
- **WebSocket Server** - Synchronisation mit Clients
- **Static File Serving** - CSS, JS, Icons

**Ports**:
- Standard: 8080 (konfigurierbar)
- WebSocket: `ws://localhost:8080`
- HTTP: `http://localhost:8080`

**Sicherheit**:
- Whitelist-basiertes File Serving
- Keine Directory Listings
- Nur benötigte Dateien werden ausgeliefert

**API**:
```javascript
// Server starten
await embeddedServer.start(port)

// Server stoppen
await embeddedServer.stop()

// Status abfragen
embeddedServer.isRunning

// Clients zählen
embeddedServer.clients.size

// State aktualisieren
embeddedServer.updateState({ stations, vehicles })

// Broadcast an alle Clients
embeddedServer.broadcast({ type, data })
```

## Datenfluss

### Standalone-Modus

```
┌─────────┐
│  User   │
└────┬────┘
     │ (Interaktion)
     v
┌─────────────────┐
│  Renderer UI    │
└────┬────────────┘
     │ (CRUD Operations)
     v
┌─────────────────┐
│  Storage Layer  │
└────┬────────────┘
     │ (Persistenz)
     v
┌─────────────────┐
│   IndexedDB     │
└─────────────────┘
```

### Server-Modus

```
┌──────────┐                    ┌──────────┐
│ Server   │                    │ Client 1 │
│ Instance │                    └────┬─────┘
└────┬─────┘                         │
     │                                │
     v                                v
┌────────────────┐          ┌────────────────┐
│ Embedded Server│<────────>│   WebSocket    │
│  (ws + http)   │   WS     │   Client       │
└────┬───────────┘          └────────────────┘
     │
     ├──────────────────────┐
     │                      │
     v                      v
┌─────────┐          ┌──────────┐
│ Web     │          │ Client 2 │
│ Viewer  │          └──────────┘
└─────────┘
```

### Synchronisations-Flow

1. **Client-Verbindung**:
   - Client verbindet zu Server-WebSocket
   - Server sendet vollständigen Zustand (full_sync)
   - Client lädt und rendert Daten

2. **Lokale Änderung**:
   - User macht Änderung (z.B. Fahrzeug verschieben)
   - Änderung wird lokal in Storage gespeichert
   - Sync-Modul sendet Update an Server (falls verbunden)
   - Server broadcastet Update an alle anderen Clients

3. **Remote-Änderung**:
   - Client empfängt Update von Server
   - Sync-Modul aktualisiert Storage
   - UI wird automatisch aktualisiert

## Synchronisation

### Implementierung

**Incremental Updates**: Statt den gesamten State zu senden, werden nur Änderungen übertragen:

```javascript
// Nur Änderungen senden
Sync._broadcast({
  type: 'update_vehicle',
  data: {
    id: 'vehicle_123',
    position: { lat: 51.5, lng: -0.1 },
    deployed: true
  }
});
```

**Race Condition Prevention**: 
- Verwendung von eindeutigen IDs (Timestamp-basiert)
- Last-Write-Wins bei Konflikten
- Client-ID zur Identifikation von Updates

### Web Viewer

Der Web Viewer (`readonly-viewer.html`) ist eine read-only Ansicht für Browser:

**Features**:
- Automatische WebSocket-Verbindung zum Server
- Live-Updates bei Änderungen
- Keine Bearbeitungsmöglichkeiten
- Responsive Design für verschiedene Bildschirmgrößen

**Verwendungszwecke**:
- Große Displays in Leitstellen
- Tablets und mobile Geräte
- Schneller Zugriff ohne Installation

## Sicherheit

### Electron Security

- ✅ **Context Isolation**: Renderer hat keinen direkten Zugriff auf Node.js
- ✅ **No Node Integration**: Node.js APIs nicht im Renderer verfügbar
- ✅ **Sandboxing**: Renderer läuft in isolierter Umgebung
- ✅ **Preload Script**: Sichere API-Exposition via Context Bridge

### XSS-Schutz

- **HTML Sanitization**: Alle Benutzereingaben werden escaped
- **No innerHTML mit User-Input**: Nur textContent und createElement
- **CSP Headers**: Content Security Policy im Web Viewer

### Proxy-Sicherheit

- **Credentials in Main Process**: Proxy-Credentials werden nur im Main Process gespeichert
- **Verschlüsselte Speicherung**: Verwendung von Electron's safeStorage
- **Keine Logs**: Proxy-Credentials werden nicht geloggt

### WebSocket-Sicherheit

- **LAN-Only**: Server ist für lokale Netzwerke konzipiert
- **Keine Authentifizierung**: Für trusted Networks gedacht
- **HTTPS-Option**: Kann mit Reverse Proxy (z.B. Caddy) kombiniert werden

## Entwicklung

### Voraussetzungen

- Node.js v16+
- npm v8+
- Git

### Setup

```bash
# Repository klonen
git clone https://github.com/TimUx/fw-lagekarte.git
cd fw-lagekarte

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm start
```

### Build

```bash
# Alle Plattformen
npm run build

# Spezifische Plattform
npm run build:win      # Windows
npm run build:linux    # Linux
npm run build:mac      # macOS
```

### Entwicklungs-Workflow

1. **Code-Änderungen** in entsprechenden Dateien machen
2. **App neu starten** mit `npm start`
3. **DevTools** öffnen: Ansicht → Entwicklertools umschalten (F12)
4. **Testen**: Manuelle Tests der Funktionalität

### Debugging

**Renderer Process**:
- F12 oder Ansicht → Entwicklertools umschalten
- Console, Network, Elements verfügbar

**Main Process**:
```bash
# Mit Debug-Logs starten
DEBUG=* npm start

# Oder mit VSCode Debugger
# .vscode/launch.json konfigurieren
```

### Logging

```javascript
// Renderer
console.log('Debug message');
console.error('Error message');

// Main Process
console.log('[Main]', 'Message');
```

### Code-Konventionen

- **Variablen**: camelCase (`vehicleList`)
- **Konstanten**: SCREAMING_SNAKE_CASE (`DEFAULT_PORT`)
- **Funktionen**: camelCase (`addVehicle()`)
- **Klassen**: PascalCase (`EmbeddedServer`)
- **IDs**: Prefix + Timestamp (`vehicle_1234567890`)

### Testing

Aktuell keine automatisierten Tests. Manuelles Testing fokussiert sich auf:

- Fahrzeug- und Standort-CRUD-Operationen
- Drag & Drop-Funktionalität
- Multi-User-Synchronisation
- Import/Export-Funktionen
- Verschiedene Netzwerk-Szenarien

### Contribution Guidelines

1. Fork das Repository
2. Feature-Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request öffnen

## Performance-Überlegungen

### Karten-Performance

- **Tile Caching**: Leaflet cached automatisch Kartenkacheln
- **Marker Clustering**: Bei > 100 Fahrzeugen sollte Clustering erwogen werden
- **Lazy Loading**: Nur sichtbare Marker werden gerendert

### Storage-Performance

- **IndexedDB**: Schnell, auch bei tausenden Einträgen
- **Batch Operations**: Mehrere Updates können gebatched werden
- **Indexing**: LocalForage nutzt IndexedDB-Indizes

### Sync-Performance

- **Incremental Updates**: Nur Änderungen werden übertragen
- **Debouncing**: Mehrere schnelle Updates werden zusammengefasst
- **WebSocket**: Sehr geringe Latenz (< 10ms im LAN)

## Bekannte Limitierungen

1. **Keine Authentifizierung**: Multi-User-Modus hat keine Benutzer-Authentifizierung
2. **Keine Verschlüsselung**: WebSocket-Kommunikation ist unverschlüsselt (ws://)
3. **LAN-Only**: Für Internet-Betrieb wird Reverse Proxy benötigt
4. **Kein Konflikt-Management**: Last-Write-Wins bei gleichzeitigen Änderungen
5. **Begrenzte Offline-Karten**: Nur bereits angesehene Bereiche sind offline verfügbar

## Zukünftige Erweiterungen

Mögliche Erweiterungen:

- 📊 **Einsatzberichte und Statistiken**
- 🔐 **Benutzer-Authentifizierung**
- 🔒 **TLS/SSL für WebSocket (wss://)**
- 📍 **GPS-Integration** für Echtzeit-Tracking
- 🗺️ **Offline-Karten-Download** für größere Bereiche
- 📱 **Mobile App** (React Native oder Progressive Web App)
- 🔄 **Konflikt-Resolution** bei gleichzeitigen Änderungen
- 🎨 **Anpassbare Symbole und Themes**

---

**Letzte Aktualisierung**: Dezember 2024
