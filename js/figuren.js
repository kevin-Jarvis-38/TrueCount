// TrueCount – Figuren im Stil „Comic-Klassik“: Köpfe, Oberkörper, Accessoires und die Auswahl für Charakter und Shop.
// Der Schatten-Filter #fx liegt einmal in index.html, damit alle SVGs ihn nutzen können.

export const INK = '#1a1a1a', THIN = 2, FONT = "'Luckiest Guy'";

// ---------- Farben ----------
const rgb = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
const hex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return hex(A.map((v, i) => v + (B[i] - v) * t)); };
export const lighten = (c, t) => mix(c, '#ffffff', t), darken = (c, t) => mix(c, '#000000', t);

// ---------- SVG-Bausteine ----------
let uid = 0; // läuft immer weiter, damit Clip-IDs im ganzen Dokument eindeutig bleiben
const at = o => Object.entries(o).map(([k, v]) => `${k}="${v}"`).join(' ');
export const S = (tag, { sw = 3, ...o }, fill) => `<${tag} ${at(o)} fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;
export const ln = (d, w = 2.5, col = INK, extra = '') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
export const txt = (x, y, s, size, fill, extra = '') => `<text x="${x}" y="${y}" font-family="${FONT}, sans-serif" font-size="${size}" fill="${fill}" text-anchor="middle" ${extra}>${s}</text>`;
export const fx = inner => `<g filter="url(#fx)">${inner}</g>`;

function eye(x, y, r, o = {}) {
  const id = 'e' + (++uid), px = x + (o.dx || 0) * r * .35, py = y + (o.dy || 0) * r * .35;
  let s = `<clipPath id="${id}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath>`
    + `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.sclera || '#ffffff'}"/>`
    + `<circle cx="${px}" cy="${py}" r="${r * .48}" fill="#1a1a1a"/>`
    + `<circle cx="${px + r * .15}" cy="${py - r * .18}" r="${r * .16}" fill="#ffffff"/>`;
  if (o.lid) s += `<g clip-path="url(#${id})"><rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${2 * r * o.lid}" fill="${o.fur}"/>${ln(`M${x - r},${y - r + 2 * r * o.lid}H${x + r}`, THIN)}</g>`;
  return s + `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${INK}" stroke-width="${THIN}"/>`;
}
const zaehne = pts => pts.map(([x, y]) => `<path d="M${x - 3},${y} L${x},${y + 5} L${x + 3},${y} Z" fill="#fff" stroke="${INK}" stroke-width="1"/>`).join('');

// ---------- Köpfe ----------
// Augenhöhe und Augenabstand je Tier (für die Sonnenbrille), Oberkante des Kopfes (für Hüte)
const AUGEN = { fuchs: [-6, 11], gorilla: [-1, 9], hase: [-3, 10], pinguin: [-1, 8], hyaene: [-6, 10], kater: [-4, 11], hund: [-6, 10], esel: [-8, 10], krokodil: [-21, 13], koala: [-6, 12], lama: [-6, 9], kaenguru: [-7, 10] };
const OBEN = { fuchs: -24, gorilla: -29, hase: -24, pinguin: -26, hyaene: -23, kater: -24, hund: -24, esel: -30, krokodil: -29, koala: -22, lama: -34, kaenguru: -25 };

const HEADS = {
  fuchs: c => S('path', { d: 'M-25,-6 L-29,-46 L-5,-24 Z' }, c.fur) + S('path', { d: 'M25,-6 L29,-46 L5,-24 Z' }, c.fur)
    + S('path', { d: 'M-22,-14 L-25,-37 L-11,-23 Z', sw: 1.5 }, '#3a2320') + S('path', { d: 'M22,-14 L25,-37 L11,-23 Z', sw: 1.5 }, '#3a2320')
    + S('ellipse', { cx: 0, cy: 0, rx: 28, ry: 25 }, c.fur)
    + S('path', { d: 'M-27,4 Q-16,27 0,25 Q16,27 27,4 Q14,13 0,11 Q-14,13 -27,4 Z', sw: 2 }, '#fff4e6')
    + S('ellipse', { cx: 0, cy: 13, rx: 12, ry: 8, sw: 2 }, '#fff4e6')
    + S('ellipse', { cx: 0, cy: 8, rx: 5, ry: 3.6, sw: 1.5 }, INK)
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
      + ln('M-10,18 Q0,15 10,18', THIN * 1.2);
  },
  hase: c => {
    const ear = (x, r) => `<g transform="translate(${x},-22) rotate(${r})">${S('ellipse', { cx: 0, cy: -20, rx: 7.5, ry: 21 }, c.fur)}${S('ellipse', { cx: 0, cy: -19, rx: 3.6, ry: 14, sw: 1.2 }, '#f4a6b8')}</g>`;
    return ear(-10, -14) + ear(11, 24)
      + S('circle', { cx: 0, cy: 0, r: 25 }, c.fur)
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
  hyaene: c => S('circle', { cx: -21, cy: -18, r: 9 }, c.fur) + S('circle', { cx: 21, cy: -18, r: 9 }, c.fur)
    + S('circle', { cx: -21, cy: -18, r: 4.5, sw: 1 }, '#5a4632') + S('circle', { cx: 21, cy: -18, r: 4.5, sw: 1 }, '#5a4632')
    + S('ellipse', { cx: 0, cy: 0, rx: 27, ry: 24 }, c.fur)
    + [[-15, -12, 3.5], [14, -14, 3], [-20, 2, 2.6], [19, 4, 3], [4, -18, 2.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#6b4f2e" opacity=".75"/>`).join('')
    + S('ellipse', { cx: 0, cy: 11, rx: 15, ry: 10, sw: 2 }, '#8a6a44')
    + S('ellipse', { cx: 0, cy: 5, rx: 5, ry: 3.5, sw: 1.2 }, INK)
    + S('path', { d: 'M-12,12 Q0,27 12,12 Q0,16 -12,12 Z', sw: 2 }, '#ffffff') + ln('M-6,14 L-5,19 M0,15 V21 M6,14 L5,19', 1)
    + `<ellipse cx="-17" cy="6" rx="5" ry="3" fill="#ff5d73" opacity=".65"/><ellipse cx="17" cy="6" rx="5" ry="3" fill="#ff5d73" opacity=".65"/>`
    + eye(-10, -6, 6, { dx: .8, dy: -.2, lid: .35, fur: c.fur }) + eye(10, -7, 6.5, { dx: -.8, dy: .4, lid: .3, fur: c.fur }),
  kater: c => S('path', { d: 'M-29,-4 L-31,-31 L-10,-22 Z' }, c.fur) + S('path', { d: 'M29,-4 L31,-31 L10,-22 Z' }, c.fur)
    + S('ellipse', { cx: 0, cy: 0, rx: 31, ry: 25 }, c.fur)
    + S('ellipse', { cx: -7, cy: 10, rx: 8, ry: 6, sw: 1.8 }, '#fff4e6') + S('ellipse', { cx: 7, cy: 10, rx: 8, ry: 6, sw: 1.8 }, '#fff4e6')
    + S('path', { d: 'M-3,5 L3,5 L0,9 Z', sw: 1 }, '#f06292')
    + ln('M-14,9 L-32,6 M-14,12 L-32,13 M14,9 L32,6 M14,12 L32,13', 1.2)
    + eye(-11, -4, 6.5, { lid: .5, dy: .3, sclera: c.muede ? '#ffc9c9' : '#ffffff', fur: c.fur }) + eye(11, -4, 6.5, { lid: .55, dy: .3, sclera: c.muede ? '#ffc9c9' : '#ffffff', fur: c.fur })
    + ln('M-6,18 Q0,22 8,16', THIN * 1.2),
  hund: c => {
    const ohr = s => S('path', { d: `M${s * 16},-20 Q${s * 38},-20 ${s * 36},6 Q${s * 33},20 ${s * 23},12 Q${s * 24},-4 ${s * 14},-12 Z` }, darken(c.fur, .3));
    return ohr(-1) + ohr(1)
      + S('ellipse', { cx: 0, cy: 0, rx: 25, ry: 25 }, c.fur)
      + S('ellipse', { cx: 0, cy: 12, rx: 14, ry: 10, sw: 2 }, lighten(c.fur, .45))
      + S('ellipse', { cx: 0, cy: 6, rx: 6, ry: 4.5, sw: 1.5 }, INK)
      + S('path', { d: 'M-4,17 Q0,30 4,17 Z', sw: 1.5 }, '#f06292')
      + ln('M-8,15 Q-4,18 0,15 Q4,18 8,15', THIN)
      + eye(-10, -6, 6, { dy: .3, fur: c.fur }) + eye(10, -6, 6, { dy: .3, fur: c.fur });
  },
  esel: c => {
    const ohr = (x, r) => `<g transform="translate(${x},-20) rotate(${r})">${S('ellipse', { cx: 0, cy: -20, rx: 7, ry: 22 }, c.fur)}${S('ellipse', { cx: 0, cy: -18, rx: 3.5, ry: 14, sw: 1.2 }, '#e8c4b8')}</g>`;
    return ohr(-12, -22) + ohr(12, 22)
      + S('ellipse', { cx: 0, cy: 0, rx: 22, ry: 28 }, c.fur)
      + S('path', { d: 'M-9,-26 L-4,-37 L0,-28 L5,-37 L9,-26 Z', sw: 1.5 }, darken(c.fur, .45))
      + S('ellipse', { cx: 0, cy: 15, rx: 17, ry: 13, sw: 2 }, lighten(c.fur, .5))
      + `<ellipse cx="-6" cy="13" rx="2.4" ry="3" fill="${INK}"/><ellipse cx="6" cy="13" rx="2.4" ry="3" fill="${INK}"/>`
      + ln('M-8,22 Q0,26 8,22', THIN)
      + eye(-10, -8, 6, { lid: .35, dy: .3, fur: c.fur }) + eye(10, -8, 6, { lid: .35, dy: .3, fur: c.fur });
  },
  krokodil: c => S('circle', { cx: -13, cy: -20, r: 10 }, c.fur) + S('circle', { cx: 13, cy: -20, r: 10 }, c.fur)
    + S('ellipse', { cx: 0, cy: 2, rx: 31, ry: 22 }, c.fur)
    + S('path', { d: 'M-25,6 Q0,22 25,6 Q20,24 0,24 Q-20,24 -25,6 Z', sw: 2 }, lighten(c.fur, .5))
    + zaehne([[-16, 9.6], [-8, 12.9], [0, 14], [8, 12.9], [16, 9.6]])
    + [[-18, -4, 2.2], [17, -6, 2.6], [-8, -10, 1.8], [22, 2, 1.8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${darken(c.fur, .25)}"/>`).join('')
    + `<ellipse cx="-5" cy="-3" rx="1.8" ry="2.4" fill="${INK}"/><ellipse cx="5" cy="-3" rx="1.8" ry="2.4" fill="${INK}"/>`
    + eye(-13, -21, 6, { lid: .3, dy: .2, fur: c.fur }) + eye(13, -21, 6, { lid: .3, dy: .2, fur: c.fur }),
  koala: c => S('circle', { cx: -26, cy: -14, r: 15 }, c.fur) + S('circle', { cx: 26, cy: -14, r: 15 }, c.fur)
    + S('circle', { cx: -26, cy: -14, r: 8, sw: 1.5 }, lighten(c.fur, .55)) + S('circle', { cx: 26, cy: -14, r: 8, sw: 1.5 }, lighten(c.fur, .55))
    + S('ellipse', { cx: 0, cy: 2, rx: 26, ry: 24 }, c.fur)
    + S('ellipse', { cx: 0, cy: 6, rx: 7, ry: 10, sw: 2 }, '#2b2d42')
    + eye(-12, -6, 5, { dy: .3, fur: c.fur }) + eye(12, -6, 5, { dy: .3, fur: c.fur })
    + ln('M-5,19 Q0,22 5,19', THIN),
  lama: c => {
    const ohr = (x, r) => `<g transform="translate(${x},-22) rotate(${r})">${S('path', { d: 'M-3,0 Q-9,-14 -2,-27 Q7,-14 4,0 Z' }, c.fur)}</g>`;
    return ohr(-12, -14) + ohr(12, 14)
      + S('ellipse', { cx: 0, cy: 0, rx: 21, ry: 28 }, c.fur)
      + [[-9, -25, 7], [9, -25, 7], [0, -29, 8]].map(([x, y, r]) => S('circle', { cx: x, cy: y, r, sw: 2 }, lighten(c.fur, .35))).join('')
      + S('ellipse', { cx: 0, cy: 14, rx: 14, ry: 12, sw: 2 }, lighten(c.fur, .4))
      + ln('M-6,9 Q-4,12 -2,10 M6,9 Q4,12 2,10', 1.6)
      + ln('M-6,20 Q0,23 6,20', THIN)
      + eye(-9, -6, 6, { lid: .45, dy: .2, fur: c.fur }) + eye(9, -6, 6, { lid: .45, dy: .2, fur: c.fur });
  },
  kaenguru: c => {
    const ohr = (x, r) => `<g transform="translate(${x},-18) rotate(${r})">${S('ellipse', { cx: 0, cy: -16, rx: 7, ry: 17 }, c.fur)}${S('ellipse', { cx: 0, cy: -15, rx: 3.5, ry: 11, sw: 1.2 }, lighten(c.fur, .45))}</g>`;
    return ohr(-14, -18) + ohr(14, 18)
      + S('ellipse', { cx: 0, cy: 0, rx: 23, ry: 26 }, c.fur)
      + S('ellipse', { cx: 0, cy: 13, rx: 13, ry: 11, sw: 2 }, lighten(c.fur, .45))
      + S('ellipse', { cx: 0, cy: 6, rx: 5, ry: 3.5, sw: 1.5 }, INK)
      + ln('M0,9 V14 M-5,16 Q0,19 5,16', THIN)
      + eye(-10, -7, 6, { dx: .2, dy: .3, fur: c.fur }) + eye(10, -7, 6, { dx: .2, dy: .3, fur: c.fur });
  },
};

// ---------- Oberkörper ----------
const torso = col => S('path', { d: 'M-42,84 C-42,46 -28,26 0,26 C28,26 42,46 42,84 Z' }, col);
const flecken = pts => pts.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .75}" fill="#a07838" opacity=".5"/>`).join('');
const kragen = col => S('path', { d: 'M-12,28 L0,40 L12,28 L8,44 L0,40 L-8,44 Z', sw: 2 }, col);
const BODIES = {
  feinripp: c => torso(c.fur) + S('path', { d: 'M-25,84 L-22,44 Q-17,34 -12,31 Q0,48 12,31 Q17,34 22,44 L25,84 Z' }, '#ece8dc') + flecken([[-8, 52, 5], [10, 64, 3.5], [-12, 70, 2.5]]),
  muskel: c => torso(c.fur) + S('path', { d: 'M-25,84 L-22,44 Q-17,34 -12,31 Q0,46 12,31 Q17,34 22,44 L25,84 Z' }, c.shirt || '#3d405b') + ln('M-10,54 Q0,62 10,54', 1.5, '#ffffff', 'opacity=".5"'),
  hoodie: c => torso(c.shirt) + S('path', { d: 'M-20,30 Q0,46 20,30 Q12,40 0,42 Q-12,40 -20,30 Z', sw: 2 }, darken(c.shirt, .22))
    + ln('M-6,42 L-8,60 M6,42 L8,60', 2.2, '#ffffff') + S('path', { d: 'M-16,66 L16,66 L13,80 L-13,80 Z', sw: 2 }, darken(c.shirt, .12)),
  hemd: c => torso(c.shirt) + kragen(lighten(c.shirt, .3)) + ln('M0,42 V84', 1.5) + [50, 60, 70].map(y => `<circle cx="3" cy="${y}" r="1.6" fill="${INK}"/>`).join('')
    + (c.flecken ? `<g transform="rotate(16 0 40)">${S('path', { d: 'M-4,40 L4,40 L6,74 L0,80 L-6,74 Z', sw: 2 }, '#c1121f')}</g>` + flecken([[16, 58, 5], [-18, 70, 3.5]]) : ''),
  polo: c => torso(c.shirt) + kragen(lighten(c.shirt, .2)) + ln('M0,40 V56', 1.5) + `<circle cx="2.5" cy="46" r="1.6" fill="${INK}"/><circle cx="2.5" cy="52" r="1.6" fill="${INK}"/>`,
  batik: c => torso(c.shirt) + [[-18, 50, 8, '#f4d03f'], [14, 46, 6, '#2a9d5c'], [0, 70, 9, '#ff6b1a'], [22, 72, 5, '#3a86ff']].map(([x, y, r, f]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" opacity=".55"/>`).join(''),
  hawaii: c => torso(c.shirt) + kragen(lighten(c.shirt, .25)) + ln('M0,42 V84', 1.5)
    + [[-22, 52], [16, 50], [-10, 72], [22, 74], [-28, 70]].map(([x, y]) => [0, 72, 144, 216, 288].map(w => `<circle cx="${x + 4 * Math.cos(w * Math.PI / 180)}" cy="${y + 4 * Math.sin(w * Math.PI / 180)}" r="2.6" fill="#fff6c8"/>`).join('') + `<circle cx="${x}" cy="${y}" r="1.8" fill="#f4a020"/>`).join(''),
  lederjacke: () => torso('#2b2b2b') + S('path', { d: 'M-12,28 L0,52 L12,28 Z', sw: 2 }, '#ece8dc')
    + S('path', { d: 'M-14,28 L-22,40 L-6,48 Z M14,28 L22,40 L6,48 Z', sw: 2 }, '#3d3d3d') + ln('M4,52 V84', 2, '#c9c9c9'),
  sakko: c => torso(c.shirt) + S('path', { d: 'M-12,27 L0,60 L12,27 Z', sw: 2 }, '#f5f5f5')
    + S('path', { d: 'M-12,27 L-18,40 L-4,52 L0,60 Z M12,27 L18,40 L4,52 L0,60 Z', sw: 2 }, darken(c.shirt, .25))
    + `<circle cx="0" cy="68" r="2" fill="${INK}"/><circle cx="0" cy="76" r="2" fill="${INK}"/>`,
  smoking: () => torso('#262a36') + S('path', { d: 'M-13,27 L0,62 L13,27 Z', sw: 2 }, '#f5f5f5')
    + S('path', { d: 'M0,34 L-12,28 L-12,40 Z M0,34 L12,28 L12,40 Z', sw: 2 }, '#e63946') + S('circle', { cx: 0, cy: 34, r: 3, sw: 1.5 }, '#e63946'),
};

// ---------- Accessoires ----------
// Hüte richten sich nach der Oberkante des Kopfes (o), die Brille nach den Augen (a = [y, Abstand])
const ACCS = {
  kippe: () => `<g transform="rotate(14 6 17)">${S('rect', { x: 6, y: 15, width: 20, height: 4.5, rx: 1, sw: 1.5 }, '#f5f0e6')}${S('rect', { x: 23, y: 15, width: 4, height: 4.5, sw: 1.5 }, '#ff6b1a')}</g>`
    + ln('M30,12 q6,-7 0,-13 q-6,-7 2,-15', 2.5, '#c9c9c9', 'opacity=".7"'),
  stirnband: (o, a) => S('rect', { x: -26, y: a[0] - 17, width: 52, height: 7, rx: 2, sw: 2 }, '#e63946')
    + S('path', { d: `M24,${a[0] - 14} L37,${a[0] - 20} L33,${a[0] - 10} Z M24,${a[0] - 12} L35,${a[0] - 4} L28,${a[0] - 2} Z`, sw: 1.5 }, '#e63946'),
  sonnenbrille: (o, a) => `<g transform="translate(0,${a[0]})">${S('rect', { x: -a[1] - 9, y: -6, width: 18, height: 11, rx: 4, sw: 2 }, '#1b1b2f')}${S('rect', { x: a[1] - 9, y: -6, width: 18, height: 11, rx: 4, sw: 2 }, '#1b1b2f')}`
    + ln(`M${-a[1] + 9},-2 H${a[1] - 9}`, 2) + `<path d="M${-a[1] - 5},-3 l5,0" stroke="#ffffff" stroke-width="1.6" opacity=".7"/><path d="M${a[1] - 5},-3 l5,0" stroke="#ffffff" stroke-width="1.6" opacity=".7"/></g>`,
  cap: o => `<g transform="translate(0,${o + 24})">${S('path', { d: 'M-26,-12 C-26,-40 26,-40 26,-12 Z' }, '#e63946')}${S('path', { d: 'M8,-14 L42,-10 L40,-5 L6,-9 Z', sw: 2 }, darken('#e63946', .2))}<circle cx="0" cy="-37" r="3" fill="${INK}"/></g>`,
  muetze: o => `<g transform="translate(0,${o + 24})">${S('path', { d: 'M-27,-10 C-27,-42 27,-42 27,-10 Z' }, '#2a9d5c')}${S('rect', { x: -28, y: -16, width: 56, height: 7, rx: 3, sw: 2 }, '#f4d03f')}${S('circle', { cx: 0, cy: -38, r: 6 }, '#e63946')}</g>`,
  zylinder: o => `<g transform="translate(0,${o + 4})">${S('ellipse', { cx: 0, cy: 0, rx: 28, ry: 6 }, '#1b1b2f')}${S('rect', { x: -16, y: -38, width: 32, height: 38, rx: 2 }, '#1b1b2f')}${S('rect', { x: -16, y: -10, width: 32, height: 7, sw: 2 }, '#c1121f')}</g>`,
  cowboyhut: o => `<g transform="translate(0,${o + 6})">${S('path', { d: 'M-40,-2 Q-30,8 0,6 Q30,8 40,-2 Q30,-8 0,-6 Q-30,-8 -40,-2 Z' }, '#8d5524')}${S('path', { d: 'M-18,-4 Q-20,-30 -6,-24 Q0,-30 6,-24 Q20,-30 18,-4 Z' }, '#a0662c')}${S('rect', { x: -17, y: -9, width: 34, height: 5, sw: 1.5 }, '#3d2c1e')}</g>`,
  krone: o => `<g transform="translate(0,${o + 4})">${S('path', { d: 'M-20,0 L-24,-24 L-12,-12 L0,-28 L12,-12 L24,-24 L20,0 Z' }, '#f4d03f')}<circle cx="0" cy="-8" r="3.5" fill="#e63946" stroke="${INK}" stroke-width="1.2"/><circle cx="-12" cy="-5" r="2.5" fill="#3a86ff" stroke="${INK}" stroke-width="1"/><circle cx="12" cy="-5" r="2.5" fill="#2a9d5c" stroke="${INK}" stroke-width="1"/></g>`,
  fliege: () => `<g transform="translate(0,31)">${S('path', { d: 'M0,0 L-13,-7 L-13,7 Z M0,0 L13,-7 L13,7 Z', sw: 2 }, '#c1121f')}${S('circle', { cx: 0, cy: 0, r: 3.5, sw: 1.5 }, '#c1121f')}</g>`,
  goldkette: () => ln('M-17,30 Q0,52 17,30', 3.2, '#f4c430', 'stroke-dasharray="4 2"') + S('circle', { cx: 0, cy: 44, r: 5.5, sw: 1.5 }, '#f4c430') + txt(0, 47, '$', 8, INK),
};

// Eine Figur als Brustbild. f: { kind, body, fur, shirt, acc (eins oder Liste), flecken, muede }
export function figurSvg(f) {
  const acc = [].concat(f.acc || []).map(a => ACCS[a](OBEN[f.kind] ?? -24, AUGEN[f.kind] || [-6, 10])).join('');
  return fx(BODIES[f.body](f) + HEADS[f.kind](f) + acc);
}

// Brustbild mit Namensschild, x/y = Kopfmitte
export function bust(f, name, x, y, s, extra = '') {
  const w = Math.max(54, name.length * 7.2 + 16);
  const plate = name ? `<rect x="${-w / 2}" y="54" width="${w}" height="19" rx="9.5" fill="#fff3c4" stroke="${INK}" stroke-width="${THIN}"/>` + txt(0, 68, name, 11, INK) : '';
  return `<g transform="translate(${x},${y}) scale(${s})">${figurSvg(f)}${plate}${extra}</g>`;
}

// Eigenständiges SVG, z. B. für die Charakterwahl und den Shop
export const figurBild = (f, cls = '') => `<svg class="${cls}" viewBox="-50 -64 100 132" aria-hidden="true">${figurSvg(f)}</svg>`;

// ---------- Auswahl für deinen Charakter und den Shop ----------
export const TIERE = {
  fuchs: { name: 'Fuchs', farben: ['#e8772e', '#c0392b', '#f4d03f', '#9b9b9b', '#6d4c41'] },
  krokodil: { name: 'Krokodil', farben: ['#4caf50', '#2e7d32', '#8bc34a', '#00897b', '#7e57c2'] },
  koala: { name: 'Koala', farben: ['#9e9e9e', '#bdbdbd', '#78909c', '#a1887f', '#f8bbd0'] },
  lama: { name: 'Lama', farben: ['#f5deb3', '#fafafa', '#d7ccc8', '#8d6e63', '#f8bbd0'] },
  kaenguru: { name: 'Känguru', farben: ['#c68642', '#a0522d', '#d2a679', '#8d6e63', '#e0ac69'] },
};
// preis 0 = Starter-Outfit (eins davon wählt man am Anfang)
export const OUTFITS = [
  { id: 'hoodie_blau', name: 'Blauer Hoodie', body: 'hoodie', shirt: '#3a86ff', preis: 0 },
  { id: 'polo_gruen', name: 'Grünes Polo', body: 'polo', shirt: '#2a9d5c', preis: 0 },
  { id: 'feinripp', name: 'Feinripp', body: 'feinripp', preis: 0 },
  { id: 'hoodie_schwarz', name: 'Schwarzer Hoodie', body: 'hoodie', shirt: '#2b2d42', preis: 250 },
  { id: 'hemd_weiss', name: 'Weißes Hemd', body: 'hemd', shirt: '#f1efe6', preis: 300 },
  { id: 'batik', name: 'Batik-Shirt', body: 'batik', shirt: '#8e5bd6', preis: 400 },
  { id: 'hawaii', name: 'Hawaii-Hemd', body: 'hawaii', shirt: '#e63946', preis: 500 },
  { id: 'lederjacke', name: 'Lederjacke', body: 'lederjacke', preis: 800 },
  { id: 'sakko_blau', name: 'Blaues Sakko', body: 'sakko', shirt: '#2b4c7e', preis: 1500 },
  { id: 'sakko_samt', name: 'Samt-Sakko', body: 'sakko', shirt: '#7b2cbf', preis: 3000 },
  { id: 'smoking', name: 'Smoking', body: 'smoking', preis: 6000 },
];
export const ACCESSOIRES = [
  { id: 'cap', name: 'Cap', preis: 200 },
  { id: 'muetze', name: 'Rasta-Mütze', preis: 250 },
  { id: 'sonnenbrille', name: 'Sonnenbrille', preis: 400 },
  { id: 'fliege', name: 'Fliege', preis: 600 },
  { id: 'cowboyhut', name: 'Cowboyhut', preis: 1200 },
  { id: 'goldkette', name: 'Goldkette', preis: 2500 },
  { id: 'zylinder', name: 'Zylinder', preis: 4000 },
  { id: 'krone', name: 'Krone', preis: 15000 },
];

// Aus deinem gespeicherten Charakter die Figur bauen
export function deineFigur(c) {
  const o = OUTFITS.find(x => x.id === c.outfit) || OUTFITS[0];
  return { kind: c.tier, fur: c.farbe, body: o.body, shirt: o.shirt, acc: c.acc || null };
}
