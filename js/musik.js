// TrueCount – Hintergrundmusik passend zum Tisch. Alles wird im Browser erzeugt (keine Dateien, keine Lizenzfragen).
// Hinterzimmer: langsamer Blues · Kellerclub: Cool Jazz · Grand Casino: Swing · Lounge: Bossa Nova · Penthouse: Deep House.
// Ein Taktgeber plant die Noten immer ein Stück im Voraus, damit nichts hakt. Die Begleitung wiederholt sich,
// die Melodietöne und Bassläufe werden jedes Mal neu gewürfelt, deshalb klingt es nie ganz gleich.
import { audio } from './sound.js';
import { E } from './profil.js';

const mtof = m => 440 * 2 ** ((m - 69) / 12);
const zufall = a => a[Math.floor(Math.random() * a.length)];
const AKK = {
  '6': [0, 4, 7, 9], '7': [0, 4, 7, 10], '9': [0, 4, 7, 10, 14], '13': [0, 4, 10, 14, 21], '7b9': [0, 4, 7, 10, 13],
  m7: [0, 3, 7, 10], m9: [0, 3, 7, 10, 14], m7b5: [0, 3, 6, 10], maj9: [0, 4, 7, 11, 14],
};
// Akkord = [Grundton als MIDI-Nummer, Art]. lage() legt die Töne eng ab einer Tonhöhe (ohne Grundton klingt es jazziger).
const lage = ([r, art], ab = 55, ohneGrund = false) => AKK[art].filter(i => !ohneGrund || i % 12)
  .map(i => { let n = r + i; while (n < ab) n += 12; while (n >= ab + 12) n -= 12; return n; }).sort((x, y) => x - y);
const tief = n => { while (n < 36) n += 12; while (n >= 52) n -= 12; return n; }; // Basslage
const imSchlag = (bar, s) => bar[Math.min(bar.length - 1, Math.floor(s / (4 / bar.length)))];

let M = null; // die laufende Musik

// ---------- Instrumente ----------
function osc(t, typ, f, dauer) {
  const o = M.a.ctx.createOscillator();
  o.type = typ; o.frequency.value = f;
  o.start(t); o.stop(t + dauer + .3);
  return o;
}
function gain(t, an, peak, dauer, ziel = M.out) {
  const g = M.a.ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + an);
  g.gain.exponentialRampToValueAtTime(.0001, t + dauer + .1);
  g.connect(ziel);
  return g;
}
function filter(typ, f, q = .7, ziel) {
  const x = M.a.ctx.createBiquadFilter();
  x.type = typ; x.frequency.value = f; x.Q.value = q;
  if (ziel) x.connect(ziel);
  return x;
}
// Klavier, auf Wunsch leicht verstimmt wie im Saloon
function klavier(t, noten, dauer, vol, verstimmt = 0) {
  const g = gain(t, .004, vol / noten.length * 2, dauer), f = filter('lowpass', 2600, .7, g);
  for (const n of noten) {
    osc(t, 'triangle', mtof(n), dauer).connect(f);
    if (verstimmt) { const o = osc(t, 'triangle', mtof(n), dauer); o.detune.value = verstimmt; o.connect(f); }
  }
}
// E-Piano (Rhodes-artig): ein Sinus, dessen Klang kurz glockig anschlägt
function epiano(t, noten, dauer, vol) {
  const g = gain(t, .008, vol / noten.length * 2, dauer);
  for (const n of noten) {
    const f = mtof(n), c = osc(t, 'sine', f, dauer), mo = osc(t, 'sine', f, dauer), mg = M.a.ctx.createGain();
    mg.gain.setValueAtTime(f * 1.1, t);
    mg.gain.exponentialRampToValueAtTime(f * .04, t + .35);
    mo.connect(mg).connect(c.frequency);
    c.connect(g);
  }
}
// Gezupfte Nylon-Gitarre, die Saiten leicht nacheinander angeschlagen
function gitarre(t, noten, vol) {
  noten.forEach((n, i) => {
    const s = t + i * .016, g = gain(s, .003, vol / noten.length * 2, 1.1), f = filter('lowpass', 1700, .9, g);
    osc(s, 'triangle', mtof(n), 1.1).connect(f);
  });
}
// Kontrabass bzw. Synth-Bass, mit Oberton, damit man ihn auch auf kleinen Handy-Lautsprechern hört
function bass(t, n, dauer, vol, typ = 'triangle', hell = 650) {
  const g = M.a.ctx.createGain(), f = filter('lowpass', hell, 1, g);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + .012);
  g.gain.exponentialRampToValueAtTime(vol * .45, t + dauer * .6);
  g.gain.exponentialRampToValueAtTime(.0001, t + dauer + .06);
  g.connect(M.out);
  osc(t, typ, mtof(n), dauer).connect(f);
  const o2 = osc(t, 'sine', mtof(n + 12), dauer), g2 = M.a.ctx.createGain();
  g2.gain.value = .3;
  o2.connect(g2).connect(f);
}
// Weiche Fläche (Penthouse)
function flaeche(t, noten, dauer, vol) {
  const g = M.a.ctx.createGain(), f = filter('lowpass', 1000, .3, g);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + dauer * .35);
  g.gain.setValueAtTime(vol, t + dauer * .8);
  g.gain.linearRampToValueAtTime(0, t + dauer + .4);
  g.connect(M.out);
  for (const n of noten) for (const d of [-8, 8]) { const o = osc(t, 'sawtooth', mtof(n), dauer + .4); o.detune.value = d; o.connect(f); }
}
// Bläser-Akzent (Grand Casino)
function blech(t, noten, dauer, vol) {
  const g = gain(t, .03, vol / noten.length * 2, dauer), f = filter('lowpass', 500, 1.5, g);
  f.frequency.setValueAtTime(500, t);
  f.frequency.linearRampToValueAtTime(2400, t + .06);
  f.frequency.exponentialRampToValueAtTime(900, t + dauer);
  for (const n of noten) for (const d of [-6, 6]) { const o = osc(t, 'sawtooth', mtof(n), dauer); o.detune.value = d; o.connect(f); }
}
// Vibraphon für die kleinen Melodien
function vibes(t, n, dauer, vol) {
  const g = gain(t, .004, vol, dauer);
  osc(t, 'sine', mtof(n), dauer).connect(g);
  const g2 = gain(t, .002, vol * .25, .25);
  osc(t, 'sine', mtof(n) * 4, .25).connect(g2);
}
// ---------- Schlagzeug ----------
function rauschen(t, dauer, typ, f, q, vol, an = .002) {
  const s = M.a.ctx.createBufferSource();
  s.buffer = M.a.rausch;
  s.connect(filter(typ, f, q, gain(t, an, vol, dauer)));
  s.start(t, Math.random()); s.stop(t + dauer + .2);
}
function kick(t, vol) {
  const o = osc(t, 'sine', 110, .35);
  o.frequency.setValueAtTime(110, t);
  o.frequency.exponentialRampToValueAtTime(42, t + .12);
  o.connect(gain(t, .003, vol, .3));
}
const besen = (t, vol) => rauschen(t, .2, 'bandpass', 2600, .6, vol, .03);
const hat = (t, vol, offen = false) => rauschen(t, offen ? .22 : .035, 'highpass', 7500, .5, vol);
const ride = (t, vol) => rauschen(t, .5, 'bandpass', 7200, 2.5, vol);
const shaker = (t, vol) => rauschen(t, .07, 'highpass', 6000, .5, vol, .025);
const klatsch = (t, vol) => { rauschen(t, .03, 'bandpass', 1400, 1, vol); rauschen(t + .012, .14, 'bandpass', 1500, .9, vol); };
function rim(t, vol) {
  osc(t, 'triangle', 1750, .04).connect(gain(t, .001, vol, .04));
  rauschen(t, .02, 'bandpass', 3000, 2, vol * .5);
}

// ---------- Bausteine ----------
// Walking Bass: Grundton auf der Eins, dann Akkordtöne, zum Schluss ein Ton, der zum nächsten Akkord hinführt
function laufbass(t, b, bar, nach, vol) {
  for (let s = 0; s < 4; s++) {
    const a = imSchlag(bar, s), wechsel = bar.length === 2 && s === 1;
    const n = s === 0 || (bar.length === 2 && s === 2) ? a[0]
      : s === 3 || wechsel ? (s === 3 ? nach[0] : bar[1][0]) + zufall([-1, 1, 7])
      : a[0] + zufall(AKK[a[1]].slice(1, 4));
    bass(t + s * b, tief(n), b * .92, vol);
  }
}
// Kleine Melodie aus Akkordtönen: wenige Töne, meist in kleinen Schritten
function melodie(t, b, bar, stellen, vol, ab = 67, chance = .5) {
  if (Math.random() > chance) return;
  const wahl = stellen.filter(() => Math.random() < .45).slice(0, 4);
  let letzte = M.melodie ?? ab + 5;
  for (const s of wahl) {
    const toene = lage(imSchlag(bar, s), ab).concat(lage(imSchlag(bar, s), ab + 12));
    const kand = toene.filter(y => y !== letzte);
    const m = Math.random() < .3 ? zufall(kand) : kand.reduce((x, y) => Math.abs(y - letzte) < Math.abs(x - letzte) ? y : x);
    vibes(t + s * b, m, b * 1.4, vol);
    letzte = M.melodie = m;
  }
}

// ---------- Die Stile ----------
const SW = .66; // Swing: die zweite Achtel kommt später
const STILE = {
  // Hinterzimmer: langsamer Shuffle-Blues in E, Saloon-Klavier, Besen
  1: {
    bpm: 72, hall: .2,
    akkorde: [40, 40, 40, 40, 45, 45, 40, 40, 47, 45, 40, 47].map(r => [[r, '7']]),
    takt({ t, b, bar, i }) {
      const a = bar[0], muster = i % 2 ? [10, 9, 7, 4] : [0, 4, 7, 9];
      muster.forEach((x, s) => bass(t + s * b, a[0] + x, b * .9, .2));
      [1, 3].forEach(s => klavier(t + s * b, lage(a, 56), b * .5, .05, 12));
      if (Math.random() < .5) klavier(t + (3 + SW) * b, lage(a, 56), b * .25, .03, 12);
      if (i % 4 === 3) { // kleiner Lauf in der Blues-Tonleiter
        const skala = [0, 3, 5, 6, 7, 10, 12].map(x => 64 + x);
        let k = 3 + Math.floor(Math.random() * 3);
        for (let s = 0; s < 6; s++) { klavier(t + (2 + s / 3) * b, [skala[k]], b * .4, .035, 12); k = Math.max(0, Math.min(6, k + zufall([-1, -1, 1, 2]))); }
      }
      for (let s = 0; s < 4; s++) { hat(t + s * b, .012); hat(t + (s + SW) * b, .008); }
      [1, 3].forEach(s => besen(t + s * b, .05));
      [0, 2].forEach(s => kick(t + s * b, .22));
    },
  },
  // Kellerclub: Cool Jazz in d-Moll, Walking Bass, E-Piano, Ride-Becken, ab und zu Vibraphon
  2: {
    bpm: 108, hall: .3,
    akkorde: [[[38, 'm9']], [[38, 'm9']], [[40, 'm7b5'], [45, '7b9']], [[38, 'm9']], [[43, 'm9']], [[43, 'm9']], [[40, 'm7b5'], [45, '7b9']], [[38, 'm9'], [45, '7b9']]],
    takt({ t, b, bar, nach, i }) {
      laufbass(t, b, bar, nach, .2);
      for (const s of zufall([[0, 1 + SW], [1 + SW, 3], [SW, 2 + SW], [0, 2]])) epiano(t + s * b, lage(imSchlag(bar, s), 53, true), b * .8, .045);
      [0, 1, 1 + SW, 2, 3, 3 + SW].forEach(s => ride(t + s * b, s % 1 ? .014 : .022));
      [1, 3].forEach(s => hat(t + s * b, .02));
      if (Math.random() < .3) besen(t + (2 + SW) * b, .02);
      melodie(t, b, bar, [0, 1, 1 + SW, 2, 2 + SW, 3], .035, 67, i % 8 < 4 ? .3 : .6);
    },
  },
  // Grand Casino: flotter Swing in B-Dur mit Bläsern
  3: {
    bpm: 138, hall: .28,
    akkorde: [[46, '6'], [43, 'm7'], [48, 'm7'], [41, '7'], [50, 'm7'], [43, '7b9'], [48, 'm7'], [41, '7']].map(a => [a]),
    takt({ t, b, bar, nach, i }) {
      laufbass(t, b, bar, nach, .22);
      for (const s of zufall([[0, 1 + SW], [1 + SW, 3], [1, 3]])) klavier(t + s * b, lage(bar[0], 55, true), b * .5, .045);
      [0, 1, 1 + SW, 2, 3, 3 + SW].forEach(s => ride(t + s * b, s % 1 ? .016 : .026));
      [1, 3].forEach(s => hat(t + s * b, .025));
      for (let s = 0; s < 4; s++) kick(t + s * b, .07);
      if (i % 4 === 1) blech(t + (1 + SW) * b, lage(bar[0], 60), b * .45, .03);
      if (i % 4 === 3) { blech(t + 2 * b, lage(bar[0], 60), b * .4, .028); blech(t + (3 + SW) * b, lage(nach, 60), b * 1.2, .032); }
      melodie(t, b, bar, [0, SW, 1, 2, 2 + SW, 3], .03, 70, .45);
    },
  },
  // Lounge: Bossa Nova in F, Nylon-Gitarre, Rimshot und Shaker
  4: {
    bpm: 132, hall: .25,
    akkorde: [[41, 'maj9'], [41, 'maj9'], [43, '9'], [43, '9'], [43, 'm9'], [48, '13'], [41, 'maj9'], [48, '13']].map(a => [a]),
    takt({ t, b, bar, i }) {
      const a = bar[0], r = tief(a[0]);
      [[0, r, 1.4], [1.5, r + 7, .45], [2, r + 7, 1.4], [3.5, r, .45]].forEach(([s, n, d]) => bass(t + s * b, tief(n), b * d, .2, 'sine', 500));
      (i % 2 ? [.5, 2, 3] : [0, 1.5, 2.5]).forEach(s => gitarre(t + s * b, lage(a, 52, true), .05));
      (i % 2 ? [1, 2] : [0, 1.5, 3]).forEach(s => rim(t + s * b, .035));
      for (let s = 0; s < 8; s++) shaker(t + s * b / 2, s % 2 ? .016 : .009);
      [[0, .2], [1.5, .1], [2, .2], [3.5, .1]].forEach(([s, v]) => kick(t + s * b, v));
      melodie(t, b, bar, [0, 1, 1.5, 2.5, 3], .03, 69, .5);
    },
  },
  // Penthouse: ruhiger Deep House in a-Moll, Fläche, E-Piano-Akkorde, Bass auf der Offbeat
  5: {
    bpm: 118, hall: .3,
    akkorde: [[45, 'm9'], [45, 'm9'], [41, 'maj9'], [41, 'maj9'], [38, 'm9'], [38, 'm9'], [40, 'm7'], [40, 'm7']].map(a => [a]),
    takt({ t, b, bar, i }) {
      const a = bar[0];
      for (let s = 0; s < 4; s++) { kick(t + s * b, .32); hat(t + (s + .5) * b, .016, true); hat(t + (s + .25) * b, .005); hat(t + (s + .75) * b, .005); }
      [1, 3].forEach(s => klatsch(t + s * b, .04));
      [.5, 1.5, 2.5, 3.5].forEach(s => bass(t + s * b, tief(a[0]), b * .4, .2, 'sine', 400));
      if (i % 2 === 0) flaeche(t, lage(a, 57), 8 * b, .008);
      [1.75, 3.5].forEach(s => epiano(t + s * b, lage(a, 60, true), b * .5, .03));
      melodie(t, b, bar, [0, 1, 2.5, 3], .022, 72, .3);
    },
  },
};

// ---------- Start und Stopp ----------
let hallPuffer = null;
function hall(ctx) {
  if (hallPuffer) return hallPuffer;
  const n = Math.floor(ctx.sampleRate * 1.8), buf = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3; }
  return hallPuffer = buf;
}
function planen() {
  const ctx = M.a.ctx, s = M.stil, b = 60 / s.bpm;
  if (M.t < ctx.currentTime) M.t = ctx.currentTime + .05; // nach einer Pause nicht alles auf einmal nachholen
  while (M.t < ctx.currentTime + .6) {
    const n = s.akkorde.length;
    try { s.takt({ t: M.t, b, bar: s.akkorde[M.i % n], nach: s.akkorde[(M.i + 1) % n][0], i: M.i }); } catch {}
    M.t += 4 * b;
    M.i++;
  }
}
export function musikStart(nr) {
  const a = audio();
  if (!a || !E.ton || !STILE[nr]) return;
  if (M?.nr === nr) return;
  musikStop();
  const ctx = a.ctx, out = ctx.createGain(), h = ctx.createConvolver(), nass = ctx.createGain(), jetzt = ctx.currentTime;
  out.gain.setValueAtTime(0, jetzt);
  out.gain.linearRampToValueAtTime(1, jetzt + 3); // sanft einblenden
  h.buffer = hall(ctx);
  nass.gain.value = STILE[nr].hall;
  out.connect(a.bus);
  out.connect(h).connect(nass).connect(a.bus);
  M = { a, nr, out, stil: STILE[nr], i: 0, t: jetzt + .3, melodie: null };
  M.timer = setInterval(planen, 100);
  planen();
}
export function musikStop() {
  if (!M) return;
  clearInterval(M.timer);
  const { out, a } = M, t = a.ctx.currentTime;
  out.gain.cancelScheduledValues(t);
  out.gain.setValueAtTime(out.gain.value, t);
  out.gain.linearRampToValueAtTime(0, t + .5);
  setTimeout(() => out.disconnect(), 800);
  M = null;
}

// Für test/musik.html: einen Stil ohne Hall in einen OfflineAudioContext rendern (a = { ctx, bus, rausch })
export function musikRendern(a, nr, takte) {
  const stil = STILE[nr], b = 60 / stil.bpm, n = stil.akkorde.length;
  M = { a, nr, out: a.bus, stil, melodie: null };
  for (let i = 0; i < takte; i++) stil.takt({ t: .05 + i * 4 * b, b, bar: stil.akkorde[i % n], nach: stil.akkorde[(i + 1) % n][0], i });
  M = null;
}
