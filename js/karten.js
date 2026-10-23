// TrueCount – Karten, Kartenwerte und der Schuh.
export const RAENGE = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'];
export const FARBEN = ['♠', '♥', '♦', '♣'];

// Punktwert einer Karte: Ass 11, Bilder 10
export const punkte = r => r === 'A' ? 11 : isNaN(r) ? 10 : +r;

// Zählwert nach Hi-Lo: 2–6 +1, 7–9 0, 10er und Ass −1
export const hiLo = r => punkte(r) <= 6 ? 1 : punkte(r) >= 10 ? -1 : 0;

// Wert einer Hand. soft = ein Ass zählt noch als 11.
export function wert(karten) {
  let summe = 0, asse = 0;
  for (const k of karten) { summe += punkte(k.r); if (k.r === 'A') asse++; }
  while (summe > 21 && asse) { summe -= 10; asse--; }
  return { summe, soft: asse > 0 };
}

// Zufall mit Startwert (mulberry32), damit später alle Mehrspieler-Geräte denselben Schuh mischen können
export function zufall(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Neuer gemischter Schuh. Jede Karte gibt es pro Deck genau einmal.
// schnitt = Anteil der Karten bis zur Schnittkarte, nr macht die Karten-IDs über alle Schuhe eindeutig.
export function neuerSchuh(decks, schnitt, rnd, nr) {
  const karten = [];
  for (let d = 0; d < decks; d++) for (const s of FARBEN) for (const r of RAENGE) karten.push({ r, s, id: nr * 1000 + karten.length });
  for (let i = karten.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [karten[i], karten[j]] = [karten[j], karten[i]];
  }
  return { karten, pos: 0, schnitt: Math.round(karten.length * schnitt) };
}
