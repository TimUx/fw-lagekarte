# FW Lagekarte - Schnellstart

Schnelleinstieg für neue Benutzer - in 5 Minuten einsatzbereit!

![FW Lagekarte Hauptansicht](assets/screenshots/hauptansicht.png)

## 🚀 Installation (2 Minuten)

### Vorgefertigte Installer (Empfohlen)

Laden Sie die passende Version von den [GitHub Releases](https://github.com/TimUx/fw-lagekarte/releases):

| Betriebssystem | Installer | Installation |
|----------------|-----------|--------------|
| **Windows** | `FW-Lagekarte-Setup-X.X.X.exe` | Ausführen und Anweisungen folgen |
| **Linux** | `FW-Lagekarte-X.X.X.AppImage` | `chmod +x *.AppImage && ./FW-Lagekarte-*.AppImage` |
| **Linux** | `fw-lagekarte_X.X.X_amd64.deb` | `sudo dpkg -i fw-lagekarte_*.deb` |
| **macOS** | `FW-Lagekarte-X.X.X.dmg` | Öffnen und in Programme ziehen |

**Windows-Hinweis**: Bei SmartScreen-Warnung auf "Weitere Informationen" → "Trotzdem ausführen" klicken. Siehe [Details](BENUTZERHANDBUCH.md#windows-smartscreen-warnung-umgehen).

### Entwicklung (für Entwickler)

```bash
git clone https://github.com/TimUx/fw-lagekarte.git
cd fw-lagekarte
npm install
npm start
```

## 🎯 Erste Schritte (3 Minuten)

### 1️⃣ Standort hinzufügen (30 Sekunden)

![Standort Dialog](assets/screenshots/standort-dialog.png)

**Schnellvariante**:
- Rechtsklick auf Karte → "🏢 Standort hier hinzufügen"
- Name eingeben → Speichern

**Alternative**:
- Button "➕ Standort hinzufügen" → Formular ausfüllen → Speichern

### 2️⃣ Fahrzeuge hinzufügen (1 Minute)

![Fahrzeug Dialog](assets/screenshots/fahrzeug-dialog.png)

**Minimal**:
1. Button "➕ Fahrzeug hinzufügen"
2. **Rufname**: "Florian Hamburg 1/44/1" (oder Ihr Rufzeichen)
3. **Typ**: HLF, LF, DLK, etc. auswählen
4. **Besatzung**: "1/8" (Führer/Mannschaft)
5. Speichern

**Optional**: Station zuordnen, Notizen hinzufügen

### 3️⃣ Fahrzeuge einsetzen (30 Sekunden)

**Drag & Drop**:
1. Fahrzeug aus linker Seitenleiste **klicken und halten**
2. Auf gewünschte Position auf Karte **ziehen**
3. **Loslassen** → Fahrzeug wird platziert
4. ✅ Fahrzeug ist jetzt grün markiert (im Einsatz)

**Zurückrufen**:
- Auf Fahrzeug-Icon auf Karte klicken → "↩️ Zurückrufen"

### 4️⃣ Kartenansicht speichern (10 Sekunden)

1. Karte auf gewünschten Bereich zoomen/verschieben
2. Button "💾 Kartenansicht speichern" klicken
3. ✅ Beim nächsten Start wird diese Ansicht geladen

## 💡 Wichtige Tipps

### Bedienung
- **ESC** - Schließt Dialoge
- **Mausrad** - Zoom auf Karte
- **Drag & Drop** - Fahrzeuge ziehen
- **Rechtsklick auf Karte** - Schnell Standort hinzufügen
- **Klick auf Marker** - Details und Aktionen

### Best Practices
- ✅ Aussagekräftige Rufnamen verwenden (Florian-System)
- ✅ Fahrzeuge Standorten zuordnen (bessere Übersicht)
- ✅ Besatzung im Format "Führer/Mannschaft" (z.B. "1/8")
- ✅ Notizen für besondere Ausrüstung nutzen
- ✅ Regelmäßig Backup exportieren (📤 Export)

## 🔄 Multi-User aktivieren (Optional)

### Für Leitstellen-Betrieb mit mehreren Arbeitsplätzen:

**Server starten** (Haupt-Computer):
1. Button "🔄 Synchronisation"
2. Modus: **"Server (Synchronisation bereitstellen)"**
3. Port: 8080 (Standard)
4. Speichern → Server läuft!

**Client verbinden** (andere Computer):
1. Button "🔄 Synchronisation"
2. Modus: **"Client (Zum Server verbinden)"**
3. URL: `ws://192.168.1.XXX:8080` (aus Server-Dialog kopieren)
4. Speichern → Verbunden!

**Web Viewer** (Tablets/Displays):
- Browser öffnen
- URL: `http://192.168.1.XXX:8080`
- Fertig! (schreibgeschützte Ansicht)

## 📚 Weitere Dokumentation

| Dokument | Inhalt |
|----------|--------|
| **[README.md](README.md)** | Übersicht, Features, Systemintegration |
| **[BENUTZERHANDBUCH.md](BENUTZERHANDBUCH.md)** | Ausführliche Bedienungsanleitung |
| **[FEATURES.md](FEATURES.md)** | Detaillierte Feature-Liste |
| **[ARCHITEKTUR.md](ARCHITEKTUR.md)** | Technische Architektur (für Entwickler) |

## 🔧 Für Entwickler

### Entwicklung starten
```bash
git clone https://github.com/TimUx/fw-lagekarte.git
cd fw-lagekarte
npm install
npm start
```

### Installer bauen
```bash
npm run build       # Alle Plattformen
npm run build:win   # Nur Windows
npm run build:linux # Nur Linux
npm run build:mac   # Nur macOS
```

Siehe [ARCHITEKTUR.md](ARCHITEKTUR.md) für technische Details.

## 🆘 Hilfe & Support

**Problem?** → Prüfen Sie zuerst das [Benutzerhandbuch](BENUTZERHANDBUCH.md#fehlerbehebung)

**Karte lädt nicht?** → [Proxy-Einstellungen](BENUTZERHANDBUCH.md#proxy-einstellungen)

**Multi-User funktioniert nicht?** → [Server-Probleme](BENUTZERHANDBUCH.md#server-modus-probleme)

**Noch Fragen?** → [GitHub Issues](https://github.com/TimUx/fw-lagekarte/issues)

---

**Fertig! Sie können jetzt mit der FW Lagekarte arbeiten.** 🚒

Für erweiterte Funktionen siehe [BENUTZERHANDBUCH.md](BENUTZERHANDBUCH.md).
