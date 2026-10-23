// TrueCount – gemeinsame Bausteine der Oberfläche: Meldungen, Einblendungen und das Zahlenfeld.
import { sound } from './sound.js';
import { figurBild, LEHRER } from './figuren.js';

export const $ = s => document.querySelector(s);
export const fmt = n => n === Infinity ? '∞' : n.toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' €';
export const zahl = (n, d = 1) => n.toLocaleString('de-DE', { maximumFractionDigits: d });
export const vz = n => (n > 0 ? '+' : n < 0 ? '−' : '±') + Math.abs(n); // Zahl mit Vorzeichen
export const pause = ms => new Promise(r => setTimeout(r, ms));
export const zufallZwischen = ([a, b]) => a + Math.floor(Math.random() * (b - a + 1));

// ---------- Meldungen nacheinander oben einblenden ----------
const warteschlange = [];
let laeuft = false;
export function toast(text, { ms = 2800, ton = null, vorne = false } = {}) {
  warteschlange[vorne ? 'unshift' : 'push']({ text, ms, ton });
  if (!laeuft) naechste();
}
function naechste() {
  const t = $('#toast'), n = warteschlange.shift();
  if (!n) { laeuft = false; return; }
  laeuft = true;
  t.innerHTML = n.text;
  t.classList.add('on');
  if (n.ton) sound[n.ton]?.();
  setTimeout(() => { t.classList.remove('on'); setTimeout(naechste, 260); }, n.ms);
}

// ---------- Einblendung (immer nur eine gleichzeitig) ----------
let beimSchliessen = null;
// fest = schließt nicht beim Tippen daneben, klar = Tisch bleibt gut sichtbar (z. B. für die Count-Frage)
export function sheet(html, { fest = false, klar = false, zu = null } = {}) {
  const o = $('#ov'), s = $('#sheet');
  s.innerHTML = html;
  o.classList.toggle('fest', fest);
  o.classList.toggle('klar', klar);
  o.classList.add('open');
  s.scrollTop = 0;
  s.classList.remove('hoch'); void s.offsetWidth; s.classList.add('hoch');
  beimSchliessen = zu;
}
export function sheetZu() {
  $('#ov').classList.remove('open');
  const f = beimSchliessen;
  beimSchliessen = null;
  f?.();
}
export const sheetOffen = () => $('#ov').classList.contains('open');
export function wackeln(text) {
  const s = $('#sheet');
  s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake');
  if (text) toast(text, { vorne: true });
}

// ---------- Professor Uhu: läuft von der Seite ins Bild und erklärt in einer großen Sprechblase ----------
// Solange er redet, liegt er über allem. Das Spiel wartet, weil man nichts anderes antippen kann.
// knoepfe = eigene Knöpfe statt „Alles klar!“ (Tutorial), still = er steht schon da, also nicht noch einmal hereinlaufen.
// Mit eigenen Knöpfen gibt es oben ein ✕, damit man jederzeit herauskommt.
let uhuFertig = null;
export function uhu(titel, absaetze, { knopf = 'Alles klar!', zu = null, knoepfe = null, still = false } = {}) {
  const el = $('#uhu');
  el.innerHTML = `<div class="uhu-figur">${figurBild(LEHRER)}<b>${LEHRER.name}</b></div>`
    + `<div class="uhu-blase"><div class="pn uhu-text">${knoepfe ? '<button class="uhu-x" data-uhu="zu" aria-label="Schließen">✕</button>' : ''}<h2>${titel}</h2>${absaetze.map(p => `<p>${p}</p>`).join('')}`
    + (knoepfe || `<button class="btn hit voll" data-uhu="zu">${knopf}</button>`) + '</div></div>';
  el.classList.toggle('still', still);
  el.classList.add('open');
  el.querySelector('.uhu-text').scrollTop = 0;
  uhuFertig = zu;
  sound.klick();
}
export function uhuWeg() {
  $('#uhu').classList.remove('open');
  const f = uhuFertig;
  uhuFertig = null;
  f?.();
}
export const uhuOffen = () => $('#uhu').classList.contains('open');

// ---------- Zahlenfeld für Count-Antworten (auch negativ) ----------
let kp = { s: '', neg: false, fertig: null, stellen: 3, pin: false };
// pin = nur Ziffern als Punkte zeigen, ohne Vorzeichen
export function zahlenfeld(fertig, { knopf = '✓ Antworten', stellen = 3, pin = false } = {}) {
  kp = { s: '', neg: false, fertig, stellen, pin };
  return `<div class="anzeige" id="kp-wert">?</div><div class="pad">`
    + ['1', '2', '3', '4', '5', '6', '7', '8', '9', pin ? '' : '±', '0', '⌫'].map(k => k ? `<button class="btn aux" data-k="${k}">${k === '±' ? '+/−' : k}</button>` : '<span></span>').join('')
    + `</div><button class="btn hit voll" data-k="ok">${knopf}</button>`;
}
export function taste(k) {
  if (k === 'ok') {
    if (!kp.s) return wackeln('Gib erst eine Zahl ein.');
    const f = kp.fertig;
    kp.fertig = null;
    return f?.(kp.pin ? kp.s : (kp.neg ? -1 : 1) * +kp.s);
  }
  if (k === '⌫') kp.s = kp.s.slice(0, -1);
  else if (k === '±') kp.neg = !kp.neg;
  else if (kp.s.length < kp.stellen) kp.s = kp.s === '0' && !kp.pin ? k : kp.s + k;
  sound.klick();
  const el = $('#kp-wert');
  if (el) el.textContent = kp.pin ? '•'.repeat(kp.s.length) || '?'
    : kp.s ? (kp.neg && kp.s !== '0' ? '−' : kp.s === '0' ? '' : '+') + kp.s : (kp.neg ? '−' : '?');
}
