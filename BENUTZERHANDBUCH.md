# Benutzerhandbuch - FW Lagekarte

## Übersicht

Die FW Lagekarte ist eine Desktop-Anwendung zur Verwaltung von Feuerwehr-Einsatzlagen. Sie ermöglicht die Visualisierung von Standorten und Fahrzeugen auf einer interaktiven Karte.

![Hauptansicht der Anwendung](assets/screenshots/hauptansicht.png)

*Die Hauptansicht zeigt die Seitenleiste mit Fahrzeugen (gruppiert nach Standorten mit taktischen Zeichen) und die interaktive Karte.*

## Erste Schritte

### Installation
1. Laden Sie die Anwendung herunter und installieren Sie sie
2. Starten Sie die Anwendung - die Karte wird mit einer Standardansicht von Deutschland geladen

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

**Voraussetzungen:**
- Ein WebSocket-Server muss eingerichtet und erreichbar sein
- Alle Benutzer müssen sich mit demselben Server verbinden

**Synchronisation einrichten:**
1. Klicken Sie auf "🔄 Synchronisation" in der oberen Leiste
2. Aktivieren Sie "Synchronisation aktivieren"
3. Geben Sie die Server-URL ein (z.B. `ws://192.168.1.100:8080` oder `wss://sync-server.example.com`)
4. Klicken Sie auf "Speichern"
5. Der Verbindungsstatus wird in der oberen Leiste angezeigt:
   - 🟢 **Synchronisation aktiv** - Verbunden und synchronisiert
   - 🟡 **Verbinde...** - Verbindung wird hergestellt
   - ⚫ **Nicht verbunden** - Offline oder Server nicht erreichbar
   - 🔴 **Verbindungsfehler** - Verbindung fehlgeschlagen

**Was wird synchronisiert:**
- Alle Standorte (Hinzufügen, Bearbeiten, Löschen)
- Alle Fahrzeuge (Hinzufügen, Bearbeiten, Löschen)
- Fahrzeugpositionen (Verschieben auf der Karte)
- Einsatzstatus (Verfügbar/Im Einsatz)

**Wichtig:** Die Synchronisation ist optional. Die Anwendung funktioniert auch ohne Synchronisation im Einzelplatz-Modus vollständig offline.

**Hinweis für Administratoren:** Ein WebSocket-Server muss separat eingerichtet werden. Die Anwendung enthält nur den Client-Teil der Synchronisation.

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

**Die Karte lädt nicht:**
- Überprüfen Sie Ihre Internetverbindung (nur beim ersten Laden erforderlich)
- Starten Sie die Anwendung neu

**Fahrzeuge lassen sich nicht verschieben:**
- Stellen Sie sicher, dass Sie das Fahrzeug aus der Seitenleiste ziehen
- Versuchen Sie, die Anwendung neu zu starten

**Änderungen werden nicht gespeichert:**
- Klicken Sie immer auf "Speichern" in den Formularen
- Überprüfen Sie, ob ausreichend Speicherplatz vorhanden ist

## Tastenkombinationen

- **Ctrl + Plus (+):** Karte hineinzoomen
- **Ctrl + Minus (-):** Karte herauszoomen
- **ESC:** Aktuelle Aktion abbrechen / Modal schließen

## Support

Bei Fragen oder Problemen wenden Sie sich bitte an den Repository-Maintainer oder erstellen Sie ein Issue auf GitHub.
