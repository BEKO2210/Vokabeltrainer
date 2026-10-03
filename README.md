# Vokabel Master+

Englisch-Vokabeltrainer als **Progressive Web App** – offline, ohne Konto, alle Daten bleiben auf dem Gerät.

## Funktionen

- **1.600+ Vokabeln** in 16 Themen (inkl. „5. Klasse Gymnasium“), jeweils mit Beispielsatz auf Englisch und Deutsch
- **„Jetzt lernen“**: mischt automatisch fällige Wiederholungen und neue Wörter (Spaced Repetition, Stufen 1–60 Tage)
- **Vier Übungsarten**: Karteikarten, Auswahl (4 Antworten), Schreiben, Diktat (Hören & Schreiben, auch langsam)
- **Falsche Wörter kommen in derselben Runde noch einmal**, am Ende gibt es „Fehler üben“
- **Nachsichtige Prüfung**: Artikel, Groß-/Kleinschreibung, „to“, Umlaut-Schreibweise (ae/ä) und einzelne Tippfehler werden verziehen; mehrere Lösungen mit „/“
- **Tagesziel & Serie**, Statistik mit 14-Tage-Verlauf, Wortschatz-Stufen und schwierigen Wörtern
- **Themen & Wörter** auswählen, durchsuchen, eigene Wörter anlegen (mit Rückgängig beim Löschen)
- **Sicherung** als JSON, Import von CSV-Wortlisten
- Hell/Dunkel/Auto, Aussprache (US/UK), Töne, Vibration, Android-Zurück-Taste

## Lokal starten

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

Unter Windows: `Start_Server.bat` doppelklicken.

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `index.html` | App-Gerüst und Navigation |
| `styles.css` | Design-System (Tokens für hell/dunkel) |
| `vocabulary.js` | Mitgelieferte Vokabeln (`PRESET_VOCABULARY`) |
| `app.js` | Logik und Oberfläche (Vanilla JS, IndexedDB) |
| `sw.js` | Service Worker: Netzwerk zuerst, Cache als Offline-Fallback |

Änderungen an `vocabulary.js` werden bei bestehenden Installationen nur übernommen, wenn `CONFIG.PRESET_VERSION` in `app.js` erhöht wird. Der Lernfortschritt bleibt dabei erhalten.

## Rechtliches

Impressum, Datenschutz und Nutzungsbedingungen stehen in der App unter **Mehr**.
