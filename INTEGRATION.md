# Integration mit dem Alarmierungs-System

Dokumentation zur Integration der FW Lagekarte mit den Komponenten des Feuerwehr-Alarmierungs-Systems.

## Inhaltsverzeichnis

- [Übersicht](#übersicht)
- [Systemarchitektur](#systemarchitektur)
- [Komponenten](#komponenten)
- [Integration einrichten](#integration-einrichten)
- [Datenfluss](#datenfluss)
- [Beispiel-Szenarien](#beispiel-szenarien)

## Übersicht

Die FW Lagekarte kann als Teil eines umfassenden Alarmierungs- und Einsatz-Management-Systems betrieben werden. Das System besteht aus vier Hauptkomponenten:

1. **[alarm-mail](https://github.com/TimUx/alarm-mail)** - E-Mail-Parser für Leitstellen-Alarmierungen
2. **[alarm-messenger](https://github.com/TimUx/alarm-messenger)** - Mobile Alarmierungs-App
3. **[alarm-monitor](https://github.com/TimUx/alarm-monitor)** - Dashboard für große Displays
4. **FW Lagekarte** - Taktische Lagekarte (diese Anwendung)

## Systemarchitektur

### Komponenten-Übersicht

```
┌────────────────────────────────────────────────────────────────┐
│                    Alarmierungs-Workflow                        │
└────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  IMAP Postfach   │  ← Leitstelle sendet Alarm-E-Mail
└────────┬─────────┘
         │
         v
┌──────────────────┐
│   alarm-mail     │  ← Parst E-Mail und extrahiert Einsatzdaten
│   (Python)       │     - Einsatznummer
│                  │     - Stichwort und Unterstichwort
│                  │     - Einsatzort (Adresse, Koordinaten)
│                  │     - Alarmierte Einheiten (AAO)
│                  │     - Zeitstempel
└────────┬─────────┘
         │
         ├─────────────────────┬────────────────────┬──────────────┐
         │                     │                    │              │
         v                     v                    v              v
┌──────────────┐      ┌──────────────┐    ┌──────────────┐  ┌─────────┐
│ alarm-monitor│      │alarm-messenger│    │FW Lagekarte  │  │  Logs   │
│ (Dashboard)  │      │(Mobile App)  │    │(Takt. Karte) │  │         │
│              │      │              │    │              │  │         │
│ Python/Flask │      │Node.js/React │    │Electron/JS   │  │  Files  │
│ + WebSocket  │      │+ WebSocket   │    │+ WebSocket   │  │         │
└──────────────┘      └──────────────┘    └──────────────┘  └─────────┘
      │                       │                    │
      │                       │                    │
      └───────────────────────┴────────────────────┘
                              │
                   Gemeinsame Datenbasis
              (Einsätze, Fahrzeuge, Standorte)
```

### Datenfluss

1. **Alarmeingang**:
   - Leitstelle sendet Alarm-E-Mail an definiertes Postfach
   - alarm-mail ruft E-Mails über IMAP ab (Poll-Intervall: 10-60s)

2. **E-Mail-Parsing**:
   - alarm-mail parst XML-Struktur der E-Mail (INCIDENT-Format)
   - Extraktion von Einsatzdaten (Ort, Stichwort, AAO, etc.)
   - Strukturierte JSON-Aufbereitung

3. **Verteilung**:
   - alarm-mail sendet Daten per API an alle Zielsysteme:
     - **alarm-monitor**: Zeigt Einsatz auf Dashboard
     - **alarm-messenger**: Alarmiert Einsatzkräfte per Push
     - **FW Lagekarte**: (Optional) Erstellt Einsatzort auf Karte

4. **Visualisierung**:
   - **alarm-monitor**: Großbildanzeige mit Einsatzdetails
   - **alarm-messenger**: Mobile Benachrichtigung mit Rückmeldung
   - **FW Lagekarte**: Taktische Karte mit Fahrzeugen und Standorten

## Komponenten

### 1. alarm-mail (E-Mail-Parser)

**Funktion**: Automatisiertes Abrufen und Parsen von Alarm-E-Mails

**Features**:
- IMAP-Polling nach neuen Alarm-E-Mails
- XML-Parsing (INCIDENT-Format)
- Datenextraktion (Stichwort, Ort, Koordinaten, AAO, TME-Codes)
- API-Push an Zielsysteme mit Authentifizierung
- Health-Check Endpoint

**Technologie**: Python, IMAP, XML-Parser

**Repository**: https://github.com/TimUx/alarm-mail

**Deployment**: Docker Container oder systemd Service

### 2. alarm-messenger (Mobile Alarmierung)

**Funktion**: Mobile Alarmierungs-App für Einsatzkräfte

**Features**:
- WebSocket-basierte Push-Benachrichtigungen
- Einsatzalarm-Anzeige mit Alarmtönen
- Zwei-Button-Rückmeldung (Teilnehmen/Ablehnen)
- Einsatzverlaufs-Ansicht
- QR-Code-basierte Registrierung
- Alarmierungsgruppen

**Technologie**: Node.js, Express, WebSocket, React Native (Mobile)

**Repository**: https://github.com/TimUx/alarm-messenger

**Deployment**: Docker Compose mit Caddy/Nginx

### 3. alarm-monitor (Dashboard)

**Funktion**: Dashboard zur Anzeige von Einsätzen auf großen Bildschirmen

**Features**:
- Echtzeit-Anzeige aktueller Einsätze
- WebSocket-basierte Live-Updates
- Automatisches Scrolling bei mehreren Einsätzen
- Anzeige von Einsatzdetails (Ort, Stichwort, AAO, etc.)
- Zeitstempel und Countdown

**Technologie**: Python, Flask, WebSocket, Jinja2

**Repository**: https://github.com/TimUx/alarm-monitor

**Deployment**: Docker Container oder systemd Service

### 4. FW Lagekarte (Taktische Karte)

**Funktion**: Visualisierung der taktischen Lage auf interaktiver Karte

**Features**:
- Interaktive OpenStreetMap-Karte
- Fahrzeugverwaltung mit taktischen Zeichen
- Standortverwaltung (Feuerwachen, Einsatzorte)
- Drag & Drop für Fahrzeuge
- Multi-User-Synchronisation (integrierter Server)
- Web Viewer für schreibgeschützten Zugriff
- Import/Export für Backups

**Technologie**: Electron, Leaflet.js, WebSocket, Express

**Repository**: https://github.com/TimUx/fw-lagekarte

**Deployment**: Desktop-Installer (Windows, Linux, macOS)

## Integration einrichten

### Variante 1: Vollständiges System

**Empfohlen für**: Leitstellen mit vollautomatischem Alarmierungsworkflow

**Komponenten**: alarm-mail + alarm-messenger + alarm-monitor + FW Lagekarte

**Setup**:

1. **alarm-mail einrichten**:
   ```bash
   # Docker
   cd alarm-mail
   cp .env.example .env
   # .env bearbeiten (IMAP-Zugangsdaten, API-Keys)
   docker-compose up -d
   ```

2. **alarm-messenger einrichten**:
   ```bash
   cd alarm-messenger
   cp .env.example .env
   # .env bearbeiten (API-Key für alarm-mail)
   docker-compose up -d
   ```

3. **alarm-monitor einrichten**:
   ```bash
   cd alarm-monitor
   cp .env.example .env
   # .env bearbeiten (API-Key für alarm-mail)
   docker-compose up -d
   ```

4. **FW Lagekarte starten**:
   - Desktop-App installieren
   - Optional: Server-Modus für Multi-User aktivieren

### Variante 2: Lagekarte + Monitor (ohne E-Mail-Integration)

**Empfohlen für**: Einsatzdokumentation ohne automatische Alarmierung

**Komponenten**: FW Lagekarte + alarm-monitor

**Setup**:
- FW Lagekarte als Desktop-App
- alarm-monitor auf Display-Computer
- Manuelle Dateneingabe in FW Lagekarte

### Variante 3: Nur FW Lagekarte (Standalone)

**Empfohlen für**: Einzelplatz-Betrieb, mobile Einsatzleitung

**Komponenten**: Nur FW Lagekarte

**Setup**:
- Desktop-App installieren
- Keine weiteren Komponenten nötig
- Optional: Multi-User-Modus für Leitstelle

## Datenfluss

### API-Integration (alarm-mail → FW Lagekarte)

**Hinweis**: Diese Integration ist aktuell noch in Planung und nicht implementiert.

**Geplante Funktionalität**:

```javascript
// Beispiel: alarm-mail sendet Einsatzdaten an FW Lagekarte
POST /api/incident
Content-Type: application/json
Authorization: Bearer <API_KEY>

{
  "incidentNumber": "2024-12-09-001",
  "keyword": "Brand",
  "subkeyword": "Gebäude",
  "location": {
    "street": "Hauptstraße 123",
    "city": "Hamburg",
    "lat": 53.5511,
    "lng": 9.9937
  },
  "units": ["Florian Hamburg 1/44/1", "Florian Hamburg 1/45/1"],
  "timestamp": "2024-12-09T14:30:00Z"
}
```

**FW Lagekarte würde dann**:
- Einsatzort automatisch als Standort auf Karte markieren
- Optional: Alarmierte Fahrzeuge hervorheben
- Benachrichtigung anzeigen

### WebSocket-Synchronisation

FW Lagekarte verwendet WebSocket für Multi-User-Synchronisation:

```javascript
// Beispiel: Fahrzeug-Position synchronisieren
{
  "type": "update_vehicle",
  "data": {
    "id": "vehicle_1234567890",
    "position": { "lat": 53.5511, "lng": 9.9937 },
    "deployed": true
  }
}
```

Diese Synchronisation ist **unabhängig** von den anderen Komponenten und dient nur dem Multi-User-Betrieb der FW Lagekarte selbst.

## Beispiel-Szenarien

### Szenario 1: Vollautomatische Alarmierung

**Ausgangslage**: Leitstelle, vollständiges System installiert

**Ablauf**:
1. Leitstelle sendet Alarm-E-Mail (Brand, Hauptstraße 123)
2. alarm-mail parst E-Mail und sendet Daten an alle Systeme
3. **alarm-monitor** zeigt Einsatz auf großem Display
4. **alarm-messenger** alarmiert Einsatzkräfte auf Smartphones
5. **FW Lagekarte** (optional): Einsatzort wird automatisch markiert
6. Disponenten in FW Lagekarte ziehen alarmierte Fahrzeuge zum Einsatzort
7. Alle Beteiligten sehen aktuelle Lage

**Vorteile**:
- ✅ Keine manuelle Dateneingabe
- ✅ Automatische Alarmierung
- ✅ Alle Systeme synchronisiert
- ✅ Schnelle Reaktionszeit

### Szenario 2: Leitstelle mit manueller Eingabe

**Ausgangslage**: Leitstelle ohne E-Mail-Integration

**Ablauf**:
1. Disponenten erhalten Anruf
2. **FW Lagekarte** (Server-Modus): Dispontent markiert Einsatzort auf Karte
3. Dispontent zieht alarmierte Fahrzeuge zum Einsatzort
4. **Displays** (Web Viewer): Zeigen aktuelle Lage
5. Andere Disponenten sehen Updates in Echtzeit

**Vorteile**:
- ✅ Flexible Dateneingabe
- ✅ Multi-User-Betrieb
- ✅ Keine externe Integration nötig

### Szenario 3: Mobile Einsatzleitung

**Ausgangslage**: Laptop des Einsatzleiters vor Ort

**Ablauf**:
1. Einsatzleiter startet **FW Lagekarte** auf Laptop
2. Markiert Einsatzort auf Karte
3. Fügt verfügbare Fahrzeuge hinzu
4. Platziert Fahrzeuge per Drag & Drop
5. **Web Viewer** auf Tablets: Abschnittsleiter sehen Lage
6. Lagekarte wird für Einsatzbericht gedruckt

**Vorteile**:
- ✅ Mobil einsetzbar
- ✅ Offline-fähig
- ✅ Multi-User via lokalem Server
- ✅ Einsatzdokumentation

### Szenario 4: Übung mit vordefinierten Daten

**Ausgangslage**: Übung mit bekanntem Szenario

**Ablauf**:
1. Übungsleiter **exportiert** vordefinierte Übungs-Konfiguration
2. Teilnehmer **importieren** Konfiguration in ihre FW Lagekarten
3. Alle haben gleiche Ausgangslage
4. Übung läuft mit Echtzeit-Synchronisation
5. Nach Übung: Lage wird als Backup exportiert

**Vorteile**:
- ✅ Reproduzierbare Szenarien
- ✅ Schnelles Setup
- ✅ Dokumentation für Nachbesprechung

## API-Endpunkte (Geplant)

Die folgenden API-Endpunkte sind für zukünftige Versionen geplant:

### POST /api/incident
Erstellt einen neuen Einsatz mit automatischem Standort auf der Karte.

### POST /api/station
Erstellt einen neuen Standort programmgesteuert.

### POST /api/vehicle
Erstellt ein neues Fahrzeug programmgesteuert.

### GET /api/state
Gibt den aktuellen Zustand (alle Standorte und Fahrzeuge) zurück.

### WebSocket /ws
WebSocket-Endpunkt für Echtzeit-Updates (bereits implementiert für Multi-User).

## Weitere Informationen

- **alarm-mail**: https://github.com/TimUx/alarm-mail
- **alarm-messenger**: https://github.com/TimUx/alarm-messenger
- **alarm-monitor**: https://github.com/TimUx/alarm-monitor
- **FW Lagekarte**: https://github.com/TimUx/fw-lagekarte

## Support

Bei Fragen zur Integration:
- GitHub Issues der jeweiligen Repositories
- GitHub Discussions

---

**Stand**: Dezember 2024
