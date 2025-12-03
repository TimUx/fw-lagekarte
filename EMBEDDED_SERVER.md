# Integrierter Synchronisations-Server

Die FW Lagekarte verfügt über einen **integrierten WebSocket + HTTP Server**, der direkt in der Electron-App läuft. Sie müssen keinen separaten Server mehr einrichten!

## Überblick

Der integrierte Server bietet:
- ✅ **WebSocket-Synchronisation** für Multi-User Echtzeit-Updates
- ✅ **HTTP Web Viewer** für schreibgeschützten Browser-Zugriff
- ✅ **Automatisches Starten/Stoppen** direkt aus der App
- ✅ **Netzwerk-Erkennung** zeigt alle IP-Adressen für Client-Verbindungen
- ✅ **Live Client-Zähler** zeigt verbundene Clients an
- ✅ **Null-Konfiguration** - einfach aktivieren und verwenden

## Server-Modus aktivieren

### Schritt-für-Schritt Anleitung

1. **Öffnen Sie die Synchronisations-Einstellungen**
   - Klicken Sie auf den Button **"🔄 Synchronisation"** in der Kopfzeile

2. **Wählen Sie den Server-Modus**
   - Setzen Sie **Modus** auf **"Server (Synchronisation bereitstellen)"**
   - Wählen Sie optional einen anderen Port (Standard: 8080)

3. **Speichern und Server starten**
   - Klicken Sie auf **"Speichern"**
   - Der Server startet automatisch!

4. **Server-Informationen anzeigen**
   - Nach dem Speichern zeigt das Modal die Server-URLs an:
     - **Lokale Adressen** (localhost)
     - **Netzwerk-Adressen** (für andere Geräte im LAN)
     - **Anzahl verbundener Clients**

## Server-URLs verstehen

Nach dem Aktivieren des Server-Modus sehen Sie:

### Lokale Verbindungen (localhost)
```
WebSocket: ws://localhost:8080
Web Viewer: http://localhost:8080
```
Diese URLs funktionieren nur auf dem gleichen Computer.

### Netzwerk-Adressen (LAN)
```
Ethernet (192.168.1.100):
• WS: ws://192.168.1.100:8080
• HTTP: http://192.168.1.100:8080

WiFi (192.168.1.101):
• WS: ws://192.168.1.101:8080  
• HTTP: http://192.168.1.101:8080
```
Diese URLs können von anderen Geräten im gleichen Netzwerk verwendet werden.

## Clients verbinden

### Electron-App (Desktop-Clients)

1. Öffnen Sie die FW Lagekarte auf einem anderen Computer
2. Klicken Sie auf **"🔄 Synchronisation"**
3. Wählen Sie Modus **"Client (Zum Server verbinden)"**
4. Geben Sie die WebSocket-URL des Servers ein:
   ```
   ws://192.168.1.100:8080
   ```
5. Klicken Sie auf **"Speichern"**
6. Die App verbindet sich automatisch und synchronisiert Daten

### Web Viewer (Browser)

1. Öffnen Sie einen beliebigen modernen Browser (Chrome, Firefox, Edge, Safari)
2. Geben Sie die HTTP-URL in die Adresszeile ein:
   ```
   http://192.168.1.100:8080
   ```
3. Der Read-Only Viewer wird geladen und zeigt die Lagekarte an
4. Alle Änderungen werden live aktualisiert

**Web Viewer Funktionen:**
- ✅ Anzeige aller Standorte und Fahrzeuge
- ✅ Live-Updates bei Änderungen
- ✅ Anzeige von Einsatznummern und Einsatzstichworten
- ✅ Interaktive Karte mit Zoom und Pan
- ✅ Fahrzeugliste mit Gruppierung nach Standorten
- ✅ Statistiken (Anzahl Fahrzeuge im Einsatz)
- ❌ Keine Bearbeitungsmöglichkeiten (schreibgeschützt)

## Verwendungszwecke

### Typische Szenarien

1. **Leitstelle**
   - Ein Computer im Server-Modus
   - Mehrere Tablets/Computer im Client-Modus
   - Alle sehen die gleiche Live-Lagekarte

2. **Einsatzleitung vor Ort**
   - Laptop mit Server-Modus am Einsatzort
   - Abschnittsleiter mit Tablets verbinden sich als Clients
   - Gemeinsame Lagekarte für alle Beteiligten

3. **Große Bildschirme**
   - Server läuft auf einem Computer
   - Browser auf großem Display zeigt Web Viewer
   - Keine Installation auf dem Display-Computer notwendig

4. **Mobile Geräte**
   - Server läuft auf Desktop/Laptop
   - Smartphones und Tablets öffnen Web Viewer
   - Schreibgeschützter Zugriff für Informationszwecke

## Technische Details

### Architektur

```
┌─────────────────────────────────────────┐
│   FW Lagekarte (Server-Modus)           │
│  ┌────────────────────────────────────┐ │
│  │  Electron App                       │ │
│  │  - LocalForage (IndexedDB)          │ │
│  │  - Leaflet Karte                    │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Embedded Server (Node.js)          │ │
│  │  - WebSocket Server (ws)            │ │
│  │  - HTTP Server (express)            │ │
│  │  - State Management                 │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
           │               │
           │ WebSocket     │ HTTP
           ↓               ↓
    ┌──────────┐    ┌──────────┐
    │ Client 1 │    │  Browser │
    │ (Elektron│    │  Viewer  │
    └──────────┘    └──────────┘
```

### Kommunikationsprotokoll

**WebSocket-Nachrichten:**
- `sync_request` - Client fordert vollständige Synchronisation an
- `sync_data` - Server sendet vollständige Daten
- `station_update` - Station wurde hinzugefügt/geändert
- `station_delete` - Station wurde gelöscht
- `vehicle_update` - Fahrzeug wurde hinzugefügt/geändert
- `vehicle_delete` - Fahrzeug wurde gelöscht
- `vehicle_position` - Fahrzeugposition wurde aktualisiert

**HTTP-Endpunkte:**
- `GET /` - Liefert den Read-Only Web Viewer
- Statische Dateien werden über Express bereitgestellt

### Performance

- **Latenz:** < 50ms für lokale Updates
- **Skalierung:** Getestet mit bis zu 20 gleichzeitigen Clients
- **Speicher:** Minimal (~50MB zusätzlich zum Basis-Speicherbedarf)
- **CPU:** Vernachlässigbar bei normaler Nutzung

### Sicherheit

⚠️ **Wichtige Sicherheitshinweise:**

1. **LAN-Betrieb empfohlen**
   - Der integrierte Server ist für den Betrieb in vertrauenswürdigen Netzwerken konzipiert
   - Verwenden Sie ihn nur in lokalen Netzwerken (LAN)

2. **Keine Authentifizierung**
   - Der Server hat keine Benutzerauthentifizierung
   - Jeder mit Zugriff auf die URL kann sich verbinden

3. **Keine Verschlüsselung**
   - WebSocket-Verbindungen sind nicht verschlüsselt (ws://, nicht wss://)
   - Verwenden Sie keine sensiblen Daten über öffentliche Netzwerke

4. **Firewall**
   - Stellen Sie sicher, dass Ihre Firewall den Server-Port blockiert, wenn er nicht im LAN verfügbar sein soll
   - Standard-Port: 8080

**Für produktive Umgebungen mit erhöhten Sicherheitsanforderungen:**
- Verwenden Sie den eigenständigen Server aus `SYNC_SERVER_SETUP.md`
- Implementieren Sie SSL/TLS (wss://, https://)
- Fügen Sie Authentifizierung hinzu
- Verwenden Sie einen Reverse Proxy (nginx, Apache)

## Fehlerbehebung

### Server startet nicht

**Problem:** "Server konnte nicht gestartet werden"

**Lösungen:**
1. Prüfen Sie, ob der Port bereits verwendet wird
   ```bash
   # Windows
   netstat -ano | findstr :8080
   
   # Linux/Mac
   lsof -i :8080
   ```
2. Wählen Sie einen anderen Port in den Einstellungen
3. Starten Sie die App neu

### Clients können sich nicht verbinden

**Problem:** Client zeigt "Verbindungsfehler"

**Lösungen:**
1. **Prüfen Sie die Firewall**
   - Windows: Windows Defender Firewall
   - Linux: ufw, iptables
   - Mac: Systemeinstellungen > Sicherheit & Datenschutz > Firewall

2. **Prüfen Sie die IP-Adresse**
   - Verwenden Sie die richtige Netzwerk-Adresse (nicht localhost)
   - Testen Sie mit `ping 192.168.1.100`

3. **Prüfen Sie den Server-Status**
   - Im Server: Status sollte "🟢 Server aktiv" zeigen
   - Anzahl verbundener Clients sollte angezeigt werden

### Synchronisation verzögert

**Problem:** Updates brauchen zu lange

**Lösungen:**
1. Prüfen Sie die Netzwerklatenz
   ```bash
   ping 192.168.1.100
   ```
2. Reduzieren Sie die Anzahl der Clients
3. Verwenden Sie kabelgebundenes Ethernet statt WLAN

### Web Viewer lädt nicht

**Problem:** Browser zeigt "Seite nicht gefunden"

**Lösungen:**
1. Prüfen Sie die URL - muss `http://` sein, nicht `ws://`
2. Prüfen Sie, ob Server läuft
3. Versuchen Sie einen anderen Browser
4. Leeren Sie den Browser-Cache

## Unterschied zum eigenständigen Server

### Integrierter Server (diese Dokumentation)

✅ **Vorteile:**
- Null-Konfiguration - läuft direkt in der App
- Einfache Aktivierung über UI
- Automatische Netzwerk-Erkennung
- Keine zusätzliche Installation notwendig
- Perfekt für temporäre Einsätze

❌ **Nachteile:**
- Läuft nur, wenn die App läuft
- Keine Persistenz beim Schließen der App
- Keine erweiterten Sicherheitsfunktionen
- Nur für vertrauenswürdige Netzwerke

### Eigenständiger Server (`SYNC_SERVER_SETUP.md`)

✅ **Vorteile:**
- Läuft als dedizierter Dienst (24/7)
- Kann SSL/TLS verwenden (wss://, https://)
- Kann Authentifizierung implementieren
- Kann als Systemdienst laufen
- Besser für dauerhafte Installationen

❌ **Nachteile:**
- Erfordert separate Installation
- Komplexere Einrichtung
- Zusätzlicher Server-Computer notwendig
- Mehr Wartungsaufwand

## Best Practices

### Empfehlungen für optimale Nutzung

1. **Netzwerk**
   - Verwenden Sie kabelgebundenes Ethernet für den Server
   - WLAN ist OK für Clients, aber langsamer
   - Stellen Sie stabile Netzwerkverbindungen sicher

2. **Hardware**
   - Server sollte auf leistungsstärkstem Computer laufen
   - Mindestens 4GB RAM empfohlen
   - SSD für schnellere Speicheroperationen

3. **Organisation**
   - Bestimmen Sie einen Haupt-Computer als Server
   - Alle anderen verbinden sich als Clients
   - Bei Server-Ausfall können Clients lokal weiterarbeiten

4. **Backups**
   - Exportieren Sie regelmäßig Daten (📤 Button)
   - Speichern Sie Exports an sicheren Orten
   - Bei Server-Neustart gehen keine Daten verloren (LocalForage)

5. **Port-Auswahl**
   - Standard-Port 8080 ist meist frei
   - Bei Konflikten: 8081, 8082, 3000, 3001
   - Dokumentieren Sie den gewählten Port für Clients

## Zusammenfassung

Der integrierte Server macht Multi-User-Synchronisation so einfach wie möglich:

1. **Aktivieren:** Ein Klick in den Einstellungen
2. **Teilen:** URLs werden automatisch angezeigt
3. **Verbinden:** Clients geben URL ein und fertig
4. **Arbeiten:** Alle sehen die gleiche Live-Lagekarte

Keine komplizierte Einrichtung, keine zusätzliche Software - es funktioniert einfach!

## Support

Bei Fragen oder Problemen:
- Erstellen Sie ein Issue auf GitHub
- Lesen Sie die ausführliche Dokumentation in `SYNC_SERVER_SETUP.md`
- Prüfen Sie die Konsole auf Fehlermeldungen (DevTools)
