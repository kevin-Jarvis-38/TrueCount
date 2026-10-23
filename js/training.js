// TrueCount – Trainingsbereich ohne Spiel: Blitz-Zählen, Deck-Countdown, True Count rechnen und Strategie-Drill.
import { neuerSchuh, hiLo, punkte } from './karten.js';
import { lehrerZug, zugName } from './strategie.js';
import { ZUG } from './tisch.js';
import { karteSvg } from './szene.js';
import * as pr from './profil.js';
import { sound } from './sound.js';
import { $, vz, zahl, pause, sheet, sheetZu, sheetOffen, toast, zahlenfeld } from './ui.js';

const TAGES_XP = 300; // so viel XP gibt das Training höchstens pro Tag
let lauf = {}, cfg = { n: 20, ms: 800 };

const neuesDeck = () => neuerSchuh(1, 1, Math.random, 900 + Math.floor(Math.random() * 99)).karten;
const bild = k => `<svg class="tr-bild" viewBox="-24 -32 48 64">${karteSvg(k, 0, 0, 1, 0, false)}</svg>`;
const kopf = titel => `<header class="kopf"><button class="btn aux zurueck" data-tr="menue">← Zurück</button><h1>${titel}</h1></header>`;
const buehne = html => { $('#tr').innerHTML = html; };
const heute = () => new Date().toDateString();
const heuteXp = () => pr.P.trainingTag.tag === heute() ? pr.P.trainingTag.xp : 0;

function xpTraining(n) {
  const P = pr.P;
  if (P.trainingTag.tag !== heute()) P.trainingTag = { tag: heute(), xp: 0 };
  const x = Math.max(0, Math.min(Math.round(n), TAGES_XP - P.trainingTag.xp));
  P.trainingTag.xp += x;
  if (x) pr.xpKonto(x);
  return x;
}
function geschafft() {
  if (pr.zaehlen('training') >= 20) pr.erfolg('trainiert');
  pr.speichern();
  while (pr.meldungen.length) { const m = pr.meldungen.shift(); toast(`${m.emoji} ${m.text}`, { ton: 'erfolg' }); }
}
const xpText = x => x ? ` <b>+${x} XP</b>` : heuteXp() >= TAGES_XP ? ' (Tageslimit für Trainings-XP erreicht)' : '';

export function trainingMenue() {
  lauf.abbruch = true;
  buehne(`<header class="kopf"><button class="btn aux zurueck" data-l="lobby">← Lobby</button><h1>Training</h1></header>`
    + `<p class="tr-info">Ohne Geld und ohne Tisch – nur du und die Karten. Training gibt bis zu ${TAGES_XP} XP am Tag (heute schon ${heuteXp()}).</p><div class="tr-liste">`
    + [['blitz', '⚡', 'Blitz-Zählen', 'Karten blitzen nacheinander auf. Am Ende: Wie hoch ist der laufende Count?'],
      ['deck', '🃏', 'Deck-Countdown', 'Ein ganzes Deck so schnell wie möglich durchzählen. Eine Karte fehlt – dein Count verrät, welche Sorte.'],
      ['tc', '➗', 'True Count rechnen', 'Laufender Count geteilt durch die Decks im Schuh. 10 Aufgaben.'],
      ['strategie', '🧠', 'Strategie-Drill', '20 Hände: Was ist der richtige Zug? Mit Erklärung vom Lehrer.'],
    ].map(([id, e, n, t]) => `<button class="pn tr-wahl" data-tr="${id}"><span>${e}</span><div><b>${n}</b><small>${t}</small></div></button>`).join('') + '</div>');
}

export function trainingKlick(d) {
  if (sheetOffen()) sheetZu();
  sound.klick();
  const a = d.tr;
  if (a === 'menue') return trainingMenue();
  if (a === 'blitz') return blitzWahl();
  if (a === 'blitzN') { cfg.n = +d.n; return blitzWahl(); }
  if (a === 'blitzMs') { cfg.ms = +d.ms; return blitzWahl(); }
  if (a === 'blitzLos') return blitzLos();
  if (a === 'deck') return deckLos();
  if (a === 'deckWeiter') return deckWeiter();
  if (a === 'tc') return tcLos();
  if (a === 'strategie') return stratLos();
  if (a === 'zug') return stratAntwort(d.z);
  if (a === 'stratWeiter') return stratNaechste();
}

// ---------- Blitz-Zählen ----------
function blitzWahl() {
  const k = (feld, werte, akt, text) => werte.map(([v, t]) => `<button class="btn ${v === akt ? 'hit' : 'aux'}" data-tr="${feld}" data-${feld === 'blitzN' ? 'n' : 'ms'}="${v}">${t}</button>`).join('');
  buehne(kopf('Blitz-Zählen') + `<div class="pn tr-box"><p>Wie viele Karten?</p><div class="tr-knoepfe">${k('blitzN', [[10, '10'], [20, '20'], [30, '30']], cfg.n)}</div>`
    + `<p>Wie schnell?</p><div class="tr-knoepfe">${k('blitzMs', [[1200, 'Langsam'], [800, 'Normal'], [450, 'Schnell']], cfg.ms)}</div>`
    + `<button class="btn hit voll" data-tr="blitzLos">Los!</button></div>`);
}
async function blitzLos() {
  const karten = neuesDeck().slice(0, cfg.n), mein = lauf = {};
  buehne(kopf('Blitz-Zählen') + `<div class="tr-buehne"><div class="tr-zaehler" id="tr-zaehler">Gleich geht's los …</div><div class="tr-feld" id="tr-feld"></div></div>`);
  await pause(900);
  for (let i = 0; i < karten.length; i++) {
    if (mein.abbruch) return;
    $('#tr-feld').innerHTML = bild(karten[i]);
    $('#tr-zaehler').textContent = `${i + 1} / ${karten.length}`;
    sound.karte();
    await pause(cfg.ms);
  }
  if (mein.abbruch) return;
  $('#tr-feld').innerHTML = '';
  const rc = karten.reduce((n, k) => n + hiLo(k.r), 0);
  sheet(`<h2>Wie hoch ist der laufende Count?</h2>${zahlenfeld(w => blitzErgebnis(w, rc, karten))}`, { fest: true });
}
function blitzErgebnis(w, rc, karten) {
  const ok = w === rc, x = ok ? xpTraining(cfg.n / 2 * (cfg.ms <= 450 ? 1.5 : cfg.ms >= 1200 ? .7 : 1)) : 0;
  sound[ok ? 'richtig' : 'falsch']();
  geschafft();
  sheet(`<h2>${ok ? 'Richtig! 🎉' : 'Leider falsch 😬'}</h2><p>Der laufende Count war <b>${vz(rc)}</b>${ok ? '' : ` (du: ${vz(w)})`}.${xpText(x)}</p>`
    + `<div class="tr-verlauf">${karten.map(k => `<span class="hl${hiLo(k.r)}">${k.r}${k.s}<i>${vz(hiLo(k.r))}</i></span>`).join('')}</div>`
    + `<div class="row zwei"><button class="btn aux" data-tr="menue">Menü</button><button class="btn hit" data-tr="blitzLos">Nochmal</button></div>`, { fest: true });
}

// ---------- Deck-Countdown ----------
function deckLos() {
  const karten = neuesDeck(), versteckt = karten.pop();
  lauf = { karten, versteckt, i: 0, start: 0 };
  buehne(kopf('Deck-Countdown') + `<div class="tr-buehne"><div class="tr-zaehler" id="tr-zaehler">Tipp auf den Stapel, um zu starten. Zähl mit – so schnell du kannst!</div>`
    + `<button class="tr-feld tr-tipp" id="tr-feld" data-tr="deckWeiter"><span class="tr-ruecken">START</span></button></div>`);
}
function deckWeiter() {
  const l = lauf;
  if (!l.karten || l.ende) return;
  if (!l.start) l.start = performance.now();
  if (l.i >= l.karten.length) {
    l.ende = true;
    const sek = (performance.now() - l.start) / 1000, rc = l.karten.reduce((n, k) => n + hiLo(k.r), 0);
    return sheet(`<h2>Fertig in ${zahl(sek, 1)} Sekunden!</h2><p>Wie hoch ist dein laufender Count nach 51 Karten?</p>${zahlenfeld(w => deckErgebnis(w, rc, sek))}`, { fest: true });
  }
  $('#tr-feld').innerHTML = bild(l.karten[l.i++]);
  $('#tr-zaehler').textContent = l.i === l.karten.length ? `${l.i} / 51 – noch einmal tippen zum Beenden` : `${l.i} / 51`;
  sound.karte();
}
function deckErgebnis(w, rc, sek) {
  const ok = w === rc, v = lauf.versteckt, x = ok ? xpTraining(sek < 40 ? 20 : 15) : 0;
  const sorte = { 1: 'eine kleine Karte (2–6)', 0: 'eine neutrale Karte (7–9)', '-1': 'eine hohe Karte (10–Ass)' }[hiLo(v.r)];
  sound[ok ? 'richtig' : 'falsch']();
  geschafft();
  sheet(`<h2>${ok ? 'Richtig! 🎉' : 'Leider falsch 😬'}</h2><p>Der Count war <b>${vz(rc)}</b>${ok ? '' : ` (du: ${vz(w)})`}.${xpText(x)}</p>`
    + `<p class="calc">Ein volles Deck ergibt immer 0. Bei ${vz(rc)} fehlt also ${sorte} – es war ${v.r}${v.s}.<br>Profis schaffen ein Deck in unter 25 Sekunden.</p>`
    + `<div class="row zwei"><button class="btn aux" data-tr="menue">Menü</button><button class="btn hit" data-tr="deck">Nochmal</button></div>`, { fest: true });
}

// ---------- True Count rechnen ----------
function tcLos() { lauf = { nr: 0, richtig: 0 }; tcAufgabe(); }
function tcAufgabe() {
  const decks = [2, 6, 8][Math.floor(Math.random() * 3)], rest = (1 + Math.floor(Math.random() * (decks * 2 - 1))) / 2;
  const grenze = Math.max(3, Math.round(rest * 5)), rc = Math.floor(Math.random() * (2 * grenze + 1)) - grenze;
  Object.assign(lauf, { decks, rest, rc, tc: Math.trunc(rc / rest) });
  buehne(kopf('True Count rechnen') + `<div class="pn tr-box"><div class="tr-zaehler">Aufgabe ${lauf.nr + 1} von 10 · ${lauf.richtig} richtig</div>`
    + `<p class="tr-gross">Laufender Count <b>${vz(rc)}</b></p><p class="tr-gross">Im Schuh noch <b>${zahl(rest)} ${rest === 1 ? 'Deck' : 'Decks'}</b> <small>(von ${decks})</small></p>`
    + `<p>True Count = laufender Count ÷ Decks, Richtung 0 abgerundet.</p></div>`);
  sheet(`<h2>True Count?</h2>${zahlenfeld(tcAntwort)}`, { fest: true, klar: true });
}
function tcAntwort(w) {
  const l = lauf, ok = w === l.tc;
  sound[ok ? 'richtig' : 'falsch']();
  if (ok) l.richtig++;
  toast(ok ? `✅ Richtig: ${vz(l.rc)} ÷ ${zahl(l.rest)} = ${vz(l.tc)}` : `❌ ${vz(l.rc)} ÷ ${zahl(l.rest)} = ${zahl(l.rc / l.rest, 2)} → <b>${vz(l.tc)}</b>`, { vorne: true });
  if (++l.nr < 10) return tcAufgabe();
  const x = xpTraining(l.richtig * 2);
  geschafft();
  sheet(`<h2>${l.richtig} von 10 richtig ${l.richtig >= 9 ? '🏆' : l.richtig >= 6 ? '👍' : '📚'}</h2><p>${xpText(x)}</p>`
    + `<div class="row zwei"><button class="btn aux" data-tr="menue">Menü</button><button class="btn hit" data-tr="tc">Nochmal</button></div>`, { fest: true });
}

// ---------- Strategie-Drill ----------
function stratLos() { lauf = { nr: 0, richtig: 0 }; stratNaechste(); }
function stratNaechste() {
  const l = lauf;
  if (l.nr >= 20) {
    const x = xpTraining(l.richtig);
    geschafft();
    return sheet(`<h2>${l.richtig} von 20 richtig ${l.richtig >= 18 ? '🏆' : l.richtig >= 14 ? '👍' : '📚'}</h2><p>${xpText(x)}</p>`
      + `<div class="row zwei"><button class="btn aux" data-tr="menue">Menü</button><button class="btn hit" data-tr="strategie">Nochmal</button></div>`, { fest: true });
  }
  let d;
  do { d = neuesDeck(); } while (punkte(d[0].r) + punkte(d[1].r) === 21);
  const hand = [d[0], d[1]], up = d[2], paar = punkte(hand[0].r) === punkte(hand[1].r);
  const m = { karte: true, bleiben: true, verdoppeln: true, teilen: paar, aufgeben: true };
  Object.assign(l, { hand, up, m, rat: lehrerZug(hand, up, m, 0), beantwortet: false });
  const knopf = (z, cls, name) => `<button class="btn ${cls}" data-tr="zug" data-z="${z}" ${m[z] ? '' : 'disabled'}>${name}</button>`;
  buehne(kopf('Strategie-Drill') + `<div class="tr-buehne"><div class="tr-zaehler">Hand ${l.nr + 1} von 20 · ${l.richtig} richtig</div>`
    + `<div class="tr-dealer"><small>Dealer</small>${bild(up)}</div><div class="tr-hand"><small>Du</small>${bild(hand[0])}${bild(hand[1])}</div>`
    + `<div class="tr-rat" id="tr-rat"></div></div>`
    + `<div class="tr-zuege">${knopf('karte', 'hit', 'Karte')}${knopf('bleiben', 'stand', 'Bleiben')}${knopf('verdoppeln', 'dbl', 'Verdoppeln')}${knopf('teilen', 'split', 'Teilen')}${knopf('aufgeben', 'aux', 'Aufgeben')}</div>`);
}
function stratAntwort(z) {
  const l = lauf;
  if (l.beantwortet) return;
  l.beantwortet = true;
  l.nr++;
  const ok = ZUG[l.rat.zug] === z;
  if (ok) l.richtig++;
  sound[ok ? 'richtig' : 'falsch']();
  $('#tr-rat').innerHTML = `<div class="pn">${ok ? '✅ Richtig!' : `❌ Richtig wäre <b>${zugName(l.rat.zug)}</b>.`} ${l.rat.text}</div><button class="btn hit voll" data-tr="stratWeiter">Weiter</button>`;
  document.querySelectorAll('.tr-zuege .btn').forEach(b => { b.disabled = true; });
}
