// TrueCount – Spielstand: Geld, XP, Level, Pott, Serie, Erfolge und Freischaltungen.
// Der normale und der Admin-Spielstand liegen getrennt im localStorage, die Einstellungen gelten für beide.
import { TISCHE } from './tische.js';
import { OUTFITS, ACCESSOIRES } from './figuren.js';

export const ADMIN_PIN = '2121';
const KEY = { normal: 'truecount.v2', admin: 'truecount.admin' }, KEY_MODUS = 'truecount.modus', KEY_EINST = 'truecount.einstellungen';
const lesen = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const schreiben = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// ---------- Level ----------
// Gesamt-XP für ein Level. Grobe Planung: Tisch 2 (Level 5) nach 1–2 Abenden, Level 30 nach mehreren Monaten.
export const levelXp = l => Math.round(60 * Math.pow(l - 1, 2.1));
export function level(xp) { let l = 1; while (levelXp(l + 1) <= xp) l++; return l; }
export const titel = l => l >= 40 ? 'Legende' : l >= 30 ? 'High Roller' : l >= 20 ? 'Kartenhai' : l >= 10 ? 'Kartenzähler' : 'Frischling';
export const serienFaktor = s => Math.min(2, 1 + s * .1);
export function fortschritt(xp) { const l = level(xp), a = levelXp(l), b = levelXp(l + 1); return { level: l, titel: titel(l), anteil: (xp - a) / (b - a), fehlt: b - xp }; }

// ---------- Erfolge ----------
export const ERFOLGE = [
  ['erste_hand', '🃏', 'Erste Hand', 'Spiel deine erste Hand.', 25],
  ['haende_100', '💯', 'Stammgast', 'Spiel 100 Hände.', 50],
  ['haende_1000', '🏛️', 'Inventar', 'Spiel 1.000 Hände.', 200],
  ['haende_10000', '👑', 'Lebenswerk', 'Spiel 10.000 Hände.', 500],
  ['erster_bj', '⭐', 'Blackjack!', 'Bekomm deinen ersten Blackjack.', 25],
  ['bj_serie', '🔥', 'Blackjack-Serie', 'Zwei Blackjacks hintereinander.', 100],
  ['fuenf_karten', '🖐️', 'Fünf-Karten-Trick', 'Gewinn eine Hand mit 5 oder mehr Karten.', 50],
  ['verdoppler', '✌️', 'Doppelt hält besser', 'Gewinn 25 verdoppelte Hände.', 100],
  ['split_koenig', '✂️', 'Split-König', 'Teil auf 4 Hände und gewinn alle.', 300],
  ['all_in', '🎲', 'All-In', 'Setz alles auf eine Runde – und gewinn.', 100],
  ['dicker_fisch', '🐟', 'Dicker Fisch', 'Gewinn in einer Sitzung das 50-Fache des Mindesteinsatzes.', 100],
  ['versichert', '🛡️', 'Richtig versichert', 'Versichere bei True Count +3 oder mehr, und der Dealer hat Blackjack.', 100],
  ['zaehler_50', '🧮', 'Zählmaschine', '50 richtige Count-Antworten.', 150],
  ['zaehler_500', '🧠', 'Rain Man', '500 richtige Count-Antworten.', 500],
  ['schnellrechner', '⚡', 'Schnellrechner', '10 richtige True Counts in unter 3 Sekunden.', 100],
  ['perfekter_schuh', '🎯', 'Perfekter Schuh', 'Alle Count-Fragen eines Schuhs richtig (mindestens 3).', 150],
  ['lehrers_liebling', '🍎', 'Lehrers Liebling', '50 richtige Züge in Folge mit dem Lehrer.', 150],
  ['wonger', '🚪', 'Der Wonger', 'Steh bei kaltem Count auf (True Count −1 oder weniger).', 50],
  ['comeback', '💪', 'Comeback', 'Von unter 500 € zurück auf über 1.000 €.', 150],
  ['lehrgeld', '💸', 'Lehrgeld', 'Geh zum ersten Mal pleite.', 25],
  ['tisch2', '🔓', 'Kellerclub', 'Schalte Tisch 2 frei.', 100],
  ['tisch3', '🔓', 'Grand Casino', 'Schalte Tisch 3 frei.', 200],
  ['tisch4', '🔓', 'Lounge', 'Schalte Tisch 4 frei.', 300],
  ['tisch5', '🔓', 'Penthouse', 'Schalte Tisch 5 frei.', 500],
  ['level5', '🎖️', 'Level 5', 'Erreiche Level 5.', 50],
  ['level10', '🎖️', 'Kartenzähler', 'Erreiche Level 10.', 100],
  ['level20', '🎖️', 'Kartenhai', 'Erreiche Level 20.', 200],
  ['level30', '🎖️', 'High Roller', 'Erreiche Level 30.', 300],
  ['level40', '🏆', 'Legende', 'Erreiche Level 40.', 500],
  ['shopping', '🛍️', 'Shopping-Tour', 'Kauf dein erstes Teil im Shop.', 25],
  ['modebewusst', '🕶️', 'Modebewusst', 'Besitze 8 Teile aus dem Shop.', 150],
  ['trainiert', '🏋️', 'Trainingsfleißig', 'Schließ 20 Trainingsrunden ab.', 100],
].map(([id, emoji, name, text, xp]) => ({ id, emoji, name, text, xp }));

// ---------- Laden und Speichern ----------
export const STARTER = OUTFITS.filter(o => !o.preis).map(o => o.id);
const neu = () => ({
  geld: 1000, xp: 0, serie: 0, pleiten: 0, tische: [1], erfolge: {}, figur: null, besitz: [...STARTER], einsatz: {},
  sitzung: null, verlauf: [], stat: {}, tief500: false, trainingTag: { tag: '', xp: 0 },
});
function adminNeu() {
  return { ...neu(), geld: 1000000, xp: levelXp(40), tische: [1, 2, 3, 4, 5], besitz: [...OUTFITS, ...ACCESSOIRES].map(o => o.id),
    figur: { tier: 'fuchs', farbe: '#e8772e', outfit: 'smoking', acc: 'krone' } };
}

export let P, modus;
export const E = Object.assign({ decks: 0, schnitt: .75, tempo: 1, zaehlwerte: true, lehrer: true, fragen: true, countAnzeige: false,
  ton: true, lautEffekte: .8, lautAmbiente: .4 }, lesen(KEY_EINST));
export const einstellungenSpeichern = () => schreiben(KEY_EINST, E);

export function laden(m = lesen(KEY_MODUS) || 'normal') {
  modus = m;
  P = lesen(KEY[m]);
  if (!P && m === 'normal') {
    P = neu();
    const alt = lesen('truecount.v1'); // Spielstand aus Etappe 1 übernehmen
    if (alt) { P.geld = alt.geld ?? 1000; E.zaehlwerte = alt.zaehlwerte ?? true; E.tempo = alt.tempo ?? 1; }
  }
  if (!P) P = adminNeu();
  P = Object.assign(neu(), P);
  schreiben(KEY_MODUS, m);
  speichern();
}
export const speichern = () => schreiben(KEY[modus], P);
export const istAdmin = () => modus === 'admin';

// ---------- Meldungen (die App zeigt sie nacheinander an) ----------
export const meldungen = [];
const melden = (emoji, text, art = '') => meldungen.push({ emoji, text, art });

// XP direkt aufs Konto (Erfolge, Training). Meldet Level-Aufstiege.
export function xpKonto(n) {
  const vorher = level(P.xp);
  P.xp += Math.round(n);
  const nachher = level(P.xp);
  for (let l = vorher + 1; l <= nachher; l++) {
    melden('🆙', `<b>Level ${l}!</b> ${titel(l) !== titel(l - 1) ? `Neuer Titel: <b>${titel(l)}</b>` : titel(l)}`, 'level');
    if ([5, 10, 20, 30, 40].includes(l)) erfolg('level' + l);
  }
  freischalten();
}
// XP in den Pott der laufenden Sitzung (am Tisch). Höhere Tische geben mehr.
export function xpPott(n) {
  if (!P.sitzung || n <= 0) return 0;
  const x = Math.round(n * TISCHE[P.sitzung.tisch - 1].xp);
  P.sitzung.pott += x;
  return x;
}

export function erfolg(id) {
  if (P.erfolge[id]) return false;
  const e = ERFOLGE.find(x => x.id === id);
  if (!e) return false;
  P.erfolge[id] = Date.now();
  melden(e.emoji, `<b>Erfolg: ${e.name}</b> · +${e.xp} XP`, 'erfolg');
  xpKonto(e.xp);
  return true;
}
export const zaehlen = (k, n = 1) => (P.stat[k] = (P.stat[k] || 0) + n);

// ---------- Count-Quote (für Tisch 4 und 5) ----------
export function countAntwort(richtig) {
  P.verlauf.push(richtig ? 1 : 0);
  if (P.verlauf.length > 50) P.verlauf.shift();
}
export const quote = () => P.verlauf.length ? P.verlauf.reduce((a, b) => a + b, 0) / P.verlauf.length : 0;
const QUOTE_MIN = 30; // so viele Antworten braucht es, bevor die Quote zählt

// ---------- Tische ----------
export function freischaltBedingung(t) {
  const l = level(P.xp), q = quote(), f = t.frei;
  return { geld: P.geld >= f.geld, level: l >= f.level, quote: !f.quote || (P.verlauf.length >= QUOTE_MIN && q >= f.quote) };
}
export function freischalten() {
  for (const t of TISCHE) {
    if (P.tische.includes(t.nr)) continue;
    const b = freischaltBedingung(t);
    if (b.geld && b.level && b.quote) {
      P.tische.push(t.nr);
      melden('🔓', `<b>${t.name}</b> ist freigeschaltet!`, 'erfolg');
      erfolg('tisch' + t.nr);
    }
  }
}
export const darfSitzen = t => P.tische.includes(t.nr) && P.geld >= t.sitz;

// ---------- Sitzung ----------
export function hinsetzen(t) {
  if (P.sitzung) return P.sitzung.tisch === t.nr;
  P.sitzung = { tisch: t.nr, pott: 0, startGeld: P.geld, haende: 0, schuh: { fragen: 0, richtig: 0 }, naechsteFrage: 0 };
  speichern();
  return true;
}

// Aufstehen: Der Pott wird mit dem Serien-Faktor gesichert. Bei kaltem Count gibt es den Wonging-Bonus.
export function aufstehen(tc) {
  const s = P.sitzung;
  if (!s) return null;
  const t = TISCHE[s.tisch - 1], gewinn = P.geld - s.startGeld, faktor = serienFaktor(P.serie);
  const wong = s.haende >= 5 && tc <= -1 ? Math.round(20 * t.xp) : 0;
  const sitzungsXp = gewinn > 0 ? Math.min(150, Math.round(gewinn / (t.min * 2)) * t.xp) : 0;
  const gesichert = Math.round(s.pott * faktor) + wong + sitzungsXp;
  if (gewinn > 0 && s.haende >= 5) P.serie = Math.min(10, P.serie + 1); else if (gewinn < 0) P.serie = 0;
  P.sitzung = null;
  const info = { pott: s.pott, faktor, wong, sitzungsXp, gesichert, gewinn, haende: s.haende, serie: P.serie };
  xpKonto(gesichert);
  if (wong) erfolg('wonger');
  if (gewinn >= t.min * 50) erfolg('dicker_fisch');
  speichern();
  return info;
}

// Pleite: Der Pott ist weg, die Serie fällt auf ×1, das Geld fängt bei 1.000 an. Level, Erfolge, Tische und Outfits bleiben.
export function pleite() {
  const pott = P.sitzung?.pott || 0;
  P.sitzung = null;
  P.serie = 0;
  P.pleiten++;
  P.geld = 1000;
  P.tief500 = false;
  erfolg('lehrgeld');
  speichern();
  return pott;
}

// Nach jeder Runde: Comeback prüfen
export function geldGeaendert() {
  if (P.geld < 500) P.tief500 = true;
  else if (P.tief500 && P.geld > 1000) { P.tief500 = false; erfolg('comeback'); }
}

// ---------- Shop ----------
// Gekauft wird nur mit Chips über 1.000 €, damit sich eine absichtliche Pleite nicht lohnt.
export const kaufbar = preis => P.geld - preis >= 1000;
export function kaufen(item) {
  if (P.besitz.includes(item.id) || !kaufbar(item.preis)) return false;
  P.geld -= item.preis;
  P.besitz.push(item.id);
  erfolg('shopping');
  if (P.besitz.length - STARTER.length >= 8) erfolg('modebewusst');
  speichern();
  return true;
}
