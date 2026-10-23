// TrueCount – Tisch-Szene im Stil „Comic-Klassik“ (Entwurf A): zeichnet den Spielstand als SVG.
// Figuren und Formen stammen aus entwuerfe/szene.js.
import { wert } from './karten.js';
import { istBJ } from './tisch.js';

const INK = '#1a1a1a', THIN = 2, FONT = "'Luckiest Guy'";
const T = { felt: '#2f8f4e', rail: '#7b4a26', feltText: '#f6e7a1', shoe: '#b8322a', tray: '#6b4a2e', back: '#c0392b', plate: '#fff3c4', acc: '#ffcc00', card: '#fffdf5', red: '#d62828' };
const CW = 40, CH = 56; // Kartenmaß: 56 Einheiten = 88 mm
const DECK = 52 * 0.3 * CH / 88; // ein Deck ist ca. 15,6 mm dick
export const CHIPC = { 1: '#f2f2f2', 5: '#e63946', 25: '#2a9d5c', 100: '#262a36', 500: '#7b2cbf', 1000: '#f4a020' };

// ---------- Farben ----------
const rgb = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
const hex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return hex(A.map((v, i) => v + (B[i] - v) * t)); };
const lighten = (c, t) => mix(c, '#ffffff', t), darken = (c, t) => mix(c, '#000000', t);

// ---------- SVG-Bausteine ----------
let uid = 0;
const at = o => Object.entries(o).map(([k, v]) => `${k}="${v}"`).join(' ');
const S = (tag, { sw = 3, ...o }, fill) => `<${tag} ${at(o)} fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;
const ln = (d, w = 2.5, col = INK, extra = '') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const txt = (x, y, s, size, fill, extra = '') => `<text x="${x}" y="${y}" font-family="${FONT}, sans-serif" font-size="${size}" fill="${fill}" text-anchor="middle" ${extra}>${s}</text>`;
const fx = inner => `<g filter="url(#fx)">${inner}</g>`;
const FILTER = '<filter id="fx" x="-20%" y="-20%" width="150%" height="160%"><feFlood flood-color="#000" flood-opacity=".38"/><feComposite in2="SourceAlpha" operator="in"/><feOffset dx="2" dy="4" result="s"/><feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';

function eye(x, y, r, o = {}) {
  const id = 'e' + (++uid), px = x + (o.dx || 0) * r * .35, py = y + (o.dy || 0) * r * .35;
  let s = `<clipPath id="${id}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath>`
    + `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.sclera || '#ffffff'}"/>`
    + `<circle cx="${px}" cy="${py}" r="${r * .48}" fill="#1a1a1a"/>`
    + `<circle cx="${px + r * .15}" cy="${py - r * .18}" r="${r * .16}" fill="#ffffff"/>`;
  if (o.lid) s += `<g clip-path="url(#${id})"><rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${2 * r * o.lid}" fill="${o.fur}"/>${ln(`M${x - r},${y - r + 2 * r * o.lid}H${x + r}`, THIN)}</g>`;
  return s + `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${INK}" stroke-width="${THIN}"/>`;
}

// ---------- Köpfe ----------
const HEADS = {
  fuchs: c => S('path', { d: 'M-25,-6 L-29,-46 L-5,-24 Z' }, c.fur) + S('path', { d: 'M25,-6 L29,-46 L5,-24 Z' }, c.fur)
    + S('path', { d: 'M-22,-14 L-25,-37 L-11,-23 Z', sw: 1.5 }, '#3a2320') + S('path', { d: 'M22,-14 L25,-37 L11,-23 Z', sw: 1.5 }, '#3a2320')
    + S('ellipse', { cx: 0, cy: 0, rx: 28, ry: 25 }, c.fur)
    + S('path', { d: 'M-27,4 Q-16,27 0,25 Q16,27 27,4 Q14,13 0,11 Q-14,13 -27,4 Z', sw: 2 }, '#fff4e6')
    + S('ellipse', { cx: 0, cy: 13, rx: 12, ry: 8, sw: 2 }, '#fff4e6')
    + S('ellipse', { cx: 0, cy: 8, rx: 5, ry: 3.6, sw: 1.5 }, '#1a1a1a')
    + eye(-11, -6, 7, { dx: .6, dy: .5, fur: c.fur }) + eye(11, -6, 8.5, { dx: -.3, dy: .6, fur: c.fur })
    + ln('M-5,17 Q0,21 5,17', THIN),
  gorilla: c => {
    const face = '#a08a7a';
    return S('circle', { cx: -29, cy: 0, r: 7.5 }, c.fur) + S('circle', { cx: 29, cy: 0, r: 7.5 }, c.fur)
      + S('ellipse', { cx: 0, cy: -3, rx: 30, ry: 28 }, c.fur)
      + S('path', { d: 'M-21,-6 Q-24,22 0,24 Q24,22 21,-6 Q10,-2 0,-8 Q-10,-2 -21,-6 Z', sw: 2.2 }, face)
      + S('path', { d: 'M-24,-9 Q-12,-20 0,-12 Q12,-20 24,-9 Q12,-12 0,-6 Q-12,-12 -24,-9 Z', sw: 2 }, darken(c.fur, .15))
      + eye(-9, -1, 5.5, { lid: .5, dy: .4, fur: face }) + eye(9, -1, 6.5, { lid: .55, dy: .4, fur: face })
      + `<ellipse cx="-4" cy="10" rx="2.6" ry="2" fill="${INK}"/><ellipse cx="4" cy="10" rx="2.6" ry="2" fill="${INK}"/>`
      + ln('M-10,18 Q0,15 10,18', THIN * 1.2)
      + `<g transform="rotate(14 6 17)">${S('rect', { x: 6, y: 15, width: 20, height: 4.5, rx: 1, sw: 1.5 }, '#f5f0e6')}${S('rect', { x: 23, y: 15, width: 4, height: 4.5, sw: 1.5 }, '#ff6b1a')}</g>`
      + ln('M30,12 q6,-7 0,-13 q-6,-7 2,-15', 2.5, '#c9c9c9', 'opacity=".7"');
  },
  hase: c => {
    const ear = (x, r) => `<g transform="translate(${x},-22) rotate(${r})">${S('ellipse', { cx: 0, cy: -20, rx: 7.5, ry: 21 }, c.fur)}${S('ellipse', { cx: 0, cy: -19, rx: 3.6, ry: 14, sw: 1.2 }, '#f4a6b8')}</g>`;
    return ear(-10, -14) + ear(11, 24)
      + S('circle', { cx: 0, cy: 0, r: 25 }, c.fur)
      + S('rect', { x: -26, y: -20, width: 52, height: 7, rx: 2, sw: 2 }, '#e63946')
      + S('path', { d: 'M24,-17 L37,-23 L33,-13 Z M24,-15 L35,-7 L28,-5 Z', sw: 1.5 }, '#e63946')
      + S('ellipse', { cx: -6, cy: 10, rx: 8, ry: 6, sw: 1.8 }, '#ffffff') + S('ellipse', { cx: 6, cy: 10, rx: 8, ry: 6, sw: 1.8 }, '#ffffff')
      + S('path', { d: 'M-3,4 L3,4 L0,8 Z', sw: 1 }, '#f06292')
      + S('rect', { x: -4, y: 14, width: 8, height: 7, rx: 1, sw: 1.5 }, '#ffffff') + ln('M0,14 V21', 1)
      + eye(-10, -3, 5.5, { dy: .3, fur: c.fur }) + eye(10, -3, 5.5, { dy: .3, fur: c.fur })
      + ln('M-18,-12 L-5,-6', 4) + ln('M18,-12 L5,-6', 4);
  },
  pinguin: () => S('circle', { cx: 0, cy: 0, r: 27 }, '#262a36')
    + S('path', { d: 'M0,-10 C-8,-19 -22,-14 -21,2 C-20,18 -8,23 0,23 C8,23 20,18 21,2 C22,-14 8,-19 0,-10 Z', sw: 2 }, '#f5f5f5')
    + eye(-8, -1, 5.5, { dx: .3, fur: '#f5f5f5' }) + eye(8, -1, 5, { dx: .3, fur: '#f5f5f5' })
    + S('path', { d: 'M-8,8 Q0,5 8,8 L0,18 Z', sw: 2 }, '#f4a020')
    + S('path', { d: 'M-26,-12 Q0,-30 26,-12 L33,-5 Q0,-20 -33,-5 Z', sw: 2 }, '#2a9d5c'),
};

// ---------- Oberkörper ----------
const torso = col => S('path', { d: 'M-42,84 C-42,46 -28,26 0,26 C28,26 42,46 42,84 Z' }, col);
const stains = pts => pts.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .75}" fill="#a07838" opacity=".5"/>`).join('');
const BODIES = {
  feinripp: c => torso(c.fur) + S('path', { d: 'M-25,84 L-22,44 Q-17,34 -12,31 Q0,48 12,31 Q17,34 22,44 L25,84 Z' }, '#ece8dc') + stains([[-8, 52, 5], [10, 64, 3.5], [-12, 70, 2.5]]),
  muskel: c => torso(c.fur) + S('path', { d: 'M-25,84 L-22,44 Q-17,34 -12,31 Q0,46 12,31 Q17,34 22,44 L25,84 Z' }, '#3d405b') + ln('M-10,54 Q0,62 10,54', 1.5, '#ffffff', 'opacity=".5"'),
  hoodie: c => torso(c.shirt) + S('path', { d: 'M-20,30 Q0,46 20,30 Q12,40 0,42 Q-12,40 -20,30 Z', sw: 2 }, darken(c.shirt, .22))
    + ln('M-6,42 L-8,60 M6,42 L8,60', 2.2, '#ffffff') + S('path', { d: 'M-16,66 L16,66 L13,80 L-13,80 Z', sw: 2 }, darken(c.shirt, .12)),
  smoking: () => torso('#262a36') + S('path', { d: 'M-13,27 L0,62 L13,27 Z', sw: 2 }, '#f5f5f5')
    + S('path', { d: 'M0,34 L-12,28 L-12,40 Z M0,34 L12,28 L12,40 Z', sw: 2 }, '#e63946') + S('circle', { cx: 0, cy: 34, r: 3, sw: 1.5 }, '#e63946'),
};

const FIGUREN = {
  joe: { kind: 'gorilla', body: 'feinripp', fur: '#4a4654' },
  du: { kind: 'fuchs', body: 'hoodie', fur: '#e8772e', shirt: '#3a86ff' },
  rudi: { kind: 'hase', body: 'muskel', fur: '#d7d2cc' },
  dealer: { kind: 'pinguin', body: 'smoking' },
};

function bust(f, name, x, y, s, extra = '') {
  const w = Math.max(54, name.length * 7.2 + 16);
  const plate = name ? `<rect x="${-w / 2}" y="54" width="${w}" height="19" rx="9.5" fill="${T.plate}" stroke="${INK}" stroke-width="${THIN}"/>` + txt(0, 68, name, 11, INK) : '';
  return `<g transform="translate(${x},${y}) scale(${s})">${fx(BODIES[f.body](f) + HEADS[f.kind](f))}${plate}${extra}</g>`;
}
// Sprechblase über dem Kopf, bei Plätzen rechts nach links gedreht
const bubble = (t, links) => `<g transform="translate(${links ? -30 : 30},-44) rotate(${links ? 8 : -8})">${S('ellipse', { cx: 0, cy: 0, rx: Math.max(24, t.length * 4.6 + 8), ry: 12, sw: 2 }, '#ffffff')}${txt(0, 4, t, 10, INK)}</g>`;

// ---------- Karten, Chips, Schuh, Ablage ----------
// Neue Karten fliegen aus dem Schuh herein. Die Uhrzeit merkt sich, wann eine Karte zum ersten Mal gezeichnet wurde,
// damit ein zweites Zeichnen kurz danach die Flug-Animation nicht abbricht.
const gesehen = new Map(), FLUG = 260;
let quelle = [0, 0];
function card(k, x, y, sc = 1) {
  const rot = (k.id * 37) % 9 - 4, col = k.s === '♥' || k.s === '♦' ? T.red : INK;
  const g = `<g transform="translate(${x},${y}) rotate(${rot}) scale(${sc})" filter="url(#fx)">`
    + `<rect x="${-CW / 2}" y="${-CH / 2}" width="${CW}" height="${CH}" rx="${CW * .12}" fill="${T.card}" stroke="${INK}" stroke-width="2.2"/>`
    + `<text x="${-CW / 2 + 4}" y="${-CH / 2 + 14}" font-family="${FONT}, sans-serif" font-size="${k.r === '10' ? 11 : 13}" fill="${col}">${k.r}</text>`
    + `<text x="${-CW / 2 + 4}" y="${-CH / 2 + 25}" font-size="10" fill="${col}">${k.s}</text>`
    + txt(3, CH * .3, k.s, 24, col) + '</g>';
  const jetzt = performance.now();
  if (!gesehen.has(k.id)) gesehen.set(k.id, jetzt);
  const alt = jetzt - gesehen.get(k.id);
  if (alt >= FLUG) return g;
  return `<g class="neu" style="--fx:${(quelle[0] - x).toFixed(1)}px;--fy:${(quelle[1] - y).toFixed(1)}px;animation-delay:${-alt.toFixed(0)}ms">${g}</g>`;
}
function chipStack(x, y, betrag) {
  const l = [];
  for (const c of [100, 25, 5, 1]) while (betrag >= c && l.length < 12) { l.push(c); betrag -= c; }
  return fx(l.map((v, i) => {
    const cy = y - i * 4.2, col = CHIPC[v];
    return S('ellipse', { cx: x, cy: cy + 2, rx: 15, ry: 6.5, sw: 2 }, darken(col, .25)) + S('ellipse', { cx: x, cy, rx: 15, ry: 6.5, sw: 2 }, col)
      + `<ellipse cx="${x}" cy="${cy}" rx="11" ry="4.6" fill="none" stroke="${v === 1 ? '#3a86ff' : '#ffffff'}" stroke-width="2.2" stroke-dasharray="3.5 3"/>`;
  }).join(''));
}
const badge = (x, y, t, fill = T.plate, col = INK) => {
  const w = Math.max(34, String(t).length * 8 + 12);
  return fx(`<rect x="${x - w / 2}" y="${y - 10}" width="${w}" height="19" rx="9.5" fill="${fill}" stroke="${INK}" stroke-width="${THIN}"/>` + txt(x, y + 4.5, t, 11, col));
};
function wertBadge(x, y, karten, bj) {
  if (bj) return badge(x, y, 'BJ', T.acc);
  const { summe, soft } = wert(karten);
  if (summe > 21) return badge(x, y, summe, '#e63946', '#fff');
  return badge(x, y, soft && summe < 21 ? `${summe - 10}/${summe}` : summe);
}

// Schuh: im echten Größenverhältnis zur Karte, die gelbe Schnittkarte steckt zwischen den Karten
function shoe(L, t) {
  const [x, y] = L.shoe, sch = t.schuh, len = t.regeln.decks * DECK, x0 = x - len / 2;
  const rest = (sch.karten.length - sch.pos) / 52 * DECK;
  quelle = [x0 - 6, y];
  let s = S('path', { d: `M${x0 - 16},${y + 20} L${x + len / 2 + 8},${y + 20} L${x + len / 2 + 8},${y - 19} L${x0 + 2},${y - 19} Z` }, T.shoe);
  s += `<rect x="${x0}" y="${y - 15}" width="${rest}" height="30" fill="${T.card}" stroke="${INK}" stroke-width="1"/>`;
  for (let i = 1.6; i < rest; i += 1.6) s += `<line x1="${x0 + i}" y1="${y - 15}" x2="${x0 + i}" y2="${y + 15}" stroke="#00000033" stroke-width=".6"/>`;
  if (sch.schnitt > sch.pos) {
    const cx = x0 + (sch.schnitt - sch.pos) / 52 * DECK;
    s += `<rect x="${cx - 1.2}" y="${y - 18}" width="2.4" height="36" fill="${T.acc}" stroke="${INK}" stroke-width=".8"/>`;
  }
  s += S('path', { d: `M${x0 - 13},${y + 18} L${x0 - 1},${y - 15} L${x0 + 3},${y - 15} L${x0 - 9},${y + 18} Z`, sw: 1.5 }, T.back);
  return fx(s) + txt(x, y + 34, 'SCHUH', 8, T.feltText, 'opacity=".75" letter-spacing="1"');
}
// Ablage: so hoch wie der Stapel der gespielten Karten
function tray(L, t) {
  const [x, y] = L.tray, H = t.regeln.decks * DECK + 6, st = Math.min(t.ablage / 52 * DECK, H - 6), w = CW + 10;
  let s = S('rect', { x: x - w / 2, y: y - H / 2, width: w, height: H, rx: 4 }, T.tray);
  s += `<rect x="${x - w / 2 + 5}" y="${y + H / 2 - 3 - st}" width="${w - 10}" height="${st}" fill="${T.card}" stroke="${INK}" stroke-width="1"/>`;
  for (let i = 1.6; i < st; i += 1.6) s += `<line x1="${x - w / 2 + 5}" y1="${y + H / 2 - 3 - i}" x2="${x + w / 2 - 5}" y2="${y + H / 2 - 3 - i}" stroke="#00000033" stroke-width=".6"/>`;
  return fx(s) + txt(x, y + H / 2 + 13, 'ABLAGE', 8, T.feltText, 'opacity=".75" letter-spacing="1"');
}

// ---------- Hintergrund und Tisch ----------
function bg(L) {
  let s = `<rect x="-600" y="-600" width="${L.W + 1200}" height="${L.H + 1200}" fill="#4a2e1b"/>`;
  for (let x = -600; x < L.W + 600; x += 44) s += `<line x1="${x}" y1="-600" x2="${x}" y2="${L.H + 600}" stroke="#3a2313" stroke-width="3"/>`;
  return s + `<rect x="-600" y="${L.top - 34}" width="${L.W + 1200}" height="9" fill="#2e1b0e"/>`;
}
function table(L, r) {
  const cx = L.W / 2, t = L.top, R = 16;
  const arc = (rx, ry) => `M${cx - rx},${t} A${rx},${ry} 0 0,0 ${cx + rx},${t}`;
  let defs = '';
  let s = `<path d="${arc(L.rx + R, L.ry + R)} Z" fill="${T.rail}" stroke="${INK}" stroke-width="4"/><path d="${arc(L.rx + R / 2, L.ry + R / 2)}" fill="none" stroke="${lighten(T.rail, .25)}" stroke-width="3" opacity=".6"/>`
    + `<path d="${arc(L.rx, L.ry)} Z" fill="${T.felt}" stroke="${INK}" stroke-width="3"/>`;
  const [ki, kr, km] = L.arcs;
  defs += `<path id="tI" d="${arc(L.rx * ki, L.ry * ki)}"/><path id="tR" d="${arc(L.rx * kr, L.ry * kr)}"/><path id="tM" d="${arc(L.rx * km, L.ry * km)}"/>`;
  const on = (id, size, str, extra = '') => `<text font-family="${FONT}, sans-serif" font-size="${size}" fill="${T.feltText}" letter-spacing="1.5" ${extra}><textPath href="#${id}" startOffset="50%" text-anchor="middle">${str}</textPath></text>`;
  s += `<path d="${arc(L.rx * ki + 5, L.ry * ki + 5)}" fill="none" stroke="${T.feltText}" stroke-width="1.5" opacity=".45"/>`
    + `<path d="${arc(L.rx * ki - 16, L.ry * ki - 16)}" fill="none" stroke="${T.feltText}" stroke-width="1.5" opacity=".45"/>`
    + on('tI', L.fs[0], 'VERSICHERUNG ZAHLT 2 ZU 1', 'opacity=".85"')
    + on('tR', L.fs[1], 'DEALER STEHT AUF SOFT 17', 'opacity=".7"')
    + on('tM', L.fs[2], 'BLACKJACK ZAHLT 3 ZU 2')
    + txt(cx, t + 13, `${r.name.toUpperCase()} · ${r.min} – ${r.max} €`, 9, T.feltText, 'opacity=".7" letter-spacing="1"');
  // Bierrand und Brandloch – es ist halt das Hinterzimmer
  const bx = cx + L.rx * .42, by = t + L.ry * .3;
  s += `<circle cx="${bx}" cy="${by}" r="13" fill="none" stroke="#3b2410" stroke-width="3" opacity=".25"/><circle cx="${bx + 4}" cy="${by + 2}" r="11" fill="none" stroke="#3b2410" stroke-width="2" opacity=".15"/>`
    + `<ellipse cx="${cx - L.rx * .36}" cy="${t + L.ry * .62}" rx="5" ry="3.5" fill="#1a0f08" opacity=".45"/>`;
  return { s, defs };
}
function lamp(L) {
  const cx = L.W / 2;
  return `<ellipse cx="${cx}" cy="${L.top + L.ry * .35}" rx="${L.rx * .8}" ry="${L.ry * .55}" fill="#ffe9a8" opacity=".09"/>`
    + `<line x1="${cx}" y1="-600" x2="${cx}" y2="4" stroke="${INK}" stroke-width="3"/>`
    + S('path', { d: `M${cx - 28},22 L${cx - 14},2 L${cx + 14},2 L${cx + 28},22 Z` }, '#2a9d5c')
    + `<ellipse cx="${cx}" cy="23" rx="12" ry="4" fill="#fff6c8"/>`;
}

// ---------- Aufbau je nach Ausrichtung ----------
// Plätze von rechts nach links: Der Dealer teilt von seiner linken Seite aus.
function lay() {
  if (innerWidth <= innerHeight) return {
    W: 400, H: 600, top: 120, rx: 230, ry: 330, dealer: [200, 80], dk: [200, 172], shoe: [336, 160], tray: [52, 160],
    seats: [[338, 392], [200, 476], [62, 392]], bs: .95, k: [.26, .12], arcs: [.4, .48, .58], fs: [10, 8, 12], fokus: [16, 24, 384, 455],
  };
  return {
    W: 800, H: 420, top: 104, rx: 440, ry: 270, dealer: [400, 64], dk: [400, 158], shoe: [655, 142], tray: [145, 142],
    seats: [[630, 300], [400, 350], [170, 300]], bs: .82, k: [.26, .1], arcs: [.36, .43, .52], fs: [11, 9, 14], fokus: [95, 24, 705, 390],
  };
}

const ERG = {
  blackjack: ['BLACKJACK!', T.acc, INK], gewonnen: ['GEWONNEN', '#2a9d5c', '#fff'], verloren: ['VERLOREN', '#e63946', '#fff'],
  bust: ['ÜBER 21', '#e63946', '#fff'], push: ['PUSH', T.plate, INK], aufgegeben: ['AUFGEGEBEN', '#8d99ae', '#fff'],
};
// Eine Hand: Karten leicht versetzt wie im Casino, darüber der Wert, nach der Runde das Ergebnis
function handSvg(h, x, y, sc, aktiv) {
  const m = h.karten.length, dx = 14 * sc, dy = 6 * sc, x0 = x - (m - 1) * dx / 2, y0 = y + (m - 1) * dy / 2;
  const top = y0 - (m - 1) * dy - CH * sc / 2;
  let s = '';
  if (aktiv) s += `<rect x="${x0 - CW * sc / 2 - 6}" y="${top - 6}" width="${(m - 1) * dx + CW * sc + 12}" height="${(m - 1) * dy + CH * sc + 12}" rx="8" fill="none" stroke="${T.acc}" stroke-width="3"><animate attributeName="opacity" values="1;.3;1" dur="1.2s" repeatCount="indefinite"/></rect>`;
  h.karten.forEach((k, j) => { s += card(k, x0 + j * dx, y0 - j * dy, sc); });
  if (!m) return s;
  s += wertBadge(x, top - 12, h.karten, istBJ(h));
  if (h.verdoppelt) s += badge(x0 - CW * sc / 2 - 2, y0 + CH * sc / 2 - 8, '×2', '#f4a020', '#fff');
  if (h.ergebnis) {
    const [t, f, c] = ERG[h.ergebnis], w = t.length * 7 + 14, ey = y0 + CH * sc / 2;
    s += `<g transform="rotate(-6 ${x} ${ey})">` + fx(`<rect x="${x - w / 2}" y="${ey - 10}" width="${w}" height="18" rx="4" fill="${f}" stroke="${INK}" stroke-width="2"/>` + txt(x, ey + 4, t, 10, c)) + '</g>';
  }
  return s;
}
function dealerSvg(L, t) {
  const [x, y] = L.dk, d = t.dealer;
  if (!d.length) return '';
  const n = Math.max(d.length, 2), dx = 26, x0 = x - (n - 1) * dx / 2;
  let s = '';
  if (d.length === 1) s += `<rect x="${x0 + dx - CW / 2}" y="${y - CH / 2}" width="${CW}" height="${CH}" rx="5" fill="none" stroke="${T.feltText}" stroke-width="1.5" stroke-dasharray="4 3" opacity=".55"/>`
    + txt(x0 + dx, y + 6, '?', 18, T.feltText, 'opacity=".55"');
  d.forEach((k, j) => { s += card(k, x0 + j * dx, y); });
  return s + wertBadge(x0 + (n - 1) * dx + CW / 2 + 24, y - 14, d, d.length === 2 && wert(d).summe === 21);
}
function seat(L, t, i, ui) {
  const p = t.plaetze[i], [x, y] = L.seats[i], C = [L.W / 2, L.top];
  const pt = k => [x + (C[0] - x) * k, y + (C[1] - y) * k];
  const [cx, cy] = pt(L.k[0]), [bx, by] = pt(L.k[1]);
  let s = `<ellipse cx="${bx}" cy="${by}" rx="20" ry="11" fill="none" stroke="${T.feltText}" stroke-width="2" opacity=".55"/>`;
  if (i === ui.du && (t.phase === 'setzen' || t.phase === 'fertig')) s += `<ellipse cx="${bx}" cy="${by}" rx="24" ry="14" fill="none" stroke="${T.acc}" stroke-width="3"><animate attributeName="opacity" values="1;.25;1" dur="1.6s" repeatCount="indefinite"/></ellipse>`;
  s += chipStack(bx, by, p.haende.reduce((a, h) => a + h.einsatz, 0));
  if (p.versicherung) s += chipStack(bx + (x > C[0] ? -30 : 30), by - 12, p.versicherung);
  const n = p.haende.length, sc = n > 2 ? .72 : n === 2 ? .86 : 1, sp = CW * sc + 12;
  p.haende.forEach((h, j) => { s += handSvg(h, cx + (j - (n - 1) / 2) * sp, cy, sc, t.phase === 'spielen' && t.ap === i && t.ah === j); });
  const sprich = ui.sprech && ui.sprech.platz === i ? bubble(ui.sprech.text, x > C[0]) : '';
  return { felt: s, bust: bust(FIGUREN[p.figur], p.name, x, y, L.bs, sprich) };
}

// Bildausschnitt: Der Fokus-Bereich (Dealer bis zu deinen Karten) füllt die Breite bzw. den freien Platz über den Knöpfen.
// Die Szene läuft hinter den Knöpfen weiter (verdeckt = Pixel unten), deine Figur verschwindet dort zur Hälfte.
// Die Größe hängt nur von Bildschirm und Ausrichtung ab, deshalb zoomt nichts mehr.
function ausschnitt(svg, L, verdeckt) {
  const { width: w, height: h } = svg.getBoundingClientRect(), [x0, y0, x1, y1] = L.fokus;
  if (!w || !h) return `0 0 ${L.W} ${L.H}`;
  const frei = Math.max(h - verdeckt, 50), s = Math.min(w / (x1 - x0), frei / (y1 - y0));
  const rest = frei / s - (y1 - y0);
  return `${(x0 + x1) / 2 - w / s / 2} ${y0 - rest * .3} ${w / s} ${h / s}`;
}

// Zeichnet den ganzen Tisch. ui: { du: Platz des Spielers, sprech: { platz, text }, verdeckt }
export function zeichne(svg, t, ui) {
  const L = lay();
  uid = 0;
  const tisch = table(L, t.regeln), schuh = shoe(L, t);
  const seats = t.plaetze.map((p, i) => seat(L, t, i, ui));
  const body = bg(L)
    + bust(FIGUREN.dealer, '', L.dealer[0], L.dealer[1], L.W > 500 ? .9 : 1)
    + tisch.s + lamp(L) + schuh + tray(L, t)
    + seats.map(s => s.felt).join('') + dealerSvg(L, t) + seats.map(s => s.bust).join('');
  svg.setAttribute('viewBox', ausschnitt(svg, L, ui.verdeckt || 0));
  svg.innerHTML = `<defs>${FILTER}${tisch.defs}</defs>${body}`;
}
