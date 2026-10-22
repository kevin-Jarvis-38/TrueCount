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
  Die Schnittkarte liegt einstellbar bei Standard 75 %.

## Zählen (das Herzstück)
- Hi-Lo: 2–6 zählen +1, 7–9 zählen 0, 10/B/D/K/A zählen −1.
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
| 4 Multi-Hand | höher | 25.000 + Level 20 + 80 % Count-Quote | 2–3 |
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

## Hinweise für die Entwicklung
- Bei jeder Änderung die CACHE-Nummer im Service Worker erhöhen und die Dateien mit `cache:'reload'` holen (Erfahrung aus Workie).
- Der Testserver läuft auf Port 8765, weil 8123 von Home Assistant belegt ist.
- Push aus Claude Code: `GIT_TERMINAL_PROMPT=1` und `GCM_INTERACTIVE=always`. Commit-Nachrichten mit `git commit -F`.
