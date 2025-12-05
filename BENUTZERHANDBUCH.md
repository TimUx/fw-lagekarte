# Benutzerhandbuch - FW Lagekarte

## Inhaltsverzeichnis

1. [Übersicht](#übersicht)
2. [Installation](#installation)
   - [Windows SmartScreen Warnung umgehen](#windows-smartscreen-warnung-umgehen)
3. [Erste Schritte](#erste-schritte)
   - [Grundfunktionen](#grundfunktionen)
     - [1. Feuerwehr-Standorte verwalten](#1-feuerwehr-standorte-verwalten)
     - [2. Fahrzeuge verwalten](#2-fahrzeuge-verwalten)
     - [3. Fahrzeuge im Einsatz einsetzen](#3-fahrzeuge-im-einsatz-einsetzen)
     - [4. Kartenansicht anpassen](#4-kartenansicht-anpassen)
4. [Tipps und Tricks](#tipps-und-tricks)
5. [Erweiterte Funktionen](#erweiterte-funktionen)
   - [Karten-Layer wechseln](#karten-layer-wechseln)
   - [Lagekarte drucken](#lagekarte-drucken)
   - [Netzwerk-Synchronisation (Multi-User)](#netzwerk-synchronisation-multi-user)
6. [Offline-Nutzung](#offline-nutzung)
7. [Datenspeicherung](#datenspeicherung)
8. [Fehlerbehebung](#fehlerbehebung)
   - [Allgemeine Probleme](#allgemeine-probleme)
   - [Server-Modus Probleme](#server-modus-probleme)
9. [Tastenkombinationen](#tastenkombinationen)
10. [Support](#support)

## Übersicht

Die FW Lagekarte ist eine Desktop-Anwendung zur Verwaltung von Feuerwehr-Einsatzlagen. Sie ermöglicht die Visualisierung von Standorten und Fahrzeugen auf einer interaktiven Karte.

![Hauptansicht der Anwendung](assets/screenshots/hauptansicht.png)

*Die Hauptansicht zeigt die Seitenleiste mit Fahrzeugen (gruppiert nach Standorten mit taktischen Zeichen) und die interaktive Karte.*

## Erste Schritte

### Installation
1. Laden Sie die Anwendung herunter und installieren Sie sie
2. Starten Sie die Anwendung - die Karte wird mit einer Standardansicht von Deutschland geladen

#### Windows SmartScreen Warnung umgehen

Beim ersten Start der Anwendung auf Windows-Systemen kann es zu einer Warnung von **Microsoft Defender SmartScreen** kommen:

```
Der Computer wurde durch Windows geschützt
Von Microsoft Defender SmartScreen wurde der Start einer unbekannten App verhindert.
Die Ausführung dieser App stellt u. U. ein Risiko für den PC dar.

App: Lagekarte.Setup.0.1.0-beta.1.exe
Herausgeber: Unbekannter Herausgeber
```

**Warum erscheint diese Warnung?**

Diese Warnung erscheint, weil die Anwendung nicht mit einem teuren Code-Signing-Zertifikat signiert ist. Die Anwendung ist dennoch sicher und Open Source - der Quellcode kann jederzeit auf GitHub eingesehen werden.

**So umgehen Sie die Warnung:**

**Methode 1: Bei Installation/Ausführung (EMPFOHLEN)**

1. Wenn die SmartScreen-Warnung erscheint, klicken Sie auf **"Weitere Informationen"**
2. Ein neuer Button **"Trotzdem ausführen"** wird sichtbar
3. Klicken Sie auf **"Trotzdem ausführen"**
4. Die Installation/Anwendung startet normal

![SmartScreen Weitere Informationen](assets/screenshots/smartscreen-weitere-info.png)
![SmartScreen Trotzdem ausführen](assets/screenshots/smartscreen-trotzdem-ausfuehren.png)

**Methode 2: Rechtsklick-Ausführung**

1. Klicken Sie mit der **rechten Maustaste** auf die EXE-Datei
2. Wählen Sie **"Eigenschaften"**
3. Setzen Sie ein Häkchen bei **"Zulassen"** oder **"Nicht mehr blockieren"** (falls vorhanden)
4. Klicken Sie auf **"Übernehmen"** und **"OK"**
5. Führen Sie die Datei normal per Doppelklick aus

**Methode 3: Windows Defender SmartScreen deaktivieren (Nur für Administratoren)**

⚠️ **Vorsicht:** Diese Methode deaktiviert den SmartScreen-Schutz für alle Anwendungen!

1. Öffnen Sie **Windows-Sicherheit** (Windows-Taste → "Windows-Sicherheit" eingeben)
2. Gehen Sie zu **"App- & Browsersteuerung"**
3. Klicken Sie unter **"Zuverlässigkeitsbasierter Schutz"** auf **"Einstellungen für zuverlässigkeitsbasierten Schutz"**
4. Ändern Sie **"Apps und Dateien überprüfen"** von "Warnen" auf **"Aus"**
5. Bestätigen Sie die Änderung mit Administratorrechten

**Hinweise für Unternehmensumgebungen (GPO/Domänen):**

Wenn Sie die Anwendung in einer Unternehmensumgebung mit Gruppenrichtlinien (GPO) einsetzen möchten:

1. **IT-Administrator kontaktieren:** Bitten Sie Ihren IT-Administrator, die EXE-Datei auf eine Whitelist zu setzen
2. **Hash-basierte Ausnahme:** Der Administrator kann den SHA256-Hash der Datei zu den vertrauenswürdigen Anwendungen hinzufügen
3. **Pfad-basierte Ausnahme:** Der Administrator kann den Installationspfad als vertrauenswürdig markieren
4. **AppLocker-Regel:** In Umgebungen mit AppLocker kann eine entsprechende Regel erstellt werden

**Alternative: Aus Quellcode selbst kompilieren**

Wenn Sie der vorgefertigten EXE-Datei nicht vertrauen, können Sie die Anwendung selbst aus dem Quellcode bauen:

1. Node.js installieren (https://nodejs.org/)
2. Repository klonen: `git clone https://github.com/TimUx/fw-lagekarte.git`
3. Abhängigkeiten installieren: `npm install`
4. Anwendung starten: `npm start`
5. Oder Installer erstellen: `npm run build:win`

Der komplette Quellcode ist auf GitHub verfügbar und kann vor der Nutzung überprüft werden.

### Grundfunktionen

#### 1. Feuerwehr-Standorte verwalten

**Standort hinzufügen:**

![Standort hinzufügen Dialog](assets/screenshots/standort-dialog.png)

1. Klicken Sie mit der **rechten Maustaste** auf die gewünschte Position auf der Karte
2. Wählen Sie "🏢 Standort hier hinzufügen" aus dem Kontextmenü
3. Geben Sie den Namen des Standorts ein (z.B. "Feuerwache Nord")
4. Optional: Geben Sie die Adresse ein
5. Die Koordinaten werden automatisch ausgefüllt (können auch manuell angepasst werden)
6. Klicken Sie auf "Speichern"

**Alternative Methode:**
1. Klicken Sie auf den Button "➕ Standort hinzufügen"
2. Geben Sie den Namen und die Adresse ein
3. Geben Sie die Koordinaten manuell ein oder verwenden Sie Rechtsklick auf der Karte
4. Klicken Sie auf "Speichern"

**Standort bearbeiten:**
1. Klicken Sie auf das Standort-Symbol auf der Karte
2. Klicken Sie im Popup auf "✏️ Bearbeiten"
3. Nehmen Sie Ihre Änderungen vor
4. Klicken Sie auf "Speichern"

**Standort löschen:**
1. Klicken Sie auf das Standort-Symbol auf der Karte
2. Klicken Sie im Popup auf "🗑️ Löschen"
3. Bestätigen Sie die Löschung

#### 2. Fahrzeuge verwalten

**Fahrzeug hinzufügen:**

![Fahrzeug hinzufügen Dialog](assets/screenshots/fahrzeug-dialog.png)

1. Klicken Sie auf den Button "➕ Fahrzeug hinzufügen"
2. Geben Sie den Rufnamen ein (z.B. "Florian Hamburg 1/44/1")
3. Wählen Sie den Fahrzeugtyp aus der Liste:
   - **Einsatzleitung:** ELW
   - **Löschfahrzeuge:** HLF, LF, StLF, TLF, TSF, TSF-W
   - **Rüst- und Gerätewagen:** GW-L1, GW-L2, RW
   - **Mannschaft und Transport:** MTF, MTW
   - **Hubrettungsfahrzeuge:** DLK
   - **Rettungsfahrzeuge:** KTW, NEF, RTW
4. Geben Sie die Besatzung ein (z.B. "1/8" für einen Trupp mit 8 Personen)
5. Optional: Wählen Sie eine zugeordnete Station aus
6. Optional: Fügen Sie Notizen hinzu
7. Klicken Sie auf "Speichern"

**Fahrzeug bearbeiten:**
1. Klicken Sie auf das "✏️" Symbol in der Fahrzeugkarte in der Seitenleiste
2. Nehmen Sie Ihre Änderungen vor
3. Klicken Sie auf "Speichern"

**Fahrzeug löschen:**
1. Klicken Sie auf das "🗑️" Symbol in der Fahrzeugkarte in der Seitenleiste
2. Bestätigen Sie die Löschung

#### 3. Fahrzeuge im Einsatz einsetzen

**Fahrzeug auf der Karte platzieren:**
1. Ziehen Sie ein Fahrzeug aus der linken Seitenleiste mit der Maus
2. Lassen Sie es an der gewünschten Position auf der Karte fallen (Drag & Drop)
3. Das Fahrzeug wird nun auf der Karte angezeigt
4. Eingesetzte Fahrzeuge werden in der Seitenleiste grün markiert

**Fahrzeug auf der Karte verschieben:**
1. Klicken und halten Sie das Fahrzeug-Symbol auf der Karte
2. Ziehen Sie es zur neuen Position
3. Lassen Sie die Maustaste los

**Fahrzeug-Informationen anzeigen:**
1. Klicken Sie auf das Fahrzeug-Symbol auf der Karte
2. Ein Popup zeigt Rufname, Typ, Besatzung und Notizen an

**Fahrzeug zurückrufen:**
1. Klicken Sie auf das Fahrzeug-Symbol auf der Karte
2. Klicken Sie im Popup auf "↩️ Zurückrufen"
3. Das Fahrzeug erscheint wieder in der Seitenleiste

#### 4. Kartenansicht anpassen

**Karte navigieren:**
- Zoomen: Mausrad oder +/- Buttons auf der Karte
- Verschieben: Karte mit der Maus ziehen

**Kartenansicht speichern:**
1. Passen Sie die Karte an (Zoom und Position)
2. Klicken Sie auf "💾 Kartenansicht speichern"
3. Die Ansicht wird gespeichert und beim nächsten Start wiederhergestellt

## Tipps und Tricks

1. **Schnelle Orientierung:** Verwenden Sie aussagekräftige Rufnamen für Fahrzeuge (z.B. nach dem Florian-System)

2. **Übersicht behalten:** Nutzen Sie unterschiedliche Fahrzeugtypen, um verschiedene Ressourcen zu unterscheiden

3. **Standorte nutzen:** Ordnen Sie Fahrzeuge den Standorten zu, um die Zuordnung zu erleichtern

4. **Besatzungsstärke:** Notieren Sie die Besatzung im Format "Führer/Mannschaft" (z.B. "1/8")

5. **Notizen:** Nutzen Sie das Notizen-Feld für wichtige Informationen wie Ausrüstung oder besondere Fähigkeiten

## Erweiterte Funktionen

### Karten-Layer wechseln

Die Anwendung bietet verschiedene Kartenansichten:

1. **OpenStreetMap** (Standard) - Detaillierte Straßenkarte
2. **Satellit (Esri)** - Satellitenaufnahmen für reale Geländeansicht
3. **Topographisch (OpenTopoMap)** - Topographische Karte mit Höhenlinien
4. **Hybrid** - Satellitenbilder mit Straßenbeschriftung

**Layer wechseln:**
1. Klicken Sie auf das Layer-Symbol (Rechteck-Icon) oben rechts auf der Karte
2. Wählen Sie den gewünschten Karten-Layer aus
3. Die Auswahl wird automatisch gespeichert und beim nächsten Start wiederhergestellt

### Lagekarte drucken

Drucken Sie eine professionelle Übersicht der aktuellen Lage:

1. Klicken Sie auf "🖨️ Karte drucken" in der oberen Leiste
2. Ein Druckdialog öffnet sich mit:
   - Der aktuellen Kartenansicht
   - Liste der im Einsatz befindlichen Fahrzeuge
   - Liste der verfügbaren Fahrzeuge
   - Liste aller Standorte
   - Zeitstempel der Erstellung
3. Wählen Sie Ihren Drucker und Druckeinstellungen
4. Optional: Speichern Sie als PDF für digitale Archivierung

**Tipp:** Stellen Sie vor dem Drucken sicher, dass die Karte den gewünschten Bereich zeigt und alle relevanten Fahrzeuge sichtbar sind.

### Netzwerk-Synchronisation (Multi-User)

Arbeiten Sie gemeinsam mit mehreren Benutzern an derselben Lagekarte in Echtzeit.

#### Integrierter Server (Empfohlen)

Die FW Lagekarte verfügt über einen **integrierten WebSocket + HTTP Server**, der direkt in der Electron-App läuft. Sie müssen keinen separaten Server mehr einrichten!

**Der integrierte Server bietet:**
- ✅ WebSocket-Synchronisation für Multi-User Echtzeit-Updates
- ✅ HTTP Web Viewer für schreibgeschützten Browser-Zugriff
- ✅ Automatisches Starten/Stoppen direkt aus der App
- ✅ Netzwerk-Erkennung zeigt alle IP-Adressen für Client-Verbindungen
- ✅ Live Client-Zähler zeigt verbundene Clients an
- ✅ Null-Konfiguration - einfach aktivieren und verwenden

**Server-Modus aktivieren:**

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

**Server-URLs verstehen:**

Nach dem Aktivieren sehen Sie verschiedene URLs:

- **Lokale Verbindungen (localhost):**
  - WebSocket: `ws://localhost:8080`
  - Web Viewer: `http://localhost:8080`
  - Diese URLs funktionieren nur auf dem gleichen Computer

- **Netzwerk-Adressen (LAN):**
  - z.B. Ethernet: `ws://192.168.1.100:8080` und `http://192.168.1.100:8080`
  - z.B. WiFi: `ws://192.168.1.101:8080` und `http://192.168.1.101:8080`
  - Diese URLs können von anderen Geräten im gleichen Netzwerk verwendet werden

**Clients verbinden:**

**Option 1: Electron-App (Desktop-Clients mit Bearbeitungsrechten)**
1. Öffnen Sie die FW Lagekarte auf einem anderen Computer
2. Klicken Sie auf **"🔄 Synchronisation"**
3. Wählen Sie Modus **"Client (Zum Server verbinden)"**
4. Geben Sie die WebSocket-URL des Servers ein (z.B. `ws://192.168.1.100:8080`)
5. Klicken Sie auf **"Speichern"**
6. Die App verbindet sich automatisch und synchronisiert Daten

**Option 2: Web Viewer (Browser - schreibgeschützt)**
1. Öffnen Sie einen beliebigen modernen Browser (Chrome, Firefox, Edge, Safari)
2. Geben Sie die HTTP-URL in die Adresszeile ein (z.B. `http://192.168.1.100:8080`)
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

**Verwendungszwecke:**

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

**Was wird synchronisiert:**
- Alle Standorte (Hinzufügen, Bearbeiten, Löschen)
- Alle Fahrzeuge (Hinzufügen, Bearbeiten, Löschen)
- Fahrzeugpositionen (Verschieben auf der Karte)
- Einsatzstatus (Verfügbar/Im Einsatz)

**Verbindungsstatus:**

Der Verbindungsstatus wird in der oberen Leiste angezeigt:
- 🟢 **Synchronisation aktiv / Server aktiv** - Verbunden und synchronisiert / Server läuft
- 🟡 **Verbinde...** - Verbindung wird hergestellt
- ⚫ **Nicht verbunden** - Offline oder Server nicht erreichbar
- 🔴 **Verbindungsfehler** - Verbindung fehlgeschlagen

**Sicherheitshinweise:**

⚠️ **Wichtig:**
- Der integrierte Server ist für den Betrieb in vertrauenswürdigen Netzwerken (LAN) konzipiert
- Der Server hat keine Benutzerauthentifizierung - jeder mit Zugriff auf die URL kann sich verbinden
- WebSocket-Verbindungen sind nicht verschlüsselt (ws://, nicht wss://)
- Verwenden Sie keine sensiblen Daten über öffentliche Netzwerke
- Stellen Sie sicher, dass Ihre Firewall den Server-Port blockiert, wenn er nicht im LAN verfügbar sein soll

**Wichtig:** Die Synchronisation ist optional. Die Anwendung funktioniert auch ohne Synchronisation im Einzelplatz-Modus vollständig offline.

## Offline-Nutzung

Die Anwendung ist auf allen Betriebssystemen offline-fähig:
- Alle Daten werden lokal auf Ihrem Computer gespeichert
- Kartenkacheln werden beim ersten Betrachten im Cache gespeichert
- Bereiche, die Sie bereits angesehen haben, sind auch offline verfügbar
- Für neue Bereiche ist eine Internetverbindung erforderlich

Die Anwendung läuft auf:
- ✅ **Windows** - als native Windows-Anwendung
- ✅ **Linux** - als AppImage oder .deb Paket
- ✅ **macOS** - als native Mac-Anwendung

## Datenspeicherung

- Alle Daten werden lokal im Browser-Speicher (IndexedDB) gespeichert
- Die Daten bleiben auch nach Neustart der Anwendung erhalten
- Keine Daten werden an externe Server übertragen
- Die Daten befinden sich im Electron-User-Data-Verzeichnis

## Fehlerbehebung

### Allgemeine Probleme

**Die Karte lädt nicht:**
- Überprüfen Sie Ihre Internetverbindung (nur beim ersten Laden erforderlich)
- Starten Sie die Anwendung neu

**Fahrzeuge lassen sich nicht verschieben:**
- Stellen Sie sicher, dass Sie das Fahrzeug aus der Seitenleiste ziehen
- Versuchen Sie, die Anwendung neu zu starten

**Änderungen werden nicht gespeichert:**
- Klicken Sie immer auf "Speichern" in den Formularen
- Überprüfen Sie, ob ausreichend Speicherplatz vorhanden ist

### Server-Modus Probleme

**Server startet nicht:**
- **Problem:** "Server konnte nicht gestartet werden"
- **Lösungen:**
  1. Prüfen Sie, ob der Port bereits verwendet wird:
     - Windows: Öffnen Sie Eingabeaufforderung und führen Sie aus: `netstat -ano | findstr :8080`
     - Linux/Mac: Öffnen Sie Terminal und führen Sie aus: `lsof -i :8080`
  2. Wählen Sie einen anderen Port in den Einstellungen (z.B. 8081, 8082, 3000)
  3. Starten Sie die App neu

**Clients können sich nicht verbinden:**
- **Problem:** Client zeigt "Verbindungsfehler"
- **Lösungen:**
  1. **Prüfen Sie die Firewall:**
     - Windows: Windows Defender Firewall muss die App erlauben
     - Linux: ufw oder iptables muss den Port freigeben
     - Mac: Systemeinstellungen > Sicherheit & Datenschutz > Firewall
  2. **Prüfen Sie die IP-Adresse:**
     - Verwenden Sie die richtige Netzwerk-Adresse (nicht localhost für andere Computer)
     - Testen Sie die Verbindung mit `ping 192.168.1.100` (Ihre Server-IP)
  3. **Prüfen Sie den Server-Status:**
     - Im Server: Status sollte "🟢 Server aktiv" zeigen
     - Anzahl verbundener Clients sollte angezeigt werden
  4. **Prüfen Sie das Netzwerk:**
     - Beide Computer müssen im gleichen Netzwerk sein
     - Router-Einstellungen können Geräte-zu-Geräte-Kommunikation blockieren

**Synchronisation verzögert:**
- **Problem:** Updates brauchen zu lange
- **Lösungen:**
  1. Prüfen Sie die Netzwerklatenz mit `ping 192.168.1.100` (Ihre Server-IP)
  2. Reduzieren Sie die Anzahl der Clients
  3. Verwenden Sie kabelgebundenes Ethernet statt WLAN

**Web Viewer lädt nicht:**
- **Problem:** Browser zeigt "Seite nicht gefunden"
- **Lösungen:**
  1. Prüfen Sie die URL - muss `http://` sein, nicht `ws://`
  2. Prüfen Sie, ob der Server läuft (Server-Status im Modal prüfen)
  3. Versuchen Sie einen anderen Browser
  4. Leeren Sie den Browser-Cache

## Tastenkombinationen

- **Ctrl + Plus (+):** Karte hineinzoomen
- **Ctrl + Minus (-):** Karte herauszoomen
- **ESC:** Aktuelle Aktion abbrechen / Modal schließen

## Support

Bei Fragen oder Problemen wenden Sie sich bitte an den Repository-Maintainer oder erstellen Sie ein Issue auf GitHub.
