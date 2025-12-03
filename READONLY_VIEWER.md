# FW Lagekarte - Read-Only Web Viewer

Eine vollständige, eigenständige HTML-Webseite zur schreibgeschützten Anzeige der FW Lagekarte über einen Webbrowser.

## Übersicht

Der Read-Only Web Viewer ermöglicht es, die aktuelle Lagekarte von jedem Gerät mit einem Webbrowser anzusehen - ohne Installation der Electron-App. Perfekt für:
- Anzeige auf großen Bildschirmen in der Leitstelle
- Zugriff für Personen ohne Bearbeitungsrechte
- Mobile Geräte (Tablets, Smartphones)
- Öffentliche Anzeigetafeln

## Funktionen

### ✅ Verfügbar
- Anzeige aller Standorte auf der Karte
- Anzeige aller Fahrzeuge in der Seitenleiste
- Live-Synchronisation mit dem Server (Echtzeit-Updates)
- Anzeige von positionierten Fahrzeugen auf der Karte
- Anzeige von Einsatznummern und Einsatzstichworten
- Interaktive Karte mit Zoom und Pan
- Fahrzeugliste gruppiert nach Standorten
- Statistiken (Anzahl Fahrzeuge, davon im Einsatz)
- Popups mit detaillierten Informationen bei Klick

### ❌ Nicht verfügbar (schreibgeschützt)
- Keine Bearbeitungsmöglichkeiten
- Keine Möglichkeit, Fahrzeuge zu positionieren
- Keine Möglichkeit, Standorte oder Fahrzeuge hinzuzufügen
- Keine Möglichkeit, Einsatzinformationen zu ändern

## Installation und Verwendung

### Variante 1: Mit WebSocket-Server (Empfohlen)

Der einfachste Weg ist, den Read-Only Viewer als Teil des Sync-Servers bereitzustellen:

1. Richten Sie den Sync-Server ein (siehe `SYNC_SERVER_SETUP.md`)
2. Kopieren Sie `readonly-viewer.html` in den `public` Ordner des Servers
3. Starten Sie den Server
4. Öffnen Sie einen Browser und navigieren Sie zu `http://server-ip:8080`

### Variante 2: Standalone mit lokalem HTTP-Server

Sie können die Datei auch mit einem einfachen HTTP-Server bereitstellen:

```bash
# Mit Python
python3 -m http.server 8080

# Mit Node.js (npx http-server)
npx http-server -p 8080

# Mit PHP
php -S localhost:8080
```

Dann öffnen Sie: `http://localhost:8080/readonly-viewer.html`

### Variante 3: Direktes Öffnen im Browser

**Wichtig:** Moderne Browser blockieren WebSocket-Verbindungen von `file://` URLs aus Sicherheitsgründen. Diese Variante funktioniert daher **nicht** für Live-Updates, zeigt aber die statische Version der Seite.

## Konfiguration

### WebSocket-Server URL anpassen

Öffnen Sie `readonly-viewer.html` und passen Sie die `CONFIG` Konstante an:

```javascript
const CONFIG = {
    // WebSocket server URL
    wsUrl: 'ws://192.168.1.100:8080',  // Ändern Sie dies auf Ihre Server-IP
    
    // Map default center and zoom
    mapCenter: [51.1657, 10.4515],     // Ändern Sie dies für Ihre Region
    mapZoom: 6
};
```

### Für SSL/TLS (HTTPS/WSS)

Wenn Ihr Server SSL/TLS verwendet:

```javascript
const CONFIG = {
    wsUrl: 'wss://server.example.com',  // wss:// für sichere Verbindung
    mapCenter: [51.1657, 10.4515],
    mapZoom: 6
};
```

### Automatische Konfiguration

Standardmäßig versucht der Viewer, sich automatisch mit dem Server zu verbinden:
- Bei HTTPS: verwendet `wss://` (sicherer WebSocket)
- Bei HTTP: verwendet `ws://` (ungesicherter WebSocket)
- Host und Port werden automatisch vom Browser übernommen

## Technische Details

### Abhängigkeiten

Die Datei lädt automatisch folgende externe Ressourcen:
- **Leaflet 1.9.4**: Für die Kartendarstellung
  - CSS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`
  - JS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`

**Hinweis:** Diese werden von unpkg.com geladen. Für den Offline-Betrieb können Sie die Dateien lokal hosten und die URLs in der HTML-Datei anpassen.

### Browser-Kompatibilität

- ✅ Chrome/Edge (Chromium-basiert) 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile Browser (iOS Safari, Chrome Mobile)

### Sicherheit

- Alle Benutzereingaben werden mit `escapeHtml()` sanitisiert
- Keine Möglichkeit zur Datenmanipulation (Read-Only)
- WebSocket-Verbindung ist unidirectional (nur Empfang)
- Keine Authentifizierung implementiert (Server-seitig hinzufügen falls erforderlich)

## Anpassungen

### Styling anpassen

Das gesamte CSS ist in der HTML-Datei enthalten. Passen Sie den `<style>` Block an:

```css
/* Beispiel: Header-Farbe ändern */
.header {
    background-color: #1e3a8a;  /* Dunkelblau statt Rot */
}
```

### Kartenebenen hinzufügen

Standardmäßig wird OpenStreetMap verwendet. Sie können weitere Kartenebenen hinzufügen:

```javascript
// In der initMap() Funktion
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© Esri',
    maxZoom: 19
}).addTo(map);
```

### Taktische Symbole verwenden

Der aktuelle Viewer verwendet Emoji-Fallbacks. Um die echten taktischen Symbole zu verwenden:

1. Kopieren Sie den `assets` Ordner auf den Server
2. Passen Sie die Icon-URLs in der `renderDeployedVehicles()` Funktion an
3. Verwenden Sie die gleiche Logik wie in `tactical-symbols.js`

## Fehlerbehebung

### "Nicht verbunden" Status

- Überprüfen Sie, ob der WebSocket-Server läuft
- Prüfen Sie die Browser-Konsole auf Fehlermeldungen (F12)
- Stellen Sie sicher, dass die `wsUrl` korrekt konfiguriert ist
- Überprüfen Sie Firewall-Einstellungen

### Karte wird nicht angezeigt

- Überprüfen Sie die Netzwerkverbindung (Leaflet-Ressourcen müssen geladen werden)
- Prüfen Sie die Browser-Konsole auf JavaScript-Fehler
- Stellen Sie sicher, dass der Browser JavaScript aktiviert hat

### Keine Live-Updates

- Überprüfen Sie die WebSocket-Verbindung in der Browser-Konsole
- Stellen Sie sicher, dass der Server Nachrichten sendet
- Prüfen Sie, ob Clients Updates an den Server senden

### Mixed Content Warnung (HTTPS-Seite mit WS-Verbindung)

- Wenn die Seite über HTTPS geladen wird, muss auch WSS (WebSocket Secure) verwendet werden
- Ändern Sie `ws://` zu `wss://` in der Konfiguration

## Support

Bei Fragen oder Problemen:
1. Prüfen Sie die Browser-Konsole (F12) auf Fehlermeldungen
2. Überprüfen Sie die Server-Logs
3. Erstellen Sie ein Issue im GitHub-Repository

## Lizenz

Gleiche Lizenz wie das Hauptprojekt FW Lagekarte.
