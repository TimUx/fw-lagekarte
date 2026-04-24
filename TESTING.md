# Test Suite

Diese Test-Suite deckt die kritischen Funktionen der App in drei Ebenen ab:

- **Unit Tests**: Logikbausteine isoliert (`renderer/*`, `storage.js`)
- **Integration Tests**: Modul-Zusammenspiel (`sync.js` + `storage.js`, `embedded-server.js`)
- **E2E Tests**: Kritischer User-Flow in der laufenden Electron-App

## 1) Analysierte Features

- Standortverwaltung (anlegen, bearbeiten, loeschen)
- Fahrzeugverwaltung inkl. Zuordnung und Einsatzstatus
- Karten- und Render-Helferlogik
- Persistenz mit LocalForage
- Netzwerk-Synchronisation (Client/Server)
- Embedded WebSocket/HTTP Server

## 2) Kritische User-Flows

- **Flow A:** Standort anlegen -> in UI verfuegbar
- **Flow B:** Fahrzeug anlegen und einem Standort zuordnen -> Sidebar zeigt korrekten Eintrag
- **Flow C:** Fahrzeugposition/Einsatzstatus aktualisieren -> persistiert und wird synchronisiert
- **Flow D:** Sync-Server akzeptiert nur autorisierte WS-Verbindungen

## 3) Test-Abdeckung nach Ebene

- `tests/unit/renderer-collections.test.js`
  - Sortierung/Gruppierung von Fahrzeugen
- `tests/unit/renderer-formatters.test.js`
  - HTML-Escaping und Ausgabe-Formatter
- `tests/unit/storage.test.js`
  - CRUD, Import-Validierung, Deployment-Status
- `tests/integration/embedded-server.integration.test.js`
  - Auth-Handshake, Broadcasts zwischen Clients
- `tests/integration/sync-storage.integration.test.js`
  - Sync/Storage-Verzahnung und Token-URL-Aufbau
- `tests/e2e/app.e2e.spec.js`
  - Standort + Fahrzeug in echter Electron-Session

## 4) Lokale Ausfuehrung per CLI

```bash
npm ci
npm run test:unit
npm run test:integration
npm run test:e2e
```

Alles zusammen:

```bash
npm test
```

Coverage:

```bash
npm run coverage
```

## 5) CI-Ausfuehrung

Die Pipeline liegt in `.github/workflows/tests.yml` und fuehrt aus:

1. `npm ci`
2. `npm run test:unit`
3. `npm run test:integration`
4. `npm run test:e2e` (nutzt unter Linux automatisch `xvfb-run`)

Damit ist die Suite automatisiert in Pull Requests und Branch-Pushes lauffaehig.
