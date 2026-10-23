// TrueCount – Basisstrategie für die Regeln der App: keine Hole Card, Dealer steht auf Soft 17,
// Verdoppeln nach Split, Surrender. Ergebnis: H Karte, S Bleiben, D Verdoppeln, P Teilen, R Aufgeben.
// d = verdoppeln, sonst bleiben. Spalten: Dealer zeigt 2 3 4 5 6 7 8 9 10 A.
import { punkte, wert } from './karten.js';

const tab = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v.split(' ')]));

const HART = tab({
  9: 'H D D D D H H H H H',
  10: 'D D D D D D D D H H',
  11: 'D D D D D D D D H H', // ohne Hole Card nicht gegen 10 und Ass verdoppeln
  12: 'H H S S S H H H H H',
  13: 'S S S S S H H H H H',
  14: 'S S S S S H H H H H',
  15: 'S S S S S H H H R H',
  16: 'S S S S S H H R R R',
});
const SOFT = tab({
  13: 'H H H D D H H H H H',
  14: 'H H H D D H H H H H',
  15: 'H H D D D H H H H H',
  16: 'H H D D D H H H H H',
  17: 'H D D D D H H H H H',
  18: 'S d d d d S S H H H',
});
// Nur wann geteilt wird. Sonst gilt die Tabelle für die Summe.
const PAARE = tab({
  2: 'P P P P P P H H H H',
  3: 'P P P P P P H H H H',
  4: 'H H H P P H H H H H',
  6: 'P P P P P H H H H H',
  7: 'P P P P P P H H H H',
  8: 'P P P P P P P P H H', // ohne Hole Card 8er nicht gegen 10 und Ass teilen
  9: 'P P P P P S P P S S',
  11: 'P P P P P P P P P H',
});

// Abweichungen nach dem True Count (die wichtigsten aus den „Illustrious 18“ und den „Fab 4“).
// s = harte Summe, paar = Wert des Paars, up = Dealer-Karte (Ass = 11), ab/bis = ab welchem True Count, z = Zug
const ABWEICHUNGEN = [
  { s: 14, up: 10, ab: 3, z: 'R' }, { s: 15, up: 9, ab: 2, z: 'R' }, { s: 15, up: 11, ab: 1, z: 'R' },
  { s: 16, up: 10, ab: 0, z: 'S' }, { s: 15, up: 10, ab: 4, z: 'S' }, { s: 16, up: 9, ab: 5, z: 'S' },
  { paar: 10, up: 5, ab: 5, z: 'P' }, { paar: 10, up: 6, ab: 4, z: 'P' },
  { s: 10, up: 10, ab: 4, z: 'D' }, { s: 10, up: 11, ab: 4, z: 'D' }, { s: 11, up: 10, ab: 3, z: 'D' }, { s: 11, up: 11, ab: 3, z: 'D' },
  { s: 12, up: 3, ab: 2, z: 'S' }, { s: 12, up: 2, ab: 3, z: 'S' },
  { s: 9, up: 2, ab: 1, z: 'D' }, { s: 9, up: 7, ab: 3, z: 'D' },
  { s: 13, up: 2, bis: -1, z: 'H' }, { s: 13, up: 3, bis: -2, z: 'H' },
  { s: 12, up: 4, bis: -1, z: 'H' }, { s: 12, up: 5, bis: -2, z: 'H' }, { s: 12, up: 6, bis: -1, z: 'H' },
];
const NAME = { H: 'Karte', S: 'Bleiben', D: 'Verdoppeln', P: 'Teilen', R: 'Aufgeben' };
export const zugName = z => NAME[z];
const tcText = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
const upText = n => n === 11 ? 'ein Ass' : `eine ${n}`;

// Der Lehrer: bester Zug mit Basisstrategie und Abweichungen nach dem True Count, dazu eine kurze Erklärung
export function lehrerZug(karten, up, m, tc) {
  const basis = basisZug(karten, up, m), u = punkte(up.r), { summe, soft } = wert(karten);
  const paar = karten.length === 2 && punkte(karten[0].r) === punkte(karten[1].r) ? punkte(karten[0].r) : 0;
  const erlaubt = z => z === 'H' || z === 'S' || (z === 'D' && m.verdoppeln) || (z === 'P' && m.teilen) || (z === 'R' && m.aufgeben);
  if (!soft) for (const a of ABWEICHUNGEN) {
    if (a.up !== u || (a.paar ? a.paar !== paar || !m.teilen : a.s !== summe || (paar && m.teilen && basis === 'P'))) continue;
    if (a.ab !== undefined ? tc < a.ab : tc > a.bis) continue;
    if (!erlaubt(a.z) || a.z === basis || (basis === 'R' && a.z !== 'R')) continue;
    const grenze = a.ab !== undefined ? `ab True Count ${tcText(a.ab)}` : `bei True Count ${tcText(a.bis)} und weniger`;
    return { zug: a.z, basis, grenze, abweichung: true, text: `Abweichung: ${paar && a.paar ? `${paar}er-Paar` : summe} gegen ${upText(u)} – ${grenze} heißt es <b>${NAME[a.z]}</b> statt ${NAME[basis]}.` };
  }
  const ohne = ohneVerdoppeln(karten, up, m, basis);
  return { zug: basis, basis, abweichung: false, ohne, text: erklaerung(basis, summe, soft, paar, u) + (ohne ? ` ${ohne}` : '') };
}

// Wäre Verdoppeln richtig, ist aber gerade nicht erlaubt? Dann sagt der Lehrer das dazu, sonst wirkt es, als hätte er es vergessen.
function ohneVerdoppeln(karten, up, m, z) {
  if (m.verdoppeln || z === 'D' || basisZug(karten, up, { ...m, verdoppeln: true }) !== 'D') return '';
  return karten.length > 2 ? 'Eigentlich wäre das eine Verdoppel-Hand, aber verdoppeln darfst du nur mit den ersten zwei Karten.'
    : 'Eigentlich wäre hier Verdoppeln richtig, aber dafür reicht dein Guthaben nicht.';
}

// ---------- Ausführliche Erklärung für Professor Uhu ----------
// So oft überkauft sich der Dealer mit dieser offenen Karte (ohne Hole Card, steht auf Soft 17), gerundet in Prozent
const DEALER_BUST = { 2: 35, 3: 38, 4: 40, 5: 43, 6: 42, 7: 26, 8: 24, 9: 23, 10: 21, 11: 17 };
// So oft geht eine harte Summe mit der nächsten Karte über 21 (Ass zählt dann 1, 10/B/D/K sind 4 von 13 Kartenarten)
const risiko = s => s <= 11 ? 0 : Math.round((Math.max(0, 9 - (21 - s)) + 4) / 13 * 100);
const upName = u => u === 11 ? 'ein Ass' : u === 10 ? 'eine 10 (oder ein Bild)' : `eine ${u}`;
const PAAR_MERK = {
  2: '2er und 3er teilt man gegen 2 bis 7.', 3: '2er und 3er teilt man gegen 2 bis 7.', 4: '4er teilt man nur gegen 5 und 6.',
  5: '5er teilt man nie. Spiel sie wie eine 10.', 8: '8er teilt man gegen 2 bis 9. Gegen 10 und Ass nicht, weil der Dealer hier nicht vorher nach Blackjack schaut.',
  11: 'Asse teilt man immer, nur nicht gegen ein Ass (der Dealer schaut hier nicht vorher nach Blackjack).', 6: '6er teilt man gegen 2 bis 6.', 7: '7er teilt man gegen 2 bis 7.',
  9: '9er teilt man gegen 2 bis 9, außer gegen 7 (da reichen deine 18).', 10: 'Zehner teilt man (fast) nie, 20 ist eine super Hand.',
};
const paarName = p => p === 11 ? 'Asse' : p === 10 ? 'Zehner' : `${p}er`;

export function lehrerAusfuehrlich(karten, up, m, tc) {
  const rat = lehrerZug(karten, up, m, tc), z = rat.zug, u = punkte(up.r), { summe: s, soft } = wert(karten);
  const paar = karten.length === 2 && punkte(karten[0].r) === punkte(karten[1].r) ? punkte(karten[0].r) : 0;
  const schwach = u <= 6, b = DEALER_BUST[u], r = risiko(s), gegen = upName(u);
  const hand = paar && m.teilen ? `ein Paar ${paarName(paar)} (zusammen ${soft ? `Soft ${s}` : s})` : soft ? `Soft ${s}` : `${s}`;
  const a = [`Du hast <b>${hand}</b>, der Dealer zeigt <b>${gegen}</b>.`];
  a.push(`Mit ${u === 11 ? 'einem Ass' : u === 10 ? 'einer 10 (oder einem Bild)' : `einer ${u}`} überkauft sich der Dealer in etwa <b>${b} %</b> der Fälle. `
    + (schwach ? 'Das ist eine <b>schwache</b> Karte: Er muss bis 17 ziehen, und von 2 bis 6 aus geht das oft schief.'
      : u <= 8 ? 'Das ist eine <b>mittlere</b> Karte: Rechne damit, dass er bei 17 oder 18 landet.'
      : 'Das ist eine <b>starke</b> Karte: Meistens kommt er auf 19, 20 oder 21.')
    + ' Faustregel: Die nächste Karte ist oft eine 10, denn 10, Bube, Dame und König zählen alle 10.');
  if (soft) a.push('„Soft“ heißt: Dein Ass zählt gerade als 11. Würdest du über 21 kommen, zählt es einfach als 1. Mit einer Karte kannst du dich also <b>nicht überkaufen</b>.');
  else if (s <= 11) a.push(`Mit ${s} kannst du dich mit einer Karte <b>nicht überkaufen</b>.${s >= 9 ? ` Kommt eine 10, hast du ${s + 10}.` : ''}`);
  else if (s < 21) a.push(`Nimmst du eine Karte, überkaufst du dich mit etwa <b>${r} %</b>: Jede Karte ab ${22 - s} ist zu viel.`);

  const warum = {
    H: soft ? 'Ziehen kostet dich nichts, schlimmstenfalls zählt das Ass als 1. Stehen bleiben wäre hier zu wenig.'
      : s <= 11 ? 'Du riskierst nichts und machst deine Hand besser.' + (s >= 10 && u >= 10 && !rat.ohne
        ? ` Verdoppeln würde man mit ${s} gern, aber nicht gegen ${gegen}: Hier schaut der Dealer nicht vorher nach Blackjack. Hat er einen, verlierst du auch den verdoppelten Einsatz.` : '')
      : `Bleibst du stehen, gewinnst du nur, wenn sich der Dealer überkauft. Das passiert hier nur in etwa ${b} % der Fälle. Das Risiko beim Ziehen ist kleiner als die fast sichere Niederlage.`,
    S: s >= 17 && !soft ? `${s} ist eine fertige Hand. Mit einer weiteren Karte würdest du dich zu ${r} % überkaufen.`
      : soft ? `Soft ${s} ist eine gute Hand. Gegen ${gegen} reicht das.`
      : `Lass den Dealer das Risiko tragen: Er muss ziehen und überkauft sich oft. Du würdest dich dagegen mit ${r} % selbst überkaufen.`,
    D: 'Verdoppeln heißt: Du legst noch einmal denselben Einsatz dazu und bekommst <b>genau eine</b> Karte. Das lohnt sich, wenn du mit einer Karte gute Chancen auf eine starke Hand hast. '
      + (s === 10 || s === 11 ? `Mit ${s} reicht schon eine 10 für ${s + 10}.` : schwach ? 'Dazu ist der Dealer schwach, dann gewinnst du doppelt.' : ''),
    P: 'Teilen heißt: Aus dem Paar werden zwei Hände, jede mit dem gleichen Einsatz. '
      + (paar === 11 ? 'Zwei Asse sind zusammen nur 12. Getrennt startet jede Hand mit einem Ass, und mit einer 10 dazu hast du 21.'
        : paar === 8 ? 'Zusammen sind es 16, die schlechteste Hand im Spiel. Getrennt startet jede Hand mit 8, daraus wird oft 18.'
        : schwach ? 'Der Dealer ist schwach, mit zwei Händen holst du doppelt so viel aus seiner Schwäche.' : `Zwei Hände mit je ${paar} sind besser als ${s} zusammen.`),
    R: `Aufgeben heißt: Die Hand ist sofort vorbei und du bekommst den <b>halben Einsatz</b> zurück. Das lohnt sich nur, wenn du sonst öfter als jedes zweite Mal verlierst, und genau das ist bei ${s} gegen ${gegen} so.`,
  }[z];
  a.push(`<b>Darum: ${NAME[z]}.</b> ${warum}`);
  if (rat.ohne) a.push(`✋ ${rat.ohne}`);
  if (rat.abweichung) a.push(`🧮 Hier macht der Count den Unterschied. Normalerweise wäre <b>${NAME[rat.basis]}</b> richtig. Bei True Count ${tcText(tc)} sind ${tc > 0 ? 'viele hohe Karten (10er und Asse)' : 'viele kleine Karten'} übrig, deshalb spielt man ${rat.grenze} <b>${NAME[z]}</b>.`);

  const merk = paar && m.teilen ? PAAR_MERK[paar]
    : z === 'R' ? 'Aufgeben nur mit 15 gegen 10 und mit 16 gegen 9, 10 oder Ass.'
    : soft ? 'Soft 17 und weniger: nie stehen bleiben. Soft 19 und mehr: immer stehen bleiben. Bei Soft 18 kommt es auf den Dealer an.'
    : s >= 17 ? 'Ab einer harten 17 bleibt man immer stehen.'
    : s >= 12 ? 'Steife Hand (12 bis 16): gegen 2 bis 6 bleiben, gegen 7 bis Ass ziehen. Ausnahme: 12 gegen 2 oder 3 → ziehen.'
    : s >= 9 ? '9, 10 und 11 sind Verdoppel-Hände, vor allem gegen schwache Dealer-Karten.'
    : 'Bis 8 nimmt man immer eine Karte.';
  a.push(`💡 <b>Merksatz:</b> ${merk}`);
  return { zug: z, absaetze: a };
}

function erklaerung(z, s, soft, paar, u) {
  const gegen = upText(u), schwach = u >= 2 && u <= 6;
  if (z === 'P') return paar === 11 ? 'Asse teilt man – jede Hand kann ein Treffer mit 21 werden.'
    : paar === 8 ? '8er teilt man – 16 ist die schlechteste Hand im Spiel.'
    : `${paar}er-Paar gegen ${gegen}: <b>Teilen</b> – ${schwach ? 'der Dealer ist schwach, zwei Hände bringen mehr.' : 'zwei Hände sind besser als die eine.'}`;
  if (z === 'R') return `${s} gegen ${gegen} verliert so oft, dass der halbe Einsatz zurück die bessere Wahl ist.`;
  if (z === 'D') return `${soft ? 'Soft ' : ''}${s} gegen ${gegen}: <b>Verdoppeln</b> – ${schwach ? 'der Dealer überkauft sich oft, hol mehr raus.' : 'gute Chance auf eine starke Hand.'}`;
  if (soft) return z === 'S' ? `Soft ${s} reicht gegen ${gegen} – <b>bleiben</b>.` : `Soft ${s} gegen ${gegen}: <b>Karte</b> – mit dem Ass kannst du nicht überkaufen.`;
  if (z === 'H' && s >= 10 && s <= 11 && u >= 10) return `${s} gegen ${gegen}: <b>Karte</b>, aber nicht verdoppeln – der Dealer schaut nicht vorher nach Blackjack. Hat er einen, wäre der doppelte Einsatz weg.`;
  if (z === 'H' && s <= 11) return `Mit ${s} kannst du nicht überkaufen – immer <b>Karte</b>.`;
  if (z === 'S' && s >= 17) return `${s} ist genug – <b>bleiben</b>.`;
  if (z === 'S') return `Der Dealer hat ${gegen} und überkauft sich oft. Mit ${s} <b>bleiben</b> und ihn das Risiko tragen lassen.`;
  return `Gegen ${gegen} reichen ${s} meist nicht – <b>Karte</b> nehmen.`;
}

// Versicherung lohnt sich erst ab True Count +3
export const versicherungRichtig = tc => tc >= 3;

// Einsatz nach dem Count: Einheit = 2 × Mindesteinsatz. Bis TC +1 eine Einheit, dann mehr.
export function einsatzEmpfehlung(tc, min, max) {
  const einheiten = tc <= 1 ? 1 : tc === 2 ? 2 : tc === 3 ? 4 : tc === 4 ? 6 : 8;
  return Math.min(max, einheiten * min * 2);
}
export function einsatzBewerten(einsatz, tc, min, max) {
  const empfohlen = einsatzEmpfehlung(tc, min, max);
  const ok = tc <= 1 ? einsatz <= min * 4 : einsatz >= empfohlen * .75;
  const text = ok ? (tc >= 2 ? `Stark! Bei True Count ${tcText(tc)} hoch setzen.` : 'Passt – bei niedrigem Count klein setzen.')
    : tc <= 1 ? `True Count ${tcText(tc)}: Der Schuh ist nicht gut für dich – klein setzen (etwa ${empfohlen} €).`
    : `True Count ${tcText(tc)}: Jetzt ist der Vorteil bei dir – mehr setzen (etwa ${empfohlen} €).`;
  return { ok, empfohlen, text };
}

// m: welche Züge gerade erlaubt sind ({ verdoppeln, teilen, aufgeben })
export function basisZug(karten, up, m) {
  const sp = punkte(up.r) - 2;
  const paar = karten.length === 2 && punkte(karten[0].r) === punkte(karten[1].r);
  if (m.teilen && paar && PAARE[punkte(karten[0].r)]?.[sp] === 'P') return 'P';
  const { summe, soft } = wert(karten);
  let z = soft ? (SOFT[summe]?.[sp] ?? (summe >= 19 ? 'S' : 'H'))
    : summe >= 17 ? 'S' : summe <= 8 ? 'H' : HART[summe][sp];
  if (z === 'd') z = m.verdoppeln ? 'D' : 'S';
  if (z === 'D' && !m.verdoppeln) z = 'H';
  if (z === 'R' && !m.aufgeben) z = 'H';
  return z;
}
