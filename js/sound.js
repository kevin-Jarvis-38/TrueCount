// TrueCount – Geräusche. Alle werden im Browser erzeugt (keine Dateien, keine Lizenzfragen).
// Effekte, Hintergrund (Gemurmel und Spielautomaten) und Musik haben eigene Lautstärken.
import { E } from './profil.js';

let ctx, master, fxBus, ambBus, musBus, rauschBuf, amb = null;

function init() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.connect(ctx.destination);
  fxBus = ctx.createGain(); fxBus.connect(master);
  ambBus = ctx.createGain(); ambBus.connect(master);
  musBus = ctx.createGain(); musBus.connect(master);
  rauschBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = rauschBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  lautstaerke();
}
// Browser erlauben Ton erst nach einer Berührung
export function aktivieren() { try { init(); } catch {} }
export function lautstaerke() {
  if (!ctx) return;
  master.gain.value = E.ton ? 1 : 0;
  fxBus.gain.value = E.lautEffekte;
  ambBus.gain.value = E.lautAmbiente * .6;
  musBus.gain.value = E.lautMusik * .8;
}
// Für die Musik (musik.js): derselbe Audio-Kontext, eigener Lautstärke-Regler
export const audio = () => ctx ? { ctx, bus: musBus, rausch: rauschBuf } : null;
// Im Hintergrund (App gewechselt, Bildschirm aus) ist alles still
document.addEventListener('visibilitychange', () => { if (ctx) (document.hidden ? ctx.suspend() : ctx.resume()).catch(() => {}); });

const jetzt = () => ctx.currentTime;
function huelle(g, t, a, peak, dauer) {
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(.0001, t + dauer);
}
function ton(t, freq, dauer, peak = .2, typ = 'sine', ziel = fxBus, gleiten = 0) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = typ;
  o.frequency.setValueAtTime(freq, t);
  if (gleiten) o.frequency.exponentialRampToValueAtTime(gleiten, t + dauer);
  huelle(g, t, .005, peak, dauer);
  o.connect(g).connect(ziel);
  o.start(t); o.stop(t + dauer + .05);
}
function rauschen(t, dauer, freq, q, peak, typ = 'bandpass', ziel = fxBus) {
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = rauschBuf;
  f.type = typ; f.frequency.value = freq; f.Q.value = q;
  huelle(g, t, .004, peak, dauer);
  s.connect(f).connect(g).connect(ziel);
  s.start(t, Math.random()); s.stop(t + dauer + .05);
}
const spiele = fn => { if (!ctx || !E.ton) return; try { fn(jetzt()); } catch {} };

export const sound = {
  karte: () => spiele(t => rauschen(t, .07, 3200, 1.2, .5)),
  chip: () => spiele(t => { ton(t, 2600, .05, .12, 'square'); ton(t + .035, 3300, .05, .1, 'square'); }),
  klick: () => spiele(t => ton(t, 700, .04, .08, 'triangle')),
  mischen: () => spiele(t => { for (let i = 0; i < 16; i++) rauschen(t + i * .045, .05, 2500 + Math.random() * 1500, 1, .25); }),
  gewinn: () => spiele(t => [523, 659, 784, 1047].forEach((f, i) => ton(t + i * .08, f, .25, .16, 'triangle'))),
  blackjack: () => spiele(t => {
    [523, 659, 784, 1047, 1319].forEach((f, i) => ton(t + i * .07, f, .3, .16, 'triangle'));
    [1047, 1319, 1568].forEach(f => ton(t + .4, f, .9, .1, 'sine'));
    for (let i = 0; i < 6; i++) ton(t + .45 + i * .06, 2000 + Math.random() * 2000, .12, .05, 'sine');
  }),
  verlust: () => spiele(t => { ton(t, 330, .22, .12, 'sawtooth', fxBus, 220); ton(t + .2, 220, .35, .1, 'sawtooth', fxBus, 140); }),
  push: () => spiele(t => { ton(t, 440, .15, .1, 'triangle'); ton(t + .12, 440, .15, .08, 'triangle'); }),
  richtig: () => spiele(t => { ton(t, 880, .3, .15); ton(t + .09, 1320, .4, .13); }),
  falsch: () => spiele(t => ton(t, 150, .25, .14, 'square', fxBus, 110)),
  level: () => spiele(t => [392, 523, 659, 784, 1047, 784, 1047].forEach((f, i) => ton(t + i * .1, f, .3, .15, i > 4 ? 'square' : 'triangle'))),
  erfolg: () => spiele(t => [1047, 1319, 1568, 2093].forEach((f, i) => ton(t + i * .06, f, .4, .09))),
  kasse: () => spiele(t => { ton(t, 1800, .08, .1, 'square'); ton(t + .07, 2400, .25, .1, 'sine'); rauschen(t + .05, .15, 6000, 2, .1); }),
};

// ---------- Hintergrund: Gemurmel und ab und zu ein Spielautomat ----------
export function ambienteStart(edel = false) {
  if (!ctx || amb) return;
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
  s.buffer = rauschBuf; s.loop = true;
  f.type = 'lowpass'; f.frequency.value = edel ? 500 : 700; f.Q.value = .7;
  g.gain.value = .35;
  lfo.frequency.value = .3; lg.gain.value = .12; // das Gemurmel schwankt leicht
  lfo.connect(lg).connect(g.gain);
  s.connect(f).connect(g).connect(ambBus);
  s.start(); lfo.start();
  const automat = () => {
    if (!amb) return;
    if (E.ton) {
      const t = jetzt(), noten = [784, 988, 1175, 1319, 1568, 1976];
      const n = 4 + Math.floor(Math.random() * 6);
      for (let i = 0; i < n; i++) ton(t + i * .09, noten[Math.floor(Math.random() * noten.length)], .18, .05, 'square', ambBus);
      if (Math.random() < .3) for (let i = 0; i < 8; i++) ton(t + .6 + i * .05, 2400 + Math.random() * 800, .06, .03, 'sine', ambBus); // Münzen
    }
    amb.timer = setTimeout(automat, 5000 + Math.random() * 9000);
  };
  amb = { s, lfo, timer: setTimeout(automat, 3000) };
}
export function ambienteStop() {
  if (!amb) return;
  clearTimeout(amb.timer);
  try { amb.s.stop(); amb.lfo.stop(); } catch {}
  amb = null;
}
