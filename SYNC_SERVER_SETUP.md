# WebSocket Synchronisations-Server für FW Lagekarte

Diese Anleitung beschreibt, wie Sie einen WebSocket-Server für die Multi-User-Synchronisation der FW Lagekarte einrichten können.

## Übersicht

Der Synchronisations-Server ermöglicht es mehreren Benutzern, gleichzeitig an derselben Lagekarte zu arbeiten. Alle Änderungen (Standorte, Fahrzeuge, Positionen) werden in Echtzeit zwischen allen verbundenen Clients synchronisiert.

**Neu:** Der Server kann jetzt auch eine Read-Only-Webansicht bereitstellen, sodass die Lagekarte von jedem Browser aus angezeigt werden kann - ohne die Electron-App installieren zu müssen.

## Voraussetzungen

- Node.js (Version 16 oder höher)
- npm (Node Package Manager)
- Netzwerkzugriff zwischen Server und Clients

## Server mit WebSocket und HTTP (Empfohlen)

Diese Implementation bietet sowohl WebSocket-Synchronisation als auch eine Read-Only-Webansicht.

### 1. Projekt erstellen

```bash
mkdir fw-lagekarte-sync-server
cd fw-lagekarte-sync-server
npm init -y
npm install ws express
```

### 2. Server-Code erstellen (server.js)

```javascript
const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

const PORT = process.env.PORT || 8080;

// Create Express app for HTTP server
const app = express();
const server = http.createServer(app);

// Create WebSocket server on the same HTTP server
const wss = new WebSocket.Server({ server });

// Serve static files from public directory
app.use(express.static('public'));

// Serve readonly viewer at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'readonly-viewer.html'));
});

// Store connected clients
const clients = new Set();

// Store current state
let currentState = {
    stations: [],
    vehicles: []
};

console.log(`Server running on http://localhost:${PORT}`);
console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
console.log(`Read-Only Web Viewer: http://localhost:${PORT}`);

wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);

    // Send current state to new client
    ws.send(JSON.stringify({
        type: 'sync_data',
        data: currentState
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            // Update state based on message type
            switch (data.type) {
                case 'station_update':
                    updateStation(data.station);
                    break;
                case 'station_delete':
                    deleteStation(data.stationId);
                    break;
                case 'vehicle_update':
                    updateVehicle(data.vehicle);
                    break;
                case 'vehicle_delete':
                    deleteVehicle(data.vehicleId);
                    break;
                case 'vehicle_position':
                    updateVehiclePosition(data.vehicleId, data.position);
                    break;
                case 'sync_request':
                    // Client requests full sync
                    ws.send(JSON.stringify({
                        type: 'sync_data',
                        data: currentState
                    }));
                    return;
            }

            // Broadcast to all other clients
            broadcast(data, ws);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });
});

function broadcast(data, sender) {
    clients.forEach((client) => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

function updateStation(station) {
    const index = currentState.stations.findIndex(s => s.id === station.id);
    if (index !== -1) {
        currentState.stations[index] = station;
    } else {
        currentState.stations.push(station);
    }
}

function deleteStation(stationId) {
    currentState.stations = currentState.stations.filter(s => s.id !== stationId);
}

function updateVehicle(vehicle) {
    const index = currentState.vehicles.findIndex(v => v.id === vehicle.id);
    if (index !== -1) {
        currentState.vehicles[index] = vehicle;
    } else {
        currentState.vehicles.push(vehicle);
    }
}

function deleteVehicle(vehicleId) {
    currentState.vehicles = currentState.vehicles.filter(v => v.id !== vehicleId);
}

function updateVehiclePosition(vehicleId, position) {
    const vehicle = currentState.vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
        vehicle.position = position;
        vehicle.deployed = !!position;
    }
}

// Start the server
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
```

### 3. Read-Only Viewer einrichten

Erstellen Sie einen `public` Ordner und kopieren Sie die Datei `readonly-viewer.html` aus dem FW Lagekarte Repository:

```bash
mkdir public
# Kopieren Sie readonly-viewer.html in den public Ordner
cp /pfad/zu/fw-lagekarte/readonly-viewer.html public/
```

Die `readonly-viewer.html` Datei ist eine vollständige, eigenständige Webseite, die:
- Automatisch eine Verbindung zum WebSocket-Server herstellt
- Die Lagekarte mit allen Standorten und Fahrzeugen anzeigt
- Live-Updates empfängt, wenn sich etwas ändert
- Komplett schreibgeschützt ist (keine Änderungen möglich)

### 4. Server starten

```bash
node server.js
```

Der Server läuft nun auf Port 8080 und bietet:
- **WebSocket-Synchronisation**: `ws://localhost:8080`
- **Read-Only Web Viewer**: `http://localhost:8080`

## Nur WebSocket-Server (Legacy)

Wenn Sie nur WebSocket-Synchronisation ohne Web-Viewer benötigen:

### 1. Projekt erstellen

```bash
mkdir fw-lagekarte-sync-server
cd fw-lagekarte-sync-server
npm init -y
npm install ws
```

### 2. Server-Code erstellen (server.js)

```javascript
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

// Store connected clients
const clients = new Set();

// Store current state
let currentState = {
    stations: [],
    vehicles: []
};

console.log(`WebSocket Sync Server running on port ${PORT}`);

wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);

    // Send current state to new client
    ws.send(JSON.stringify({
        type: 'sync_data',
        data: currentState
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            // Update state based on message type
            switch (data.type) {
                case 'station_update':
                    updateStation(data.station);
                    break;
                case 'station_delete':
                    deleteStation(data.stationId);
                    break;
                case 'vehicle_update':
                    updateVehicle(data.vehicle);
                    break;
                case 'vehicle_delete':
                    deleteVehicle(data.vehicleId);
                    break;
                case 'vehicle_position':
                    updateVehiclePosition(data.vehicleId, data.position);
                    break;
                case 'sync_request':
                    // Client requests full sync
                    ws.send(JSON.stringify({
                        type: 'sync_data',
                        data: currentState
                    }));
                    return;
            }

            // Broadcast to all other clients
            broadcast(data, ws);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });
});

function broadcast(data, sender) {
    clients.forEach((client) => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

function updateStation(station) {
    const index = currentState.stations.findIndex(s => s.id === station.id);
    if (index !== -1) {
        currentState.stations[index] = station;
    } else {
        currentState.stations.push(station);
    }
}

function deleteStation(stationId) {
    currentState.stations = currentState.stations.filter(s => s.id !== stationId);
}

function updateVehicle(vehicle) {
    const index = currentState.vehicles.findIndex(v => v.id === vehicle.id);
    if (index !== -1) {
        currentState.vehicles[index] = vehicle;
    } else {
        currentState.vehicles.push(vehicle);
    }
}

function deleteVehicle(vehicleId) {
    currentState.vehicles = currentState.vehicles.filter(v => v.id !== vehicleId);
}

function updateVehiclePosition(vehicleId, position) {
    const vehicle = currentState.vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
        vehicle.position = position;
        vehicle.deployed = !!position;
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    wss.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
```

### 3. Server starten

```bash
node server.js
```

Der Server läuft nun auf Port 8080 (oder dem in der Umgebungsvariable PORT angegebenen Port).

## Clients konfigurieren

### Electron-App (Desktop-Clients mit Bearbeitungsrechten)

1. Öffnen Sie die FW Lagekarte auf jedem Client
2. Klicken Sie auf "🔄 Synchronisation"
3. Wählen Sie Modus "Client (Zum Server verbinden)"
4. Geben Sie die Server-URL ein:
   - Lokal: `ws://localhost:8080`
   - Im Netzwerk: `ws://192.168.1.100:8080` (IP-Adresse des Servers)
   - Mit SSL: `wss://server.example.com` (für Produktionsumgebungen)
5. Klicken Sie auf "Speichern"

### Read-Only Web Viewer (Nur-Lese-Zugriff über Browser)

Der Read-Only Web Viewer ermöglicht es, die Lagekarte von jedem Gerät mit einem Webbrowser anzusehen - ohne Installation der Electron-App.

**Zugriff:**
1. Öffnen Sie einen beliebigen modernen Webbrowser (Chrome, Firefox, Edge, Safari)
2. Navigieren Sie zur Server-URL:
   - Lokal: `http://localhost:8080`
   - Im Netzwerk: `http://192.168.1.100:8080` (IP-Adresse des Servers)
   - Mit SSL: `https://server.example.com` (für Produktionsumgebungen)
3. Die Karte wird automatisch geladen und synchronisiert sich live mit dem Server

**Funktionen des Read-Only Viewers:**
- ✅ Anzeige aller Standorte und Fahrzeuge
- ✅ Live-Updates bei Änderungen
- ✅ Anzeige von Einsatznummern und Einsatzstichworten
- ✅ Interaktive Karte mit Zoom und Pan
- ✅ Fahrzeugliste mit Gruppierung nach Standorten
- ✅ Statistiken (Anzahl Fahrzeuge im Einsatz)
- ❌ Keine Bearbeitungsmöglichkeiten (schreibgeschützt)
- ❌ Keine Möglichkeit, Fahrzeuge zu positionieren

**Verwendungszwecke:**
- Anzeige auf großen Bildschirmen in der Leitstelle
- Zugriff für Personen ohne Bearbeitungsrechte
- Mobile Geräte (Tablets, Smartphones)
- Öffentliche Anzeigetafeln
- Keine Installation erforderlich

**Hinweis:** Der Read-Only Viewer verbindet sich automatisch mit dem WebSocket-Server auf dem gleichen Host. Wenn der Server auf einem anderen Port läuft, passen Sie die `CONFIG.wsUrl` Variable in der `readonly-viewer.html` Datei an.

## SSL/TLS (HTTPS/WSS) für Produktionsumgebungen

Für den produktiven Einsatz sollten Sie SSL/TLS verwenden:

```javascript
const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');

const server = https.createServer({
    cert: fs.readFileSync('/path/to/cert.pem'),
    key: fs.readFileSync('/path/to/key.pem')
});

const wss = new WebSocket.Server({ server });

server.listen(443);
```

## Erweiterte Funktionen (Optional)

### Authentifizierung

Fügen Sie eine einfache Authentifizierung hinzu:

```javascript
wss.on('connection', (ws, req) => {
    // Prüfen Sie URL-Parameter oder Header für Authentifizierung
    const token = new URL(req.url, 'http://localhost').searchParams.get('token');
    
    if (token !== 'your-secret-token') {
        ws.close(1008, 'Unauthorized');
        return;
    }
    
    // ... restlicher Code
});
```

### Persistente Speicherung

Speichern Sie den State in einer Datenbank oder Datei:

```javascript
const fs = require('fs');

// Beim Start laden
if (fs.existsSync('state.json')) {
    currentState = JSON.parse(fs.readFileSync('state.json', 'utf8'));
}

// Bei Änderungen speichern
function saveState() {
    fs.writeFileSync('state.json', JSON.stringify(currentState, null, 2));
}

// Nach jeder Änderung aufrufen
function updateStation(station) {
    // ... existing code
    saveState();
}
```

### Logging

Fügen Sie detailliertes Logging hinzu:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

logger.info('Server started on port ' + PORT);
```

## Deployment

### Docker

Erstellen Sie ein `Dockerfile`:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY server.js ./
EXPOSE 8080
CMD ["node", "server.js"]
```

Build und Run:
```bash
docker build -t fw-lagekarte-sync .
docker run -p 8080:8080 fw-lagekarte-sync
```

### Systemd Service (Linux)

Erstellen Sie `/etc/systemd/system/fw-sync.service`:

```ini
[Unit]
Description=FW Lagekarte Sync Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/fw-lagekarte-sync
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Aktivieren:
```bash
sudo systemctl enable fw-sync
sudo systemctl start fw-sync
```

## Fehlerbehebung

### Clients können sich nicht verbinden

- Überprüfen Sie die Firewall-Einstellungen
- Stellen Sie sicher, dass der Port geöffnet ist
- Prüfen Sie, ob der Server läuft: `netstat -tulpn | grep 8080`
- Testen Sie die Verbindung: `telnet server-ip 8080`

### Server stürzt ab

- Überprüfen Sie die Logs
- Stellen Sie sicher, dass ausreichend Speicher verfügbar ist
- Verwenden Sie einen Process Manager wie PM2: `pm2 start server.js`

### Synchronisation verzögert

- Überprüfen Sie die Netzwerklatenz
- Reduzieren Sie die Anzahl der gleichzeitigen Verbindungen
- Optimieren Sie den Broadcast-Mechanismus für große Datenmengen

## Sicherheitshinweise

- ⚠️ Verwenden Sie in Produktionsumgebungen immer SSL/TLS (wss://)
- ⚠️ Implementieren Sie Authentifizierung
- ⚠️ Beschränken Sie den Zugriff auf vertrauenswürdige Netzwerke
- ⚠️ Setzen Sie Rate-Limiting ein
- ⚠️ Validieren Sie alle eingehenden Daten

## Unterstützung

Für Fragen oder Probleme erstellen Sie bitte ein Issue im GitHub-Repository.
