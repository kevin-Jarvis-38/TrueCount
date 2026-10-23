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

// m: welche Züge gerade erlaubt sind ({ verdoppeln, teilen, aufgeben })
export function basisZug(karten, up, m) {
  const sp = punkte(up.r) - 2;
  if (m.teilen && PAARE[punkte(karten[0].r)]?.[sp] === 'P') return 'P';
  const { summe, soft } = wert(karten);
  let z = soft ? (SOFT[summe]?.[sp] ?? (summe >= 19 ? 'S' : 'H'))
    : summe >= 17 ? 'S' : summe <= 8 ? 'H' : HART[summe][sp];
  if (z === 'd') z = m.verdoppeln ? 'D' : 'S';
  if (z === 'D' && !m.verdoppeln) z = 'H';
  if (z === 'R' && !m.aufgeben) z = 'H';
  return z;
}
