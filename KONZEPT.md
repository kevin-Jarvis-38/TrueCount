# TrueCount – Konzept

Eine Blackjack-App, mit der man **Kartenzählen (Hi-Lo)** und die **richtige Spielweise** lernt.
Diese Datei ist der feste Stand, den der Nutzer und Claude gemeinsam festgelegt haben (2026-10-22/23).
Ändert sich etwas, wird es hier nachgetragen.

## Technik
- Web-App (PWA) auf GitHub Pages (`kevin-Jarvis-38/TrueCount`), kostenlos und offline.
- Zuerst nur für Android (installiert über Chrome). So gebaut, dass sie auch auf dem iPhone läuft (Safari: „Zum Home-Bildschirm“).
- Hochformat und Querformat sind gleichwertig. Alle Knöpfe liegen in Daumen-Reichweite: hochkant unten,
  quer links und rechts am Rand.
- Der Spielstand liegt auf dem Gerät. Es gibt einen **Admin-Testmodus** mit PIN und eigenem Spielstand, in dem alles freigeschaltet ist.
- Später kommt ein Mehrspieler-Modus über Firebase: mit den Freunden an einem Tisch, mit denselben Karten. Danach vielleicht ein Ranked-Modus.
  Die Spiellogik wird von Anfang an so gebaut, dass der Mehrspieler-Modus ohne Umbau dazukommen kann.
- Poker (Texas Hold'em) wird später eine **eigene** App.

## Regeln (europäisch)
- Keine Hole Card: Der Dealer bekommt seine 2. Karte erst, wenn alle Spieler fertig sind.
  Hat er Blackjack, verliert man auch die Einsätze aus Verdoppeln und Splitten. Die Strategie richtet sich danach.
- Der Dealer bleibt bei Soft 17 stehen. Blackjack zahlt 3:2.
- Verdoppeln ist auf jede Anfangshand erlaubt, auch nach einem Split. Splitten geht bis zu 4 Hände. Geteilte Asse bekommen je nur 1 Karte.
- Versicherung (zahlt 2:1) und Surrender (halber Einsatz zurück) gibt es.
- Der Schuh hat 1–8 Decks (einstellbar) und wird wie im Casino gemischt. Jede Karte gibt es pro Deck nur einmal.
  Die Schnittkarte liegt einstellbar bei Standard 75 % (50–85 %).
- Details aus Etappe 1:
  - Die erste Karte jedes Schuhs wird verbrannt und kommt verdeckt in die Ablage.
  - Ausgeteilt wird von rechts nach links (von der linken Seite des Dealers aus).
  - Alle Zehnerwerte (10, B, D, K) dürfen untereinander geteilt werden. Asse werden nicht nachgeteilt.
  - Surrender geht nur mit den ersten zwei Karten und nicht nach einem Split. Der halbe Einsatz kommt sicher zurück.
  - Wird der Schuh mitten in einer Runde leer (bei 1 Deck möglich), wird die Ablage gemischt, danach kommt ein neuer Schuh.
  - Im Hinterzimmer sind standardmäßig 2 Decks im Schuh.
  - Hinterzimmer-Mitspieler: Rambo-Rudi (rechts, spielt wild: teilt alles, zieht bis 17) und
    Crazy Joe (links, spielt Basisstrategie, macht betrunken Fehler und versichert manchmal).

## Zählen (das Herzstück)
- Hi-Lo: 2–6 zählen +1, 7–9 zählen 0, 10/B/D/K/A zählen −1.
- Lernhilfe (Wunsch vom 2026-10-23): Jede Karte zeigt links eine kleine Marke mit ihrem Zählwert (grün +1, grau 0, rot −1).
  Sie ist in den Optionen abschaltbar und standardmäßig an.
- True Count = laufender Count ÷ restliche Decks. Die Decks schätzt man auf ein halbes Deck genau, das Ergebnis wird abgerundet.
- Die App fragt **vor dem Setzen** nach dem True Count, manchmal auch nach dem laufenden Count.
  Danach zeigt sie immer den Rechenweg.
- Die Schwierigkeit steigt pro Tisch:
  - Die Fragen kommen seltener, im Hinterzimmer alle 2–3 Hände, am Profi-Tisch erst nach 8–12 Händen.
  - Es gibt mehr Mitspieler und mehr Decks.
  - Der Dealer gibt schneller.
  - Das Zeitlimit wird kürzer. Im Hinterzimmer gibt es keins.
- Die Ablage und der Schuh sind im **echten Größenverhältnis** gezeichnet (1 Deck ≈ 1,5 cm dick), damit das Schätzen in echt funktioniert.
- **Strategie-Lehrer:** Bei einem falschen Zug zeigt er sofort den richtigen Zug und eine kurze Erklärung. Er kennt die Basisstrategie
  und die Abweichungen je nach Count. Abschaltbar.
- Der **Einsatz** wird nach dem Count bewertet (hoher Count = mehr setzen).
- **Freestyle:** Lehrer und Count-Fragen aus, einfach spielen.
- **Trainingsbereich** (eigener Menüpunkt) ohne Spiel: Karten blitzschnell zählen, ein ganzes Deck in einem Rutsch, große Knöpfe für schnelles Tippen.

## Tische
| Tisch | Einsatz | Freischaltung | Hände |
|---|---|---|---|
| 1 Hinterzimmer | 5 – 100 | immer offen | 1 |
| 2 | 25 – 500 | 2.000 Guthaben + Level 5 | 1 |
| 3 | 100 – 2.000 | 10.000 + Level 12 | 1 |
| 4 Multi-Hand | höher | 25.000 + Level 20 + 80 % Count-Quote | 1–3 |
| 5 No Limit (Endboss) | ohne Limit | 100.000 + Level 30 + 90 % | bis 5 |

- Einmal freigeschaltete Tische bleiben offen, auch nach einer Pleite.
- Ab Tisch 2 muss man beim Hinsetzen mindestens das 20-Fache des Mindesteinsatzes haben. An Tisch 1 kann man immer sitzen.

## Geld, XP und Level
- Man startet mit 1.000 € in Chips. Einsätze wählt man über ein Chip-Menü: Chips antippen, den letzten zurücknehmen
  oder alle leeren, dann bestätigen. Die Summe steht immer dabei.
- **Pott:** XP, die man am Tisch verdient, liegen erst im Pott. Erst beim **Aufstehen** wandern sie sicher aufs Konto.
  Wer bei kaltem Count aufsteht (TC ≤ −1, „Wonging“), bekommt Bonus-XP.
- Woher die XP kommen:
  - True Count richtig: +10, bei schneller Antwort bis +5 dazu
  - Einsatz passend zum Count: +3
  - Richtiger Zug mit Lehrer: +1
  - Rechtzeitig aufstehen: +20
  - Sitzungsgewinn: je nach Höhe
  - Erfolge: 25–500, die gehen sofort aufs Konto

  Falsche Antworten geben 0 XP. Es wird **nie etwas abgezogen**. An den höheren Tischen gibt es mehr XP.
- Jedes Level braucht spürbar mehr XP als das vorige. Grobe Planung:
  - Tisch 2 nach 1–2 Abenden
  - Tisch 3 nach 2–3 Wochen
  - Tisch 4 nach 1–2 Monaten
  - Tisch 5 nach 3+ Monaten

  Die genauen Zahlen werden in der Testphase eingestellt.
- Titel: Level 1–9 Frischling, 10–19 Kartenzähler, 20–29 Kartenhai, 30–39 High Roller, ab 40 Legende.
- **Serien-Bonus:** Jede Sitzung, die mit Gewinn endet, erhöht den XP-Multiplikator (bis ×2).
- **Pleite (0 €):** Die XP im Pott sind weg, der Serien-Bonus fällt auf ×1 und das Geld fängt wieder bei 1.000 an.
  Das Level, die Erfolge, die Tische und die gekauften Outfits bleiben. Der Pleite-Zähler steht im Profil.
- **Comeback-Bonus:** Wer sich von unter 500 wieder über 1.000 hocharbeitet, bekommt einen Erfolg und XP.
- **Erfolge:** viele, jeder mit XP. Sie bleiben für immer als Trophäen.
  Beispiele: 100 Hände, All-In, Perfekter Schuh, Blackjack-Serie, Der Wonger.

## Figuren und Shop
- **Du:** Am Anfang wählst du einmal dein Tier: Fuchs, Krokodil, Koala, Lama oder Känguru.
  Dazu eine Farbe aus einer kleinen Auswahl und eins von 3 Starter-Outfits. Den Platz am Tisch wählst du frei.
- **Shop:** Mit Chips kauft man Hemden, Shirts, Sonnenbrillen und mehr. Man kann nur mit Chips **über 1.000** kaufen,
  damit man nicht durch eine absichtliche Pleite an Chips kommt.
- **Mitspieler:** goofy Tiere mit bescheuerten Namen, ein Gorilla, ein Hund, ein Esel, ein Kater, ein aggressiver Hase und eine Hyäne
  (z. B. „Crazy Joe“, „Futon der Abi“). Im Hinterzimmer sehen sie abgerissen aus: fleckiges Hemd, Kippe, angetrunken, Kiffer.
  Je besser der Tisch, desto schicker werden sie.
- Der Dealer ist (Vorschlag) ein Pinguin im Frack.

## Design
- Am 2026-10-23 gewählt: **Entwurf A „Comic-Klassik“** (`entwuerfe/a.html`). Das heißt dicke schwarze Linien, harte Schatten,
  Holz-Hinterzimmer, Schrift Luckiest Guy und Knöpfe mit „Klick-Kante“. Später kann noch alles angepasst werden.

## Ton
- Karten, Chips, Gemurmel, Spielautomaten im Hintergrund und Gewinn-Fanfaren dürfen ruhig übertrieben sein.
  Alles ist einzeln regelbar und abschaltbar. Es werden nur frei verwendbare Geräusche genommen.

## Etappen
0. Konzept und 3 Design-Entwürfe, der Nutzer wählt einen
1. Tisch Hinterzimmer: Regeln, Schuh, Setzen, alle Spielzüge
2. Zählen: Count-Fragen, Lehrer, Einsatz-Bewertung, Freestyle
3. XP, Pott, Level, Pleite-Regeln, Erfolge, Admin-Testmodus
4. Eigener Charakter, Mitspieler-Tiere, Shop
5. Tische 2–5 mit Multi-Hand und No Limit
6. Trainingsbereich und Sounds
7. Icon („TC“ mit Ass und König), Installation auf dem Handy, Freunde testen
8. Mehrspieler mit Firebase

Stand 2026-10-23 (Nacht): Etappe 0–7 sind gebaut. Offen sind „Freunde testen“ (Etappe 7) und Etappe 8 (Firebase, dafür braucht es das Google-Konto des Nutzers).

## Entscheidungen beim Durchbauen (2026-10-23, Nutzer hat geschlafen – alles änderbar)
- Tische: 1 Hinterzimmer, 2 Kellerclub, 3 Grand Casino, 4 Lounge (50–1.000 €, 2–3 Hände), 5 Penthouse (ab 500 €, 1–5 Hände, nur du gegen den Dealer).
  Decks 2/4/6/6/6. Count-Fragen alle 2–3 / 3–5 / 5–8 / 6–10 / 8–12 Hände. Zeitlimit –/20/15/12/8 Sekunden. Der Dealer wird pro Tisch schneller.
  Hinsetzen ab Tisch 2 mit 20 × Mindesteinsatz (500 / 2.000 / 1.000 / 10.000 €).
- Mitspieler: Kellerclub mit Bello Bankrott (Hund), Hicks-Heinz (Hyäne) und Futon der Abi (Kater). Grand Casino mit Esel-Eddie,
  Gorilla Gustav, Kater Karlo und Hasi Hartmann. Lounge mit Diamanten-Dieter (Hund) und Hyänen-Hilde.
- Count-Frage: 70 % True Count, 30 % laufender Count. Erst ab 12 gespielten Karten im Schuh. Wer die Decks um ein halbes Deck
  anders schätzt, liegt auch richtig. Die Frage blendet sich so ein, dass Schuh und Ablage sichtbar bleiben.
- Einsatz-Bewertung: Eine Einheit sind 2 × Mindesteinsatz. Empfohlen sind 1 / 2 / 4 / 6 / 8 Einheiten bei True Count ≤ +1 / +2 / +3 / +4 / ≥ +5.
- Lehrer: Basisstrategie plus die wichtigsten Abweichungen (Illustrious 18, Fab 4). Ein falscher Zug wird trotzdem ausgeführt,
  der Lehrer zeigt dann den richtigen. Versicherung lohnt sich ab True Count +3.
- XP: Level-Kurve 60 × (Level − 1)^2,1. Tisch-Faktor 1 / 1,5 / 2 / 3 / 4. Aufstehen sichert den Pott × Serien-Bonus.
  Dazu kommen Sitzungsgewinn-XP und der Wonging-Bonus (20 XP × Tisch-Faktor, ab 5 Runden).
  Der Serien-Bonus steigt um +0,1 pro Gewinn-Sitzung (ab 5 Runden), eine Verlust-Sitzung setzt ihn auf ×1.
- Pleite heißt: unter 5 € (man kann nirgends mehr setzen). An höheren Tischen muss man unter dem Mindesteinsatz aufstehen, der Pott bleibt dann.
- Count-Quote für Tisch 4/5: die letzten 50 Antworten, sie zählt ab 30 Antworten.
- Shop: Outfits, Accessoires und kostenloses Umfärben. Den Platz am Tisch wählt man in den Optionen (Tische mit einer Hand).
- Training: Blitz-Zählen, Deck-Countdown, True Count rechnen und Strategie-Drill. Höchstens 300 XP pro Tag.
- Geräusche werden im Browser erzeugt (keine Dateien). Effekte und Hintergrund sind getrennt regelbar.
- Admin-Testmodus: PIN 2121, eigener Spielstand mit 1.000.000 €, Level 40 und allem freigeschaltet. Optional zeigt er den Count live an.

## Aufbau
- `js/karten.js`: Karten, Werte, Hi-Lo, Zufall mit Startwert, Schuh
- `js/strategie.js`: Basisstrategie, Abweichungen nach dem Count, Erklärungen, Einsatz-Bewertung
- `js/tisch.js`: Spiellogik ohne Oberfläche, mit Konten für mehrere Hände und laufendem Count (Grundlage für den Mehrspieler-Modus)
- `js/tische.js`: die fünf Tische und alle Mitspieler
- `js/figuren.js`: alle Tiere, Outfits und Accessoires, `js/szene.js`: der Tisch als SVG
- `js/profil.js`: Spielstand (localStorage `truecount.v2`, Admin `truecount.admin`, Einstellungen `truecount.einstellungen`), XP, Level, Erfolge
- `js/app.js`: Lobby, Tisch, Count-Fragen, Shop, Optionen, `js/training.js`: Trainingsbereich, `js/ui.js`: Meldungen, Einblendungen, Zahlenfeld
- `js/sound.js`: Geräusche, `sw.js` + `manifest.webmanifest` + `icons/`: Installation und Offline-Betrieb
- `test/sim.mjs`: spielt 200.000 Runden durch und prüft, dass weder Geld noch Karten noch der Count verloren gehen

## Hinweise für die Entwicklung
- Spiellogik testen: `MSYS_NO_PATHCONV=1 docker run --rm -v "$PWD":/app -w /app node:22-alpine node test/sim.mjs`
- Bei jeder Änderung die CACHE-Nummer im Service Worker erhöhen und die Dateien mit `cache:'reload'` holen (Erfahrung aus Workie).
- Der Testserver läuft auf Port 8765, weil 8123 von Home Assistant belegt ist.
- Push aus Claude Code: `GIT_TERMINAL_PROMPT=1` und `GCM_INTERACTIVE=always`. Commit-Nachrichten mit `git commit -F`.

## Rückmeldung nach dem ersten Test (2026-10-23, umgesetzt)
- **Erfolge** zeigen einen Fortschrittsbalken mit Zwischenstand (z. B. „37 / 100“). Bei den Tisch-Erfolgen stehen Level, Guthaben und Quote.
- **Deine Figur** steht hochkant bündig auf der „Du bist dran“-Leiste und verschwindet nicht mehr hinter den Knöpfen.
- **Admin-Count** als Tafel links neben dem Dealer, mit Rechenweg: laufender Count, Decks im Schuh (auf ein halbes Deck), True Count = laufend ÷ Decks.
- **Hilfen nur am Anfang** (Variante „locker“): Zählwerte auf den Karten an Tisch 1–2, Deck-Anzeige am Schuh und Lehrer an Tisch 1–3,
  Professor Uhu (i-Knopf) nur an Tisch 1. Ab Tisch 4 gibt es die XP für richtige Züge und Einsätze still, ohne Hinweis.
- **Mehrere Hände** an Tisch 4 (bis 3) und 5 (bis 5): Vor der Runde liegt auf jedem freien Platz ein Plus. Ein rotes × legt eine Hand wieder weg.
  Deine Figur rutscht immer zu der Hand, die gerade dran ist. Die Hände-Auswahl im Einsatz-Menü gibt es nicht mehr.
- **Zählhilfe im Training** (Blitz-Zählen, Deck-Countdown): Unter der Karte steht, welche Karten +1, 0 oder −1 zählen. In den Optionen abschaltbar.
- **Training:** Die Antworten werden direkt auf der Seite eingegeben, „← Zurück“ geht immer. Der Stand der verlassenen Runde ist dann weg.
- Neuer Modus **Zählwert-Tippen**: 30 Karten, zu jeder schnell −1, 0 oder +1 tippen. Erfolg „Blitzfinger“ für 30 richtige in unter 30 Sekunden.
- **Profil** (Tipp auf das Profil in der Lobby): Übersicht mit allen Werten, Charakter (Tier, Farbe, Outfits, Accessoires) und Erfolge.
  💸 in der Lobby ist der Pleite-Zähler.
- **Shop:** 25 Outfits und 22 Accessoires. Accessoires liegen in Fächern (Kopf, Augen, Hals, Mund), aus jedem Fach trägt man eins gleichzeitig.
- **Professor Uhu** (Eule mit Doktorhut) läuft seitlich ins Bild und erklärt in einer großen Sprechblase: deine Hand, wie oft sich der Dealer
  überkauft, dein Risiko beim Ziehen, den richtigen Zug mit Begründung, die Count-Abweichung und einen Merksatz. Im Strategie-Drill gibt es ihn
  über „Frag Professor Uhu“ (die Hand zählt dann nicht als Punkt), nach einem Fehler kommt er von selbst.
- **App-Icon:** das Bild des Nutzers („TC“ mit Ass und Bube), zugeschnitten auf das Quadrat (`icons/`).

## Rückmeldung nach dem zweiten Test (2026-10-23, umgesetzt)
- **Tipp-Leiste:** Zwei Zeilen passen jetzt hinein. Wird ein Hinweis noch länger, wird die Schrift kleiner, statt abgeschnitten zu werden.
- **Verdoppeln:** Die Strategie-Tabellen waren richtig. Der Lehrer hat aber nicht gesagt, wenn Verdoppeln gerade nicht erlaubt ist
  (ab der dritten Karte oder wenn das Guthaben nicht reicht). Jetzt steht das dabei. Bei 10 und 11 gegen 10 oder Ass erklärt er,
  warum man hier nicht verdoppelt (keine Hole Card). Den Merksatz für 8er und Asse („immer teilen“) gab es falsch, er ist korrigiert.
  Prüfung: `test/verdoppeln.mjs`.
- **Tutorial mit Professor Uhu** (Lobby → 🦉 Tutorial): 7 Lektionen (Regeln, Züge, Basisstrategie, Hi-Lo, True Count, Einsatz und
  Abweichungen, die App), jede mit Quiz. Beim ersten Abschluss 20 XP plus 10 XP pro richtiger Antwort, für alle Lektionen den Erfolg
  „Musterschüler“. Neue Spieler begrüßt Uhu nach der Charakterwahl und bietet das Tutorial an.
- **Musik** (`js/musik.js`), komplett im Browser erzeugt: Hinterzimmer Blues, Kellerclub Cool Jazz, Grand Casino Swing, Lounge Bossa Nova,
  Penthouse Deep House. Eigene Lautstärke in den Optionen („Musik“, Standard 40 %). Ist die App im Hintergrund, ist alles still.
  Pegel prüfen: `test/musik.html` in Chrome öffnen (rendert jeden Stil offline und misst Spitze und RMS).
