<div align="center">

# ⌨️ 10-Finger Schreiben

**Lerne das 10-Finger-System – mit Lektionen, Schreibtests, Fehler-Heatmap und einem Arcade-Spiel.**

🎮 **[Jetzt spielen →](https://josyskd.github.io/10-finger-schreiben/)**

Komplett im Browser. Kein Login, keine Installation nötig. Funktioniert offline (PWA).

</div>

---

## ✨ Features

### 📚 16 progressive Lektionen
Vom allerersten Anschlag bis zu ganzen Sätzen – Grundreihe, obere & untere Reihe,
Umlaute & ß, Großschreibung, Zahlen, Satzzeichen und Profi-Sätze. Jede Lektion
vergibt 1–3 Sterne nach Tempo & Genauigkeit.

### ⏱️ Schreibtest
Miss deine echte Geschwindigkeit (WPM) und Genauigkeit – Wörter oder Sätze,
15 / 30 / 60 Sekunden oder bis zum Textende.

### 👾 Wortregen (Arcade-Spiel)
Tippe fallende Wörter weg, bevor sie den Boden erreichen. Mit Leveln, Combos,
Leben, Partikel-Effekten und steigendem Tempo. Wie lange hältst du durch?

### ✋ Live-Hilfen
- **Virtuelle Tastatur** hebt die nächste Taste hervor – farbcodiert nach Finger
- **Hand-Anzeige** zeigt, welcher Finger dran ist
- Sofortiges grün/rot-Feedback bei jedem Anschlag

### 📊 Statistiken & 🏆 Erfolge
- WPM-Verlaufsdiagramm der letzten Runden
- **Fehler-Heatmap**: welche Tasten du am häufigsten vertippst
- 12 freischaltbare Erfolge

### 🎨 Drumherum
- 5 Themes (Neon, Ozean, Sonnenuntergang, Wald, Mono Hell)
- Synthetisierte Soundeffekte (keine Downloads)
- Deutsch & Englisch als Text-Sprache
- Konfetti & Achievement-Toasts
- Fortschritt wird lokal gespeichert (localStorage)
- **Offline-fähig** dank Service Worker

## 🕹️ Steuerung
- Einfach lostippen – der Cursor wandert automatisch weiter
- **Backspace** korrigiert
- **Esc** bringt dich jederzeit ins Hauptmenü zurück

## 🚀 Lokal starten
Da ES-Module verwendet werden, ist ein kleiner Webserver nötig:

```bash
git clone https://github.com/JOSYSKD/10-finger-schreiben.git
cd 10-finger-schreiben
python3 -m http.server 8000
# dann http://localhost:8000 im Browser öffnen
```

## 🛠️ Technik
Reines **Vanilla JavaScript** (ES-Module), HTML & CSS – kein Framework, kein Build-Schritt.
Das Spiel läuft auf `<canvas>`, Sounds kommen aus der Web Audio API.

```
index.html
css/style.css
js/  app.js · data.js · engine.js · game.js · keyboard.js · audio.js · storage.js
sw.js (Service Worker)
```

---

<div align="center">
Mit ❤️ gebaut. Viel Spaß beim Tippenlernen!
</div>
