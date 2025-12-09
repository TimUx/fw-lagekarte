# FW Lagekarte - Funktionsübersicht

Vollständige Liste aller implementierten Features und technischen Details der FW Lagekarte.

## Inhaltsverzeichnis

- [Kern-Funktionen](#kern-funktionen)
- [Benutzeroberfläche](#benutzeroberfläche)
- [Multi-User-Funktionen](#multi-user-funktionen)
- [Datenmanagement](#datenmanagement)
- [Plattformunterstützung](#plattformunterstützung)
- [Technische Details](#technische-details)
- [Nutzungsszenarien](#nutzungsszenarien)

## Kern-Funktionen

### Kartendarstellung und Navigation

- ✅ **OpenStreetMap Integration** - Hochwertige, freie Kartendaten
- ✅ **Mehrere Karten-Layer**:
  - OpenStreetMap (Standard) - Detaillierte Straßenkarte
  - Satellit (Esri World Imagery) - Luftbildaufnahmen
  - Topographisch (OpenTopoMap) - Mit Höhenlinien
  - Hybrid - Satellit mit Straßenbeschriftung
- ✅ **Intuitive Navigation**:
  - Zoomen mit Mausrad oder +/- Buttons
  - Verschieben per Drag & Drop
  - Tastatursteuerung (Ctrl +/-/0)
- ✅ **Speicherbare Kartenansicht** - Position und Zoom werden gespeichert
- ✅ **Offline-Fähigkeit** - Bereits angesehene Bereiche funktionieren offline
- ✅ **Layer-Persistenz** - Ausgewählter Layer wird beim Neustart wiederhergestellt

### Standortverwaltung

- ✅ **Standorte hinzufügen**:
  - Name und Adresse erfassen
  - GPS-Koordinaten (Lat/Lng)
  - Manuell oder per Klick auf Karte
  - Rechtsklick-Kontextmenü für schnelles Hinzufügen
- ✅ **Standorte bearbeiten** - Alle Details können nachträglich geändert werden
- ✅ **Standorte löschen** - Mit Sicherheitsabfrage
- ✅ **Visuelle Darstellung**:
  - 🏢 Symbol auf der Karte
  - Klickbares Icon mit Popup
  - Details-Anzeige im Popup
- ✅ **Standort-Kategorien**:
  - Feuerwachen und Gerätehäuser
  - Einsatzstellen
  - Sonstige wichtige Orte

### Fahrzeugverwaltung

- ✅ **Umfassende Fahrzeugtypen** mit taktischen Zeichen:
  - **Einsatzleitung**: ELW (Einsatzleitwagen)
  - **Löschfahrzeuge**: HLF, LF, StLF, TLF, TSF, TSF-W
  - **Rüst- und Gerätewagen**: GW-L1, GW-L2, RW
  - **Mannschaft**: MTF, MTW
  - **Hubrettung**: DLK (Drehleiter)
  - **Rettungswesen**: KTW, NEF, RTW
- ✅ **Fahrzeugdetails**:
  - Rufname nach Florian-System (z.B. "Florian Hamburg 1/44/1")
  - Besatzungsstärke (z.B. "1/8")
  - Standortzuordnung
  - Freitext-Notizen für besondere Ausrüstung
- ✅ **CRUD-Operationen**:
  - Fahrzeuge hinzufügen
  - Bearbeiten aller Details
  - Löschen mit Bestätigung
- ✅ **Seitenleiste**:
  - Gruppierung nach Standorten
  - Taktische Zeichen-Anzeige
  - Status-Kennzeichnung (verfügbar/im Einsatz)
  - Sortierung nach Rufzeichen

### Einsatzdarstellung und Drag & Drop

- ✅ **Drag & Drop**:
  - Fahrzeuge aus Seitenleiste ziehen
  - Auf beliebiger Kartenposition platzieren
  - Visuelles Feedback während des Ziehens
  - Ghost-Image des Fahrzeugs beim Ziehen
- ✅ **Auf der Karte**:
  - Fahrzeuge verschieben per Drag & Drop
  - Taktisches Zeichen als Marker
  - Klickbares Icon mit Details
  - Popup mit Fahrzeuginfo und Aktionen
- ✅ **Status-Management**:
  - Automatische Status-Änderung (verfügbar → im Einsatz)
  - Grüne Markierung für eingesetzte Fahrzeuge
  - "Im Einsatz"-Sektion in Seitenleiste
  - Zurückrufen-Funktion mit einem Klick
- ✅ **Statistiken**:
  - Anzahl verfügbare Fahrzeuge
  - Anzahl eingesetzte Fahrzeuge
  - Live-Aktualisierung bei Änderungen

### Druckfunktion

- ✅ **Professionelle Druckausgabe**:
  - Komplette Lagekarte als Druck
  - Zeitstempel der Erstellung
  - Anpassbares Layout
- ✅ **Automatische Legende**:
  - Liste aller Standorte mit Adressen
  - Liste verfügbarer Fahrzeuge
  - Liste eingesetzter Fahrzeuge mit Positionen
  - Besatzungsstärken
- ✅ **Export-Optionen**:
  - Direkt drucken
  - Als PDF speichern
  - Für digitale Archivierung

## Benutzeroberfläche

- ✅ **Moderne Oberfläche**:
  - Klares, übersichtliches Design
  - Deutsche Benutzeroberfläche
  - Responsive Layout
  - Intuitive Bedienung
- ✅ **Modale Dialoge**:
  - Standort hinzufügen/bearbeiten
  - Fahrzeug hinzufügen/bearbeiten
  - Synchronisations-Einstellungen
  - Proxy-Konfiguration
- ✅ **Visuelle Feedback**:
  - Status-Indikatoren
  - Farbcodierung (grün = im Einsatz)
  - Hover-Effekte
  - Loading-Animationen
- ✅ **Statistiken**:
  - Live-Zähler für Fahrzeuge
  - Anzahl verfügbar/im Einsatz
  - Client-Anzahl (Server-Modus)
- ✅ **Tastaturkürzel**:
  - ESC - Dialoge schließen
  - Ctrl/Cmd + Plus - Hineinzoomen
  - Ctrl/Cmd + Minus - Herauszoomen
  - Ctrl/Cmd + 0 - Zoom zurücksetzen

## Multi-User-Funktionen

### Integrierter Server

- ✅ **WebSocket + HTTP Server**:
  - Läuft direkt in der Electron-App
  - Keine externe Server-Installation nötig
  - Konfigurierbarer Port (Standard: 8080)
  - Automatisches Starten/Stoppen
- ✅ **Netzwerk-Erkennung**:
  - Zeigt alle verfügbaren IP-Adressen
  - Localhost-Adressen
  - LAN-Adressen (Ethernet, WiFi)
  - URLs für WebSocket und HTTP
- ✅ **Client-Management**:
  - Live-Anzeige verbundener Clients
  - Client-Zähler im UI
  - Automatische Trennung bei Server-Stop

### Synchronisation

- ✅ **Echtzeit-Updates**:
  - Alle Änderungen werden sofort übertragen
  - Inkrementelle Updates (nur Änderungen)
  - Keine spürbaren Verzögerungen
- ✅ **Synchronisierte Daten**:
  - Standorte (Hinzufügen, Bearbeiten, Löschen)
  - Fahrzeuge (Hinzufügen, Bearbeiten, Löschen)
  - Fahrzeugpositionen (Verschieben)
  - Einsatzstatus (Verfügbar/Im Einsatz)
- ✅ **Verbindungs-Management**:
  - Automatische Wiederverbindung
  - Status-Anzeige (Verbunden/Getrennt)
  - Fehlerbehandlung
  - Reconnect-Logik mit Backoff

### Web Viewer

- ✅ **Browser-basiert**:
  - Keine Installation erforderlich
  - Funktioniert auf allen modernen Browsern
  - Responsive Design für verschiedene Bildschirme
- ✅ **Read-Only Modus**:
  - Anzeige aller Standorte und Fahrzeuge
  - Live-Updates bei Änderungen
  - Keine Bearbeitungsmöglichkeiten
  - Sichere Anzeige für öffentliche Displays
- ✅ **Verwendungszwecke**:
  - Große Displays in Leitstellen
  - Tablets für Einsatzleiter
  - Mobile Geräte für Information
  - Mehrere Anzeigestationen ohne Desktop-Installation

## Datenmanagement

### Persistente Speicherung

- ✅ **LocalForage/IndexedDB**:
  - Schnelle, lokale Datenspeicherung
  - Skalierbar für tausende Einträge
  - Automatisches Speichern
  - Keine externen Datenbanken nötig
- ✅ **Datenpersistenz**:
  - Alle Daten bleiben nach Neustart erhalten
  - Kartenansicht wird gespeichert
  - Sync-Konfiguration bleibt erhalten
  - Proxy-Einstellungen bleiben erhalten

### Import/Export

- ✅ **Datenexport**:
  - Kompletter Export als JSON
  - Backup-Funktion
  - Alle Standorte und Fahrzeuge
  - Manueller Download
- ✅ **Datenimport**:
  - JSON-Datei einlesen
  - Wiederherstellung aus Backup
  - Migration zwischen Installationen
  - Überschreiben oder Zusammenführen

### Proxy-Unterstützung

- ✅ **Proxy-Modi**:
  - System-Proxy (empfohlen)
  - PAC-Skript (Proxy Auto-Config)
  - Manueller Proxy
  - Kein Proxy (direkte Verbindung)
- ✅ **Enterprise-Features**:
  - GPO-PAC-Unterstützung
  - Proxy-Authentifizierung
  - Bypass-Regeln
  - Persistente Konfiguration
- ✅ **UI**:
  - Eigenes Einstellungs-Fenster
  - Sofortige Anwendung
  - Konfiguration über Menü

## Plattformunterstützung

### Betriebssysteme

- ✅ **Windows**:
  - Windows 10 und 11
  - NSIS-Installer (.exe)
  - Startmenü-Integration
  - Desktop-Verknüpfung
- ✅ **Linux**:
  - AppImage (universal)
  - .deb Paket (Debian/Ubuntu)
  - Funktioniert auf den meisten Distributionen
- ✅ **macOS**:
  - macOS 10.14+
  - DMG-Installer
  - Native Mac-Anwendung

### Offline-Fähigkeit

- ✅ **Vollständig offline**:
  - Keine Internet-Verbindung für Betrieb nötig
  - Alle Daten lokal gespeichert
  - Kartenkacheln werden gecacht
  - Keine Cloud-Abhängigkeiten
- ✅ **Hybrid-Modus**:
  - Online: Neue Kartenbereiche laden
  - Offline: Bereits gesehene Bereiche verfügbar
  - Automatisches Caching

## Technische Details

### Technologie-Stack

**Frontend**:
- **Electron 39.x** - Plattformübergreifendes Desktop-Framework
- **Leaflet.js 1.9.x** - Interaktive Kartenvisualisierung
- **OpenStreetMap** - Freie Kartendaten
- **LocalForage 1.10.x** - Lokale Datenspeicherung (IndexedDB)

**Backend (Embedded Server)**:
- **WebSocket (ws 8.x)** - Echtzeit-Kommunikation
- **Express 4.x** - HTTP-Server
- **Node.js** - JavaScript-Runtime

**Build & Deployment**:
- **Electron Builder 26.x** - Installer-Erstellung
- **NSIS** - Windows-Installer
- **AppImage & .deb** - Linux-Packages
- **DMG** - macOS-Installer

### Architektur

```
fw-lagekarte/
├── main.js                    # Electron Hauptprozess
├── preload.js                 # Preload-Script (Context Bridge)
├── renderer.js                # UI-Logik & Event-Handler
├── storage.js                 # Datenverwaltung (LocalForage)
├── sync.js                    # Synchronisations-Modul
├── embedded-server.js         # Integrierter WebSocket + HTTP Server
├── tactical-symbols.js        # Taktische Zeichen (FwDV 100)
├── constants.js               # Geteilte Konstanten
├── index.html                 # Haupt-HTML
├── readonly-viewer.html       # Web Viewer
├── proxy-settings.html        # Proxy-Konfiguration
├── doc-viewer.html            # Dokumentations-Viewer
├── styles.css                 # Styling
├── package.json               # Dependencies & Build-Config
└── assets/
    ├── tactical-symbols/      # SVG-Symbole für Fahrzeugtypen
    ├── screenshots/           # Screenshots
    └── icons/                 # App-Icons
```

Siehe [ARCHITEKTUR.md](ARCHITEKTUR.md) für detaillierte technische Dokumentation.

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

### Szenario 1: Einzelplatz-Betrieb (Standalone)

**Anwendungsfall**: Einsatzleiter mit eigenem Laptop

1. **Vorbereitung**:
   - Alle Feuerwehr-Standorte im Einsatzbereich markieren
   - Verfügbare Fahrzeuge mit Details erfassen
   - Kartenansicht auf Einsatzgebiet einstellen und speichern

2. **Während des Einsatzes**:
   - Fahrzeuge per Drag & Drop zu Einsatzorten bewegen
   - Echtzeitübersicht über eingesetzte Ressourcen
   - Fahrzeuge bei Bedarf umpositionieren
   - Neue Fahrzeuge hinzufügen, wenn nachalarmiert wird

3. **Nachbereitung**:
   - Lagekarte für Einsatzbericht drucken
   - Einsatzdaten exportieren (Backup)
   - Alle Fahrzeuge zurückrufen für nächsten Einsatz

### Szenario 2: Multi-User-Betrieb (Leitstelle)

**Anwendungsfall**: Mehrere Disponenten arbeiten gemeinsam

**Setup**:
1. **Haupt-Computer** (Server-Modus): Startet integrierten Server
2. **Client-Computer** (Client-Modus): Verbinden zu Server-WebSocket
3. **Große Displays** (Web Viewer): Browser zeigt schreibgeschützte Ansicht

**Ablauf**:
- Alle sehen die gleiche Lagekarte
- Änderungen werden sofort synchronisiert
- Mehrere Personen können gleichzeitig arbeiten
- Displays zeigen immer aktuellen Stand

## Vorteile

### Für Einsatzkräfte

✅ **Einfache Bedienung** - Intuitive Drag & Drop Oberfläche ohne Schulungsaufwand
✅ **Schneller Überblick** - Alle Ressourcen auf einen Blick
✅ **Taktische Zeichen** - Sofortige Erkennung von Fahrzeugtypen nach FwDV 100
✅ **Offline-Fähig** - Funktioniert auch bei Netzausfall

### Für Organisationen

✅ **Kostenlos** - Open Source, keine Lizenzkosten
✅ **Datenschutz** - Alle Daten bleiben lokal, keine Cloud
✅ **Flexibel** - Anpassbar für verschiedene Einsatzszenarien
✅ **Skalierbar** - Von Einzelplatz bis Multi-User
✅ **Portable** - Export/Import für Datensicherung und Migration

### Technische Vorteile

✅ **Plattformunabhängig** - Windows, Linux, macOS
✅ **Moderne Technologie** - Electron, Leaflet, WebSocket
✅ **Erweiterbar** - Offene Architektur für Integrationen
✅ **Wartbar** - Klare Code-Struktur, gut dokumentiert

## Bekannte Einschränkungen

⚠️ **LAN-Only Multi-User** - Server ist für lokale Netzwerke konzipiert
⚠️ **Keine Authentifizierung** - Multi-User hat keine Benutzer-Verwaltung
⚠️ **Begrenzte Offline-Karten** - Nur bereits angesehene Bereiche verfügbar
⚠️ **Last-Write-Wins** - Bei gleichzeitigen Änderungen gewinnt die letzte

## Geplante Erweiterungen

Potenzielle zukünftige Features:

- 📊 **Einsatzberichte** - Automatische Berichtserstellung mit Statistiken
- 🔐 **Benutzer-Authentifizierung** - Multi-User mit Login und Rechten
- 🔒 **TLS/SSL** - Verschlüsselte WebSocket-Verbindungen
- 📍 **GPS-Integration** - Echtzeit-Tracking von Fahrzeugen
- 🗺️ **Offline-Karten-Download** - Vordefinierte Bereiche herunterladen
- 📱 **Native Mobile App** - React Native App für iOS/Android

## Weitere Dokumentation

- **[README.md](README.md)** - Übersicht, Installation und Schnellstart
- **[QUICKSTART.md](QUICKSTART.md)** - Schnelleinstieg für neue Benutzer
- **[BENUTZERHANDBUCH.md](BENUTZERHANDBUCH.md)** - Ausführliche Bedienungsanleitung
- **[ARCHITEKTUR.md](ARCHITEKTUR.md)** - Technische Architektur und Entwickler-Docs

---

**Stand**: Dezember 2024
