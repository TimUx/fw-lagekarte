# Benutzerhandbuch - FW Lagekarte

## Übersicht

Die FW Lagekarte ist eine Desktop-Anwendung zur Verwaltung von Feuerwehr-Einsatzlagen. Sie ermöglicht die Visualisierung von Standorten und Fahrzeugen auf einer interaktiven Karte.

## Erste Schritte

### Installation
1. Laden Sie die Anwendung herunter und installieren Sie sie
2. Starten Sie die Anwendung - die Karte wird mit einer Standardansicht von Deutschland geladen

### Grundfunktionen

#### 1. Feuerwehr-Standorte verwalten

**Standort hinzufügen:**
1. Klicken Sie auf den Button "➕ Standort hinzufügen"
2. Geben Sie den Namen des Standorts ein (z.B. "Feuerwache Nord")
3. Optional: Geben Sie die Adresse ein
4. Klicken Sie auf die Karte, um die Position zu markieren
   - Alternativ können Sie die Koordinaten direkt eingeben
5. Klicken Sie auf "Speichern"

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
1. Klicken Sie auf den Button "➕ Fahrzeug hinzufügen"
2. Geben Sie den Rufnamen ein (z.B. "Florian Hamburg 1/44/1")
3. Wählen Sie den Fahrzeugtyp aus der Liste:
   - LF - Löschfahrzeug
   - DLK - Drehleiter
   - TLF - Tanklöschfahrzeug
   - RW - Rüstwagen
   - ELW - Einsatzleitwagen
   - MTW - Mannschaftstransportwagen
   - KTW - Krankentransportwagen
   - RTW - Rettungswagen
   - NEF - Notarzteinsatzfahrzeug
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

## Offline-Nutzung

Die Anwendung ist offline-fähig:
- Alle Daten werden lokal auf Ihrem Computer gespeichert
- Kartenkacheln werden beim ersten Betrachten im Cache gespeichert
- Bereiche, die Sie bereits angesehen haben, sind auch offline verfügbar
- Für neue Bereiche ist eine Internetverbindung erforderlich

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
