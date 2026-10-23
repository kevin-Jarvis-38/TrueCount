// TrueCount – Tisch-Szene im Stil „Comic-Klassik“: zeichnet den Spielstand als SVG.
import { wert, hiLo } from './karten.js';
import { istBJ } from './tisch.js';
import { INK, THIN, FONT, S, ln, txt, fx, bust, lighten, darken } from './figuren.js';

const T = { rail: '#7b4a26', feltText: '#f6e7a1', shoe: '#b8322a', tray: '#6b4a2e', back: '#c0392b', plate: '#fff3c4', acc: '#ffcc00', card: '#fffdf5', red: '#d62828' };
const CW = 40, CH = 56; // Kartenmaß: 56 Einheiten = 88 mm
const DECK = 52 * 0.3 * CH / 88; // ein Deck ist ca. 15,6 mm dick
export const CHIPC = { 1: '#f2f2f2', 5: '#e63946', 25: '#2a9d5c', 100: '#262a36', 500: '#7b2cbf', 1000: '#f4a020', 5000: '#00a6c8' };
const DEALER = { kind: 'pinguin', body: 'smoking' };

// Sprechblase über dem Kopf, bei Plätzen rechts nach links gedreht
const bubble = (t, links) => `<g transform="translate(${links ? -30 : 30},-44) rotate(${links ? 8 : -8})">${S('ellipse', { cx: 0, cy: 0, rx: Math.max(24, t.length * 4.6 + 8), ry: 12, sw: 2 }, '#ffffff')}${txt(0, 4, t, 10, INK)}</g>`;

// ---------- Karten, Chips, Schuh, Ablage ----------
// Neue Karten fliegen aus dem Schuh herein. Die Uhrzeit merkt sich, wann eine Karte zum ersten Mal gezeichnet wurde,
// damit ein zweites Zeichnen kurz danach die Flug-Animation nicht abbricht.
const gesehen = new Map(), FLUG = 260;
let quelle = [0, 0], zaehlwerte = true;
// Marke links unter der Ecke mit dem Hi-Lo-Wert. Der linke Streifen bleibt sichtbar, wenn die nächste Karte darüber liegt.
const ZW = { 1: ['+1', '#2a9d5c'], 0: ['0', '#8d99ae'], '-1': ['−1', '#e63946'] };
const zaehlMarke = r => { const [t, f] = ZW[hiLo(r)]; return `<circle cx="${-CW / 2 + 8}" cy="9" r="7.5" fill="${f}" stroke="${INK}" stroke-width="1.2"/>` + `<text x="${-CW / 2 + 8}" y="12" font-family="system-ui, sans-serif" font-weight="800" font-size="8.5" fill="#fff" text-anchor="middle">${t}</text>`; };
export function karteSvg(k, x, y, sc = 1, rot = (k.id * 37) % 9 - 4, marke = zaehlwerte) {
  const col = k.s === '♥' || k.s === '♦' ? T.red : INK;
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${sc})" filter="url(#fx)">`
    + `<rect x="${-CW / 2}" y="${-CH / 2}" width="${CW}" height="${CH}" rx="${CW * .12}" fill="${T.card}" stroke="${INK}" stroke-width="2.2"/>`
    + `<text x="${-CW / 2 + 4}" y="${-CH / 2 + 14}" font-family="${FONT}, sans-serif" font-size="${k.r === '10' ? 11 : 13}" fill="${col}">${k.r}</text>`
    + `<text x="${-CW / 2 + 4}" y="${-CH / 2 + 25}" font-size="10" fill="${col}">${k.s}</text>`
    + txt(3, CH * .3, k.s, 24, col) + (marke ? zaehlMarke(k.r) : '') + '</g>';
}
function card(k, x, y, sc = 1) {
  const g = karteSvg(k, x, y, sc);
  const jetzt = performance.now();
  if (!gesehen.has(k.id)) gesehen.set(k.id, jetzt);
  const alt = jetzt - gesehen.get(k.id);
  if (alt >= FLUG) return g;
  return `<g class="neu" style="--fx:${(quelle[0] - x).toFixed(1)}px;--fy:${(quelle[1] - y).toFixed(1)}px;animation-delay:${-alt.toFixed(0)}ms">${g}</g>`;
}
function chipStack(x, y, betrag) {
  const l = [];
  for (const c of [5000, 1000, 500, 100, 25, 5, 1]) while (betrag >= c && l.length < 12) { l.push(c); betrag -= c; }
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
// Je besser der Tisch, desto edler der Raum: Holz im Hinterzimmer, Tapete im Club, Samt im Casino
const WAND = { 1: ['#4a2e1b', '#3a2313'], 2: ['#2b2d42', '#24263a'], 3: ['#5c1a2b', '#4d1524'], 4: ['#2a1f45', '#231a3a'], 5: ['#0b132b', '#121c3d'] };
function bg(L, nr) {
  const [a, b] = WAND[nr] || WAND[1];
  let s = `<rect x="-600" y="-600" width="${L.W + 1200}" height="${L.H + 1200}" fill="${a}"/>`;
  for (let x = -600; x < L.W + 600; x += 44) s += `<line x1="${x}" y1="-600" x2="${x}" y2="${L.H + 600}" stroke="${b}" stroke-width="${nr === 1 ? 3 : 10}"/>`;
  if (nr === 5) for (let i = 0; i < 40; i++) s += `<circle cx="${(i * 97) % L.W}" cy="${(i * 53) % (L.top - 30)}" r="${1 + (i % 3) * .5}" fill="#fff" opacity=".5"/>`;
  return s + `<rect x="-600" y="${L.top - 34}" width="${L.W + 1200}" height="9" fill="${darken(a, .4)}"/>`;
}
function table(L, r, nr, filz) {
  const cx = L.W / 2, t = L.top, R = 16, rail = nr >= 3 ? '#3b2416' : T.rail;
  const arc = (rx, ry) => `M${cx - rx},${t} A${rx},${ry} 0 0,0 ${cx + rx},${t}`;
  let defs = '';
  let s = `<path d="${arc(L.rx + R, L.ry + R)} Z" fill="${rail}" stroke="${INK}" stroke-width="4"/><path d="${arc(L.rx + R / 2, L.ry + R / 2)}" fill="none" stroke="${nr >= 4 ? '#d4af37' : lighten(rail, .25)}" stroke-width="3" opacity=".6"/>`
    + `<path d="${arc(L.rx, L.ry)} Z" fill="${filz}" stroke="${INK}" stroke-width="3"/>`;
  const [ki, kr, km] = L.arcs;
  defs += `<path id="tI" d="${arc(L.rx * ki, L.ry * ki)}"/><path id="tR" d="${arc(L.rx * kr, L.ry * kr)}"/><path id="tM" d="${arc(L.rx * km, L.ry * km)}"/>`;
  const on = (id, size, str, extra = '') => `<text font-family="${FONT}, sans-serif" font-size="${size}" fill="${T.feltText}" letter-spacing="1.5" ${extra}><textPath href="#${id}" startOffset="50%" text-anchor="middle">${str}</textPath></text>`;
  const limit = r.max === Infinity ? `AB ${r.min.toLocaleString('de-DE')} € · OHNE LIMIT` : `${r.min.toLocaleString('de-DE')} – ${r.max.toLocaleString('de-DE')} €`;
  s += `<path d="${arc(L.rx * ki + 5, L.ry * ki + 5)}" fill="none" stroke="${T.feltText}" stroke-width="1.5" opacity=".45"/>`
    + `<path d="${arc(L.rx * ki - 16, L.ry * ki - 16)}" fill="none" stroke="${T.feltText}" stroke-width="1.5" opacity=".45"/>`
    + on('tI', L.fs[0], 'VERSICHERUNG ZAHLT 2 ZU 1', 'opacity=".85"')
    + on('tR', L.fs[1], 'DEALER STEHT AUF SOFT 17', 'opacity=".7"')
    + on('tM', L.fs[2], 'BLACKJACK ZAHLT 3 ZU 2')
    + txt(cx, t + 13, `${r.name.toUpperCase()} · ${limit}`, 9, T.feltText, 'opacity=".7" letter-spacing="1"');
  if (nr === 1) { // Bierrand und Brandloch – es ist halt das Hinterzimmer
    const bx = cx + L.rx * .42, by = t + L.ry * .3;
    s += `<circle cx="${bx}" cy="${by}" r="13" fill="none" stroke="#3b2410" stroke-width="3" opacity=".25"/><circle cx="${bx + 4}" cy="${by + 2}" r="11" fill="none" stroke="#3b2410" stroke-width="2" opacity=".15"/>`
      + `<ellipse cx="${cx - L.rx * .36}" cy="${t + L.ry * .62}" rx="5" ry="3.5" fill="#1a0f08" opacity=".45"/>`;
  }
  return { s, defs };
}
function lamp(L, nr) {
  const cx = L.W / 2;
  if (nr >= 3) { // Kronleuchter
    return `<ellipse cx="${cx}" cy="${L.top + L.ry * .35}" rx="${L.rx * .8}" ry="${L.ry * .55}" fill="#ffe9a8" opacity=".07"/>`
      + `<line x1="${cx}" y1="-600" x2="${cx}" y2="0" stroke="${INK}" stroke-width="3"/>`
      + S('path', { d: `M${cx - 34},8 Q${cx},-6 ${cx + 34},8 L${cx + 26},16 L${cx - 26},16 Z` }, '#d4af37')
      + [-24, -12, 0, 12, 24].map(d => `<path d="M${cx + d},16 l-3,8 l3,5 l3,-5 Z" fill="#e0f7ff" stroke="${INK}" stroke-width="1"/>`).join('');
  }
  return `<ellipse cx="${cx}" cy="${L.top + L.ry * .35}" rx="${L.rx * .8}" ry="${L.ry * .55}" fill="#ffe9a8" opacity=".09"/>`
    + `<line x1="${cx}" y1="-600" x2="${cx}" y2="4" stroke="${INK}" stroke-width="3"/>`
    + S('path', { d: `M${cx - 28},22 L${cx - 14},2 L${cx + 14},2 L${cx + 28},22 Z` }, nr === 2 ? '#c1121f' : '#2a9d5c')
    + `<ellipse cx="${cx}" cy="23" rx="12" ry="4" fill="#fff6c8"/>`;
}

// ---------- Aufbau je nach Ausrichtung und Zahl der Plätze ----------
// Plätze von rechts nach links: Der Dealer teilt von seiner linken Seite aus.
function lay(n) {
  const hoch = innerWidth <= innerHeight, fuenf = n > 3;
  if (hoch) return {
    W: 400, H: 600, top: 120, rx: 230, ry: 330, dealer: [200, 80], dk: [200, 172], shoe: [336, 160], tray: [52, 160],
    seats: fuenf ? [[346, 346], [284, 430], [200, 476], [116, 430], [54, 346]] : [[338, 392], [200, 476], [62, 392]],
    bs: fuenf ? .78 : .95, ks: fuenf ? .8 : 1, k: [.26, .12], arcs: [.4, .48, .58], fs: [10, 8, 12], fokus: fuenf ? [0, 24, 400, 455] : [16, 24, 384, 455],
  };
  return {
    W: 800, H: 420, top: 104, rx: 440, ry: 270, dealer: [400, 64], dk: [400, 158], shoe: [655, 142], tray: [145, 142],
    seats: fuenf ? [[712, 250], [566, 318], [400, 350], [234, 318], [88, 250]] : [[630, 300], [400, 350], [170, 300]],
    bs: fuenf ? .7 : .82, ks: fuenf ? .85 : 1, k: [.26, .1], arcs: [.36, .43, .52], fs: [11, 9, 14], fokus: fuenf ? [30, 24, 770, 390] : [95, 24, 705, 390],
  };
}

const ERG = {
  blackjack: ['BLACKJACK!', T.acc, INK], gewonnen: ['GEWONNEN', '#2a9d5c', '#fff'], verloren: ['VERLOREN', '#e63946', '#fff'],
  bust: ['ÜBER 21', '#e63946', '#fff'], push: ['PUSH', T.plate, INK], aufgegeben: ['AUFGEGEBEN', '#8d99ae', '#fff'],
};
// Eine Hand: Karten leicht versetzt wie im Casino, darüber der Wert, nach der Runde das Ergebnis
function handSvg(h, x, y, sc, aktiv) {
  const m = h.karten.length, dx = 17 * sc, dy = 6 * sc, x0 = x - (m - 1) * dx / 2, y0 = y + (m - 1) * dy / 2;
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
  if (ui.setzen?.includes(i)) s += `<ellipse cx="${bx}" cy="${by}" rx="24" ry="14" fill="none" stroke="${T.acc}" stroke-width="3"><animate attributeName="opacity" values="1;.25;1" dur="1.6s" repeatCount="indefinite"/></ellipse>`;
  s += chipStack(bx, by, p.haende.reduce((a, h) => a + h.einsatz, 0));
  if (p.versicherung) s += chipStack(bx + (x > C[0] ? -30 : 30), by - 12, p.versicherung);
  const n = p.haende.length, sc = L.ks * (n > 2 ? .72 : n === 2 ? .86 : 1), sp = CW * sc + 12;
  p.haende.forEach((h, j) => { s += handSvg(h, cx + (j - (n - 1) / 2) * sp, cy, sc, t.phase === 'spielen' && t.ap === i && t.ah === j); });
  const sprich = ui.sprech && ui.sprech.platz === i ? bubble(ui.sprech.text, x > C[0]) : '';
  return { felt: s, bust: p.figur ? bust(p.figur, p.name, x, y, L.bs, sprich) : '' };
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

// Zeichnet den ganzen Tisch. ui: { nr, filz, setzen: Plätze mit blinkendem Setzfeld, sprech: { platz, text }, verdeckt, zaehlwerte }
export function zeichne(svg, t, ui) {
  const L = lay(t.plaetze.length);
  zaehlwerte = ui.zaehlwerte !== false;
  const tisch = table(L, t.regeln, ui.nr, ui.filz), schuh = shoe(L, t);
  const seats = t.plaetze.map((p, i) => seat(L, t, i, ui));
  const body = bg(L, ui.nr)
    + bust(DEALER, '', L.dealer[0], L.dealer[1], L.W > 500 ? .9 : 1)
    + tisch.s + lamp(L, ui.nr) + schuh + tray(L, t)
    + seats.map(s => s.felt).join('') + dealerSvg(L, t) + seats.map(s => s.bust).join('');
  svg.setAttribute('viewBox', ausschnitt(svg, L, ui.verdeckt || 0));
  svg.innerHTML = `<defs>${tisch.defs}</defs>${body}`;
}
