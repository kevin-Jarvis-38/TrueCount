// TrueCount – Tutorial mit Professor Uhu: sieben kurze Lektionen von den Regeln bis zum True Count.
// Jede Lektion besteht aus ein paar Sprechblasen und endet mit einem kleinen Quiz. Beim ersten Abschluss gibt es XP.
import * as pr from './profil.js';
import { sound } from './sound.js';
import { karteSvg } from './szene.js';
import { figurBild, LEHRER } from './figuren.js';
import { $, toast, uhu, uhuOffen } from './ui.js';

// Karten als kleine Bilder, z. B. karten('A♠', 'K♥'). marke = mit Zählwert (+1 / 0 / −1)
let kid = 0;
const karten = (...rs) => kartenBild(rs, false), zaehlKarten = (...rs) => kartenBild(rs, true);
const kartenBild = (rs, marke) => `<span class="tut-karten">${rs.map(x => `<svg viewBox="-24 -32 48 64">${karteSvg({ r: x.slice(0, -1), s: x.slice(-1), id: kid++ }, 0, 0, 1, 0, marke)}</svg>`).join('')}</span>`;

// schritte: [Überschrift, Absatz, Absatz …] · quiz: [Frage, [richtige Antwort, falsche …], Erklärung]
const LEKTIONEN = [
  {
    id: 'regeln', emoji: '🃏', titel: 'Blackjack in 2 Minuten', kurz: 'Ziel, Kartenwerte, Blackjack und was der Dealer tun muss',
    schritte: [
      ['Hallo, ich bin Professor Uhu!', 'Ich bringe dir in ein paar kurzen Lektionen alles bei, was du zum Kartenzählen brauchst: erst die Regeln, dann die Strategie, dann das Zählen.',
        'Nach jeder Lektion stelle ich dir ein paar Fragen. Beim ersten Mal gibt es dafür <b>XP</b>.'],
      ['Das Ziel', 'Du spielst <b>gegen den Dealer</b>, nicht gegen die anderen am Tisch. Wer näher an <b>21</b> ist, gewinnt.',
        'Kommst du über 21, hast du dich <b>überkauft</b> und verlierst sofort. Auch dann, wenn sich der Dealer danach ebenfalls überkauft. Das ist der Vorteil des Casinos.'],
      ['Was die Karten wert sind', karten('2♣', '7♥', '9♠'), 'Die Karten 2 bis 9 zählen ihre Zahl.',
        karten('10♦', 'B♠', 'D♥', 'K♣'), '10, Bube, Dame und König zählen alle <b>10</b>.',
        karten('A♠'), 'Das Ass zählt <b>11 oder 1</b>, je nachdem, was besser für dich ist.'],
      ['Blackjack!', karten('A♥', 'K♠'), 'Ein Ass und eine 10er-Karte als <b>erste zwei Karten</b> sind ein Blackjack. Der zahlt <b>3 zu 2</b>: Bei 10 € Einsatz gewinnst du 15 €.'],
      ['Der Dealer hat keine Wahl', 'Der Dealer muss bis 16 eine Karte ziehen und ab 17 stehen bleiben. Er entscheidet nichts selbst.',
        'Am Anfang bekommt er nur <b>eine offene Karte</b>. Seine zweite Karte zieht er erst, wenn alle Spieler fertig sind. Deshalb kann er vorher nicht nach Blackjack schauen.'],
      ['Soft und hart', karten('A♦', '6♣'), 'Zählt dein Ass gerade als 11, heißt die Hand <b>soft</b>: Ass und 6 sind „Soft 17“. Mit der nächsten Karte kannst du dich nicht überkaufen, das Ass zählt dann einfach als 1.',
        'Ohne Ass (oder wenn das Ass als 1 zählen muss) ist die Hand <b>hart</b>.'],
    ],
    quiz: [
      ['Du hast einen König und eine 7. Wie viel ist das?', ['17', '16', '27'], 'Bilder zählen 10, also 10 + 7 = 17.'],
      ['Du hast dich mit 23 überkauft. Danach überkauft sich auch der Dealer. Was passiert?', ['Du verlierst trotzdem', 'Unentschieden', 'Du gewinnst'], 'Wer sich überkauft, verliert sofort – egal, was der Dealer danach macht.'],
      ['Ass und 6 – wie nennt man diese Hand?', ['Soft 17', 'Hart 17', 'Blackjack'], 'Das Ass zählt gerade als 11, deshalb „soft“.'],
      ['Du setzt 10 € und bekommst einen Blackjack. Wie viel gewinnst du?', ['15 €', '10 €', '20 €'], 'Blackjack zahlt 3 zu 2: anderthalbmal den Einsatz.'],
    ],
  },
  {
    id: 'zuege', emoji: '🎮', titel: 'Deine Züge', kurz: 'Karte, Bleiben, Verdoppeln, Teilen, Aufgeben, Versicherung',
    schritte: [
      ['Karte und Bleiben', '<b>Karte</b> (Hit): Du bekommst noch eine Karte. Das darfst du so oft, wie du willst.', '<b>Bleiben</b> (Stand): Du bist zufrieden, der Nächste ist dran.'],
      ['Verdoppeln', 'Du legst noch einmal <b>denselben Einsatz</b> dazu und bekommst <b>genau eine</b> Karte, dann ist die Hand fertig.',
        'Das geht nur mit den <b>ersten zwei Karten</b> und nur, wenn dein Guthaben reicht. Ideal ist es mit 9, 10 oder 11, denn mit einer 10 dazu hast du dann 19, 20 oder 21.'],
      ['Teilen', karten('8♠', '8♥'), 'Hast du ein Paar, kannst du es <b>teilen</b>: Aus einer Hand werden zwei, jede mit dem gleichen Einsatz. Jede Hand bekommt eine neue zweite Karte.',
        'Geteilte Asse bekommen nur noch je eine Karte. Nach dem Teilen darfst du verdoppeln.'],
      ['Aufgeben', '<b>Aufgeben</b> (Surrender): Die Hand ist sofort vorbei und du bekommst den <b>halben Einsatz</b> zurück. Das geht nur als allererster Zug.',
        'Klingt feige, ist aber bei ganz schlechten Händen (16 gegen eine 10) die beste Wahl.'],
      ['Versicherung', 'Zeigt der Dealer ein <b>Ass</b>, bietet er dir eine Versicherung gegen seinen Blackjack an. Sie kostet den halben Einsatz und zahlt 2 zu 1.',
        'Meistens ist sie ein schlechtes Geschäft. Erst wenn du zählst, weißt du, wann sie sich lohnt – dazu später mehr.'],
    ],
    quiz: [
      ['Wann darfst du verdoppeln?', ['Nur mit den ersten zwei Karten', 'Jederzeit', 'Nur mit einem Paar'], 'Verdoppeln geht nur ganz am Anfang der Hand, mit zwei Karten.'],
      ['Was bekommst du beim Aufgeben zurück?', ['Den halben Einsatz', 'Den ganzen Einsatz', 'Nichts'], 'Aufgeben kostet die Hälfte, die andere Hälfte bekommst du zurück.'],
      ['Du hast 8 und 8. Welcher Zug macht daraus zwei Hände?', ['Teilen', 'Verdoppeln', 'Bleiben'], 'Ein Paar kann man teilen.'],
    ],
  },
  {
    id: 'strategie', emoji: '🧠', titel: 'Die Basisstrategie', kurz: 'Der beste Zug für jede Hand – die wichtigsten Regeln',
    schritte: [
      ['Es gibt immer einen besten Zug', 'Für jede Kombination aus deiner Hand und der offenen Karte des Dealers haben Mathematiker den besten Zug ausgerechnet. Das ist die <b>Basisstrategie</b>.',
        'Damit verlierst du auf Dauer nur etwa ein halbes Prozent deiner Einsätze. Besser geht es nur mit Zählen.'],
      ['Schwache und starke Dealer-Karten', 'Zeigt der Dealer <b>2 bis 6</b>, ist er <b>schwach</b>: Er muss ziehen und überkauft sich oft.',
        'Zeigt er <b>7 bis Ass</b>, ist er <b>stark</b>: Meistens landet er bei 17 bis 21.'],
      ['Steife Hände: 12 bis 16', 'Gegen <b>2 bis 6</b>: bleiben und den Dealer das Risiko tragen lassen.', 'Gegen <b>7 bis Ass</b>: Karte nehmen, sonst verlierst du fast sicher.',
        'Ausnahme: 12 gegen 2 oder 3 → Karte. Ab einer harten <b>17</b> bleibst du immer stehen, bis <b>8</b> nimmst du immer eine Karte.'],
      ['Wann du verdoppelst', '<b>11 und 10</b>: gegen 2 bis 9. <b>9</b>: gegen 3 bis 6.',
        'Gegen 10 und Ass verdoppelt man hier nicht, weil der Dealer nicht vorher nach Blackjack schaut. Hat er einen, wäre der doppelte Einsatz weg.',
        'Soft-Hände wie Ass + 6 verdoppelst du gegen schwache Karten (meist 3 bis 6).'],
      ['Soft-Hände und Paare', '<b>Soft 17 und weniger</b>: nie stehen bleiben. <b>Soft 19 und mehr</b>: immer stehen bleiben. Soft 18 kommt auf den Dealer an.',
        '<b>Asse und 8er</b> teilst du fast immer (hier nicht gegen 10 und Ass). <b>Zehner und 5er</b> teilst du nie.',
        'Keine Sorge, das musst du nicht auswendig können: Der Lehrer am Tisch und der Strategie-Drill im Training üben es mit dir.'],
    ],
    quiz: [
      ['Du hast 16, der Dealer zeigt eine 5.', ['Bleiben', 'Karte', 'Aufgeben'], 'Die 5 ist schwach: Bleib stehen und lass den Dealer sich überkaufen.'],
      ['Du hast 11, der Dealer zeigt eine 6.', ['Verdoppeln', 'Karte', 'Bleiben'], '11 gegen eine schwache Karte ist die beste Verdoppel-Hand.'],
      ['Du hast 12, der Dealer zeigt eine 2.', ['Karte', 'Bleiben'], 'Die Ausnahme: 12 gegen 2 oder 3 nimmt eine Karte.'],
      ['Du hast Soft 18 (Ass + 7), der Dealer zeigt eine 9.', ['Karte', 'Bleiben', 'Verdoppeln'], 'Gegen 9, 10 und Ass reicht Soft 18 nicht. Mit dem Ass kannst du dich nicht überkaufen.'],
    ],
  },
  {
    id: 'hilo', emoji: '🔢', titel: 'Kartenzählen mit Hi-Lo', kurz: 'Welche Karte wie zählt und was der laufende Count ist',
    schritte: [
      ['Warum Zählen hilft', 'Sind noch <b>viele 10er und Asse</b> im Schuh, bist du im Vorteil: Es gibt mehr Blackjacks (die zahlen 3 zu 2), Verdoppeln klappt öfter und der Dealer überkauft sich öfter, weil er ziehen muss.',
        'Sind noch <b>viele kleine Karten</b> drin, ist das Casino im Vorteil.'],
      ['Die Hi-Lo-Werte', zaehlKarten('2♣', '4♥', '6♠'), '<b>2 bis 6</b> zählen <b>+1</b>: Eine kleine Karte ist weg, gut für dich.',
        zaehlKarten('7♦', '8♣', '9♥'), '<b>7 bis 9</b> zählen <b>0</b>.', zaehlKarten('10♠', 'K♥', 'A♣'), '<b>10, Bilder und Asse</b> zählen <b>−1</b>: Eine gute Karte ist weg.'],
      ['Der laufende Count', 'Bei einem neuen Schuh startest du bei <b>0</b>. Dann zählst du <b>jede Karte</b>, die du siehst – auch die der anderen Spieler und des Dealers.',
        zaehlKarten('5♥', 'K♣', '3♠', '9♦', 'A♥', '2♣'), '+1 −1 +1 0 −1 +1 = <b>+1</b>. Das ist der <b>laufende Count</b>.'],
      ['Zwei Profi-Tricks', '<b>Paare heben sich auf</b>: Eine kleine und eine große Karte zusammen sind 0. Zähl deshalb lieber in Paaren als jede Karte einzeln.',
        'Ein ganzes Deck geht genau auf <b>0</b> auf: 20 Karten zählen +1, 20 zählen −1. Genau das übst du im Training beim Deck-Countdown.'],
    ],
    quiz: [
      ['Wie zählt eine Dame?', ['−1', '0', '+1'], 'Bilder zählen −1.'],
      ['Wie zählt eine 8?', ['0', '+1', '−1'], '7, 8 und 9 zählen 0.'],
      [`Laufender Count bei diesen Karten?${zaehlKarten('4♠', '6♥', 'K♦', '2♣', '9♠')}`, ['+2', '+3', '+1'], '+1 +1 −1 +1 0 = +2'],
      ['Ein hoher laufender Count heißt …', ['Viele hohe Karten sind noch im Schuh', 'Viele kleine Karten sind noch im Schuh'], 'Es sind viele kleine Karten raus, also stecken die großen noch im Schuh.'],
    ],
  },
  {
    id: 'truecount', emoji: '➗', titel: 'Der True Count', kurz: 'Laufender Count geteilt durch die restlichen Decks',
    schritte: [
      ['Warum teilen?', 'Ein laufender Count von +6 ist bei <b>noch 6 Decks</b> im Schuh nicht viel: Die hohen Karten verteilen sich auf viele Karten.',
        'Bei <b>noch einem Deck</b> ist +6 riesig. Deshalb rechnet man den Count auf ein Deck um.'],
      ['So geht der True Count', '<b>True Count = laufender Count ÷ Decks, die noch im Schuh sind</b>', 'Beispiel: laufender Count +6, noch 3 Decks → 6 ÷ 3 = <b>+2</b>.',
        'Nachkommastellen schneiden wir einfach ab: +2,7 wird +2 und −1,5 wird −1.'],
      ['Wie viele Decks sind noch drin?', 'Schau auf die <b>Ablage</b> neben dem Dealer, dort liegen die gespielten Karten. Hatte der Schuh 6 Decks und liegen etwa 2 in der Ablage, sind noch etwa <b>4</b> im Schuh.',
        'An Tisch 1 bis 3 steht die Zahl am Schuh. Ab Tisch 4 musst du schätzen.'],
      ['Am Tisch', 'Vor dem Setzen fragt dich der Dealer ab und zu nach dem True Count. Richtige Antworten bringen viele XP, und deine Trefferquote entscheidet, ob du an Tisch 4 und 5 darfst.'],
    ],
    quiz: [
      ['Laufender Count +8, noch 4 Decks. True Count?', ['+2', '+4', '+8'], '8 ÷ 4 = 2'],
      ['Laufender Count −6, noch 2 Decks. True Count?', ['−3', '−2', '−12'], '−6 ÷ 2 = −3'],
      ['Der Schuh hatte 6 Decks, in der Ablage liegen etwa 4. Wie viele sind noch im Schuh?', ['2', '4', '6'], '6 − 4 = 2'],
    ],
  },
  {
    id: 'vorteil', emoji: '💰', titel: 'Mit dem Count gewinnen', kurz: 'Einsatz anpassen, Versicherung und Abweichungen',
    schritte: [
      ['Der Einsatz macht das Geld', 'Der Count nützt dir nur, wenn du <b>bei hohem True Count mehr setzt</b>. Eine Einheit sind 2 Mindesteinsätze.',
        'True Count +1 oder weniger: <b>1 Einheit</b>. +2: <b>2</b>. +3: <b>4</b>. +4: <b>6</b>. Ab +5: <b>8 Einheiten</b>.'],
      ['Versicherung', 'Die Versicherung lohnt sich erst ab <b>True Count +3</b>. Dann sind so viele 10er im Schuh, dass der Dealer oft Blackjack hat. Vorher: immer ablehnen.'],
      ['Abweichungen', 'Bei bestimmten Counts spielt man anders als die Basisstrategie. Die wichtigsten:',
        '<b>11 gegen 10 oder Ass</b>: ab +3 verdoppeln. <b>10 gegen 10 oder Ass</b>: ab +4 verdoppeln. <b>9 gegen 2</b>: ab +1 verdoppeln.',
        '<b>12 gegen 3</b>: ab +2 bleiben. <b>12 gegen 2</b>: ab +3 bleiben. <b>Zehner gegen 6</b>: ab +4 teilen.',
        'An Tisch 1 bis 3 sagt dir der Lehrer, wann eine Abweichung dran ist.'],
      ['Aufstehen', 'Ist der Count schlecht (True Count −1 oder weniger), darfst du einfach <b>aufstehen</b>. Profis machen das auch.',
        'Beim Aufstehen kommen die XP aus deinem <b>Pott</b> auf dein Konto. Gehst du vorher pleite, ist der Pott weg.'],
    ],
    quiz: [
      ['True Count +4. Wie setzt du?', ['Deutlich mehr als sonst', 'Wie immer', 'Weniger als sonst'], 'Bei +4 sind es 6 Einheiten – jetzt bist du im Vorteil.'],
      ['Der Dealer zeigt ein Ass, True Count +1. Nimmst du die Versicherung?', ['Nein', 'Ja'], 'Erst ab True Count +3.'],
      ['11 gegen eine 10 bei True Count +3?', ['Verdoppeln', 'Karte', 'Bleiben'], 'Das ist eine der wichtigsten Abweichungen.'],
    ],
  },
  {
    id: 'app', emoji: '🎰', titel: 'So funktioniert TrueCount', kurz: 'Tische, Hilfen, XP, Pott und Training',
    schritte: [
      ['Fünf Tische', 'Vom Hinterzimmer bis ins Penthouse: Je höher der Tisch, desto mehr Decks, desto schneller der Dealer, desto mehr XP.',
        'Neue Tische schaltest du mit Guthaben und Level frei, für Tisch 4 und 5 brauchst du außerdem eine gute Trefferquote bei den Count-Fragen.'],
      ['Hilfen am Anfang', 'An <b>Tisch 1 und 2</b> stehen die Zählwerte auf den Karten. Bis <b>Tisch 3</b> zeigt dir der Lehrer falsche Züge und die Deck-Anzeige die restlichen Decks.',
        'An <b>Tisch 1</b> kannst du mich jederzeit mit dem blauen <b>i</b> rufen. Danach zählst du allein.'],
      ['XP, Pott und Serie', 'Am Tisch sammelst du XP im <b>Pott</b>. Erst beim <b>Aufstehen</b> kommen sie aufs Konto. Gewinnst du eine Sitzung, steigt deine Serie und damit der Bonus.',
        'Mit Level und Erfolgen schaltest du Tische frei, im Shop kaufst du Outfits für deine Figur.'],
      ['Training', 'Im Training übst du ohne Geld: Zählwert-Tippen, Blitz-Zählen, Deck-Countdown, True Count rechnen und den Strategie-Drill.',
        'Das war\'s von mir. Viel Erfolg am Tisch! 🦉'],
    ],
    quiz: [
      ['Wann kommen die XP aus dem Pott auf dein Konto?', ['Beim Aufstehen', 'Sofort nach jeder Hand', 'Am Ende des Tages'], 'Erst beim Aufstehen. Wer pleite geht, verliert den Pott.'],
      ['An welchem Tisch kannst du Professor Uhu mit dem i rufen?', ['Tisch 1', 'An allen Tischen', 'Tisch 5'], 'Nur im Hinterzimmer. Danach musst du es allein können.'],
    ],
  },
];
export const LEKTIONEN_ANZAHL = LEKTIONEN.length;
const XP_LEKTION = 20, XP_FRAGE = 10; // beim ersten Abschluss

let L = null; // laufende Lektion: { n, s (Schritt), q (Frage), richtig, antwort, reihenfolge }
const fertig = id => pr.P.tutorial.includes(id);

export function tutorialMenue() {
  L = null;
  const n = LEKTIONEN.filter(l => fertig(l.id)).length;
  $('#tr').innerHTML = `<header class="kopf"><button class="btn aux zurueck" data-l="lobby">← Lobby</button><h1>Tutorial</h1></header>`
    + `<div class="pn tut-kopf">${figurBild(LEHRER)}<p><b>${LEHRER.name}</b>${n === 0 ? 'Fang am besten oben an. Jede Lektion dauert nur ein, zwei Minuten.'
      : n < LEKTIONEN.length ? `${n} von ${LEKTIONEN.length} Lektionen geschafft. Weiter so!` : 'Alle Lektionen geschafft – du bist mein Musterschüler! Wiederholen kannst du sie jederzeit.'}</p></div>`
    + `<div class="tr-liste">${LEKTIONEN.map((l, i) => `<button class="pn tr-wahl" data-tut="start" data-n="${i}"><span>${fertig(l.id) ? '✅' : l.emoji}</span>`
      + `<div><b>${i + 1}. ${l.titel}</b><small>${l.kurz}${fertig(l.id) ? '' : ` · bis zu ${XP_LEKTION + XP_FRAGE * l.quiz.length} XP`}</small></div></button>`).join('')}</div>`;
}

// Ein Schritt der Lektion in Uhus Sprechblase
const nav = (zurueck, weiter, text) => `<div class="row zwei">${zurueck ? '<button class="btn aux" data-tut="zurueck">‹ Zurück</button>' : '<span></span>'}`
  + `<button class="btn hit" data-tut="${weiter}">${text}</button></div>`;
function schritt() {
  const l = LEKTIONEN[L.n], [titel, ...absaetze] = l.schritte[L.s], letzter = L.s === l.schritte.length - 1;
  uhu(titel, absaetze, { knoepfe: nav(L.s > 0, 'weiter', letzter ? 'Zum Quiz ›' : 'Weiter ›'), still: uhuOffen(), zu: tutorialMenue });
}
// Eine Quizfrage. Die Antworten stehen jedes Mal in anderer Reihenfolge.
function frage() {
  const l = LEKTIONEN[L.n], [f, antworten, warum] = l.quiz[L.q], beantwortet = L.antwort !== null;
  if (!beantwortet) L.reihenfolge = antworten.map((_, i) => i).sort(() => Math.random() - .5);
  const knoepfe = `<div class="tut-antworten">${L.reihenfolge.map(i => `<button class="btn ${!beantwortet ? 'aux' : i === 0 ? 'hit' : i === L.antwort ? 'stand' : 'aux aus'}" data-tut="antwort" data-n="${i}" ${beantwortet ? 'disabled' : ''}>${antworten[i]}</button>`).join('')}</div>`
    + (beantwortet ? `<button class="btn hit voll" data-tut="naechste">${L.q === l.quiz.length - 1 ? 'Fertig ›' : 'Nächste Frage ›'}</button>` : '');
  const text = [f];
  if (beantwortet) text.push(`${L.antwort === 0 ? '✅ <b>Richtig!</b>' : `❌ <b>Leider nicht.</b> Richtig ist: <b>${antworten[0]}</b>.`} ${warum}`);
  uhu(`Frage ${L.q + 1} von ${l.quiz.length}`, text, { knoepfe, still: true, zu: tutorialMenue });
}
function geschafft() {
  const l = LEKTIONEN[L.n], neu = !fertig(l.id), xp = neu ? XP_LEKTION + XP_FRAGE * L.richtig : 0;
  if (neu) { pr.P.tutorial.push(l.id); pr.xpKonto(xp); if (LEKTIONEN.every(x => fertig(x.id))) pr.erfolg('musterschueler'); pr.speichern(); }
  sound.erfolg();
  const weiter = L.n < LEKTIONEN.length - 1;
  uhu(`${l.emoji} Lektion geschafft!`, [`Du hast <b>${L.richtig} von ${l.quiz.length}</b> Fragen richtig beantwortet.${xp ? ` Dafür gibt es <b>+${xp} XP</b>.` : ''}`,
    L.richtig < l.quiz.length ? 'Schau dir die Lektion ruhig noch einmal an, wenn etwas unklar war.' : 'Perfekt, alles richtig!'],
  { knoepfe: `<div class="row zwei"><button class="btn aux" data-uhu="zu">Übersicht</button>${weiter ? `<button class="btn hit" data-tut="start" data-n="${L.n + 1}">Nächste Lektion ›</button>` : '<button class="btn hit" data-l="lobby">Zur Lobby</button>'}</div>`,
    still: true, zu: tutorialMenue });
  while (pr.meldungen.length) { const m = pr.meldungen.shift(); toast(`${m.emoji} ${m.text}`, { ton: m.art === 'level' ? 'level' : null }); }
}

export function tutorialKlick(d) {
  const a = d.tut;
  if (a === 'start') { L = { n: +d.n, s: 0, q: 0, richtig: 0, antwort: null }; return schritt(); }
  if (!L) return;
  const l = LEKTIONEN[L.n];
  if (a === 'zurueck') { L.s = Math.max(0, L.s - 1); return schritt(); }
  if (a === 'weiter') {
    if (L.s < l.schritte.length - 1) { L.s++; return schritt(); }
    L.q = 0; L.antwort = null; return frage();
  }
  if (a === 'antwort' && L.antwort === null) {
    L.antwort = +d.n;
    if (L.antwort === 0) { L.richtig++; sound.richtig(); } else sound.falsch();
    return frage();
  }
  if (a === 'naechste') {
    if (L.q < l.quiz.length - 1) { L.q++; L.antwort = null; return frage(); }
    return geschafft();
  }
}
