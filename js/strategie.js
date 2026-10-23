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
    return { zug: a.z, abweichung: true, text: `Abweichung: ${paar && a.paar ? `${paar}er-Paar` : summe} gegen ${upText(u)} – ${grenze} heißt es <b>${NAME[a.z]}</b> statt ${NAME[basis]}.` };
  }
  return { zug: basis, abweichung: false, text: erklaerung(basis, summe, soft, paar, u) };
}

function erklaerung(z, s, soft, paar, u) {
  const gegen = upText(u), schwach = u >= 2 && u <= 6;
  if (z === 'P') return paar === 11 ? 'Asse teilt man – jede Hand kann ein Treffer mit 21 werden.'
    : paar === 8 ? '8er teilt man – 16 ist die schlechteste Hand im Spiel.'
    : `${paar}er-Paar gegen ${gegen}: <b>Teilen</b> – ${schwach ? 'der Dealer ist schwach, zwei Hände bringen mehr.' : 'zwei Hände sind besser als die eine.'}`;
  if (z === 'R') return `${s} gegen ${gegen} verliert so oft, dass der halbe Einsatz zurück die bessere Wahl ist.`;
  if (z === 'D') return `${soft ? 'Soft ' : ''}${s} gegen ${gegen}: <b>Verdoppeln</b> – ${schwach ? 'der Dealer überkauft sich oft, hol mehr raus.' : 'gute Chance auf eine starke Hand.'}`;
  if (soft) return z === 'S' ? `Soft ${s} reicht gegen ${gegen} – <b>bleiben</b>.` : `Soft ${s} gegen ${gegen}: <b>Karte</b> – mit dem Ass kannst du nicht überkaufen.`;
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
