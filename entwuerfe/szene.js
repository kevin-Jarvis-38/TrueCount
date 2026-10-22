/* TrueCount – Design-Entwurf (Etappe 0): eine Tisch-Szene, drei Stile (a, b, c). */
(() => {
  const STIL = window.STIL || 'a';
  const BGB = '#0d0820';
  const THEMES = {
    a: { id: 'a', name: 'Comic-Klassik', font: "'Luckiest Guy'", ink: '#1a1a1a', felt: '#2f8f4e', rail: '#7b4a26', feltText: '#f6e7a1',
      shoe: '#b8322a', tray: '#6b4a2e', back: '#c0392b', plate: '#fff3c4', plateText: '#1a1a1a', plateLine: '#1a1a1a', acc: '#ffcc00',
      card: { fill: '#fffdf5', stroke: '#1a1a1a', sw: 2.2, red: '#d62828', black: '#1a1a1a' } },
    b: { id: 'b', name: 'Neon-Nacht', font: "'Bungee'", ink: '#e8e6ff', felt: '#1a1240', rail: '#170f33', feltText: '#27e0ff',
      shoe: '#ff2e88', tray: '#7f8cff', back: '#ff2e88', plate: '#140c30', plateText: '#27e0ff', plateLine: '#27e0ff', acc: '#ff2e88',
      card: { fill: '#ffffff', stroke: '#27e0ff', sw: 1.8, red: '#ff2e88', black: '#1b1440' } },
    c: { id: 'c', name: 'Knuddel-3D', font: "'Fredoka'", ink: '#3a2a2a', felt: '#1f8a8a', rail: '#8a5232', feltText: '#e8fff9',
      shoe: '#3d5a80', tray: '#8a5232', back: '#5a67d8', plate: '#ffffff', plateText: '#3a2a2a', plateLine: '#00000022', acc: '#ffd166',
      card: { fill: '#ffffff', stroke: '#d8d0c8', sw: 1, red: '#e63946', black: '#2b2d42' } },
  };
  const T = THEMES[STIL];
  document.documentElement.dataset.stil = STIL;
  const THIN = { a: 2, b: 1.3, c: 0.9 }[STIL];
  const CW = 40, CH = 56; // Kartenmaß: 56 Einheiten = 88 mm
  const MM = CH / 88;
  const DECK = 52 * 0.3 * MM; // ein Deck ist ca. 15,6 mm dick
  const CHIPC = { 1: '#f2f2f2', 5: '#e63946', 25: '#2a9d5c', 100: '#262a36', 500: '#7b2cbf', 1000: '#f4a020' };

  // ---------- Farben ----------
  const rgb = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
  const hex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return hex(A.map((v, i) => v + (B[i] - v) * t)); };
  const lighten = (c, t) => mix(c, '#ffffff', t), darken = (c, t) => mix(c, '#000000', t);
  const lum = c => { const [r, g, b] = rgb(c); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

  // ---------- SVG-Bausteine ----------
  let defs = '', grads = {}, uid = 0;
  const at = o => Object.entries(o).map(([k, v]) => `${k}="${v}"`).join(' ');
  function grad(c) {
    const id = 'g' + c.slice(1);
    if (!grads[id]) {
      grads[id] = 1;
      defs += `<radialGradient id="${id}" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="${lighten(c, .35)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${darken(c, .25)}"/></radialGradient>`;
    }
    return `url(#${id})`;
  }
  // Form im Stil des Themes: a = dicke Linie, b = Neon-Kante, c = plastischer Verlauf
  function S(tag, a, c, raw) {
    const o = Object.assign({}, a), sw = o.sw || 3;
    delete o.sw;
    if (STIL === 'a') { o.fill = c; o.stroke = T.ink; o['stroke-width'] = sw; }
    else if (STIL === 'b') { o.fill = raw ? c : mix(c, BGB, .55); o.stroke = lum(c) < .3 ? '#7f8cff' : lighten(c, .3); o['stroke-width'] = sw * .6; }
    else { o.fill = raw ? c : grad(c); o.stroke = darken(c, .28); o['stroke-width'] = sw * .35; }
    o['stroke-linejoin'] = 'round';
    return `<${tag} ${at(o)}/>`;
  }
  const ln = (d, w = 2.5, col = T.ink, extra = '') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const txt = (x, y, s, size, fill, extra = '') => `<text x="${x}" y="${y}" font-family="${T.font}, sans-serif" font-size="${size}" fill="${fill}" text-anchor="middle" ${extra}>${s}</text>`;
  const fx = inner => `<g filter="url(#fx)">${inner}</g>`;

  function eye(x, y, r, o = {}) {
    const id = 'e' + (++uid), px = x + (o.dx || 0) * r * .35, py = y + (o.dy || 0) * r * .35;
    let s = `<clipPath id="${id}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath>`
      + `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.sclera || '#ffffff'}"/>`
      + `<circle cx="${px}" cy="${py}" r="${r * .48}" fill="#1a1a1a"/>`
      + `<circle cx="${px + r * .15}" cy="${py - r * .18}" r="${r * .16}" fill="#ffffff"/>`;
    if (o.lid) {
      const lidCol = STIL === 'b' ? mix(o.fur, BGB, .55) : o.fur;
      s += `<g clip-path="url(#${id})"><rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${2 * r * o.lid}" fill="${lidCol}"/>${ln(`M${x - r},${y - r + 2 * r * o.lid}H${x + r}`, THIN)}</g>`;
    }
    return s + `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${T.ink}" stroke-width="${THIN}"/>`;
  }

  // ---------- Köpfe ----------
  const HEADS = {
    fuchs: c => S('path', { d: 'M-25,-6 L-29,-46 L-5,-24 Z' }, c.fur) + S('path', { d: 'M25,-6 L29,-46 L5,-24 Z' }, c.fur)
      + S('path', { d: 'M-22,-14 L-25,-37 L-11,-23 Z', sw: 1.5 }, '#3a2320') + S('path', { d: 'M22,-14 L25,-37 L11,-23 Z', sw: 1.5 }, '#3a2320')
      + S('ellipse', { cx: 0, cy: 0, rx: 28, ry: 25 }, c.fur)
      + S('path', { d: 'M-27,4 Q-16,27 0,25 Q16,27 27,4 Q14,13 0,11 Q-14,13 -27,4 Z', sw: 2 }, '#fff4e6')
      + S('ellipse', { cx: 0, cy: 13, rx: 12, ry: 8, sw: 2 }, '#fff4e6')
      + S('ellipse', { cx: 0, cy: 8, rx: 5, ry: 3.6, sw: 1.5 }, '#1a1a1a', true)
      + eye(-11, -6, 7, { dx: .6, dy: .5, fur: c.fur }) + eye(11, -6, 8.5, { dx: -.3, dy: .6, fur: c.fur })
      + ln('M-5,17 Q0,21 5,17', THIN),
    gorilla: c => {
      const face = '#a08a7a';
      return S('circle', { cx: -29, cy: 0, r: 7.5 }, c.fur) + S('circle', { cx: 29, cy: 0, r: 7.5 }, c.fur)
        + S('ellipse', { cx: 0, cy: -3, rx: 30, ry: 28 }, c.fur)
        + S('path', { d: 'M-21,-6 Q-24,22 0,24 Q24,22 21,-6 Q10,-2 0,-8 Q-10,-2 -21,-6 Z', sw: 2.2 }, face)
        + S('path', { d: 'M-24,-9 Q-12,-20 0,-12 Q12,-20 24,-9 Q12,-12 0,-6 Q-12,-12 -24,-9 Z', sw: 2 }, darken(c.fur, .15))
        + eye(-9, -1, 5.5, { lid: .5, dy: .4, fur: face }) + eye(9, -1, 6.5, { lid: .55, dy: .4, fur: face })
        + `<ellipse cx="-4" cy="10" rx="2.6" ry="2" fill="${T.ink}"/><ellipse cx="4" cy="10" rx="2.6" ry="2" fill="${T.ink}"/>`
        + ln('M-10,18 Q0,15 10,18', THIN * 1.2)
        + `<g transform="rotate(14 6 17)">${S('rect', { x: 6, y: 15, width: 20, height: 4.5, rx: 1, sw: 1.5 }, '#f5f0e6', true)}${S('rect', { x: 23, y: 15, width: 4, height: 4.5, sw: 1.5 }, '#ff6b1a', true)}</g>`
        + ln('M30,12 q6,-7 0,-13 q-6,-7 2,-15', 2.5, '#c9c9c9', 'opacity=".7"');
    },
    hase: c => {
      const ear = (x, r) => `<g transform="translate(${x},-22) rotate(${r})">${S('ellipse', { cx: 0, cy: -20, rx: 7.5, ry: 21 }, c.fur)}${S('ellipse', { cx: 0, cy: -19, rx: 3.6, ry: 14, sw: 1.2 }, '#f4a6b8')}</g>`;
      return ear(-10, -14) + ear(11, 24)
        + S('circle', { cx: 0, cy: 0, r: 25 }, c.fur)
        + S('rect', { x: -26, y: -20, width: 52, height: 7, rx: 2, sw: 2 }, '#e63946')
        + S('path', { d: 'M24,-17 L37,-23 L33,-13 Z M24,-15 L35,-7 L28,-5 Z', sw: 1.5 }, '#e63946')
        + S('ellipse', { cx: -6, cy: 10, rx: 8, ry: 6, sw: 1.8 }, '#ffffff', true) + S('ellipse', { cx: 6, cy: 10, rx: 8, ry: 6, sw: 1.8 }, '#ffffff', true)
        + S('path', { d: 'M-3,4 L3,4 L0,8 Z', sw: 1 }, '#f06292')
        + S('rect', { x: -4, y: 14, width: 8, height: 7, rx: 1, sw: 1.5 }, '#ffffff', true) + ln('M0,14 V21', 1)
        + eye(-10, -3, 5.5, { dy: .3, fur: c.fur }) + eye(10, -3, 5.5, { dy: .3, fur: c.fur })
        + ln('M-18,-12 L-5,-6', 4) + ln('M18,-12 L5,-6', 4);
    },
    pinguin: () => S('circle', { cx: 0, cy: 0, r: 27 }, '#262a36')
      + S('path', { d: 'M0,-10 C-8,-19 -22,-14 -21,2 C-20,18 -8,23 0,23 C8,23 20,18 21,2 C22,-14 8,-19 0,-10 Z', sw: 2 }, '#f5f5f5', true)
      + eye(-8, -1, 5.5, { dx: .3, fur: '#f5f5f5' }) + eye(8, -1, 5, { dx: .3, fur: '#f5f5f5' })
      + S('path', { d: 'M-8,8 Q0,5 8,8 L0,18 Z', sw: 2 }, '#f4a020')
      + S('path', { d: 'M-26,-12 Q0,-30 26,-12 L33,-5 Q0,-20 -33,-5 Z', sw: 2 }, '#2a9d5c'),
    hyaene: c => S('circle', { cx: -21, cy: -18, r: 9 }, c.fur) + S('circle', { cx: 21, cy: -18, r: 9 }, c.fur)
      + S('circle', { cx: -21, cy: -18, r: 4.5, sw: 1 }, '#5a4632') + S('circle', { cx: 21, cy: -18, r: 4.5, sw: 1 }, '#5a4632')
      + S('ellipse', { cx: 0, cy: 0, rx: 27, ry: 24 }, c.fur)
      + [[-15, -12, 3.5], [14, -14, 3], [-20, 2, 2.6], [19, 4, 3], [4, -18, 2.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#6b4f2e" opacity=".75"/>`).join('')
      + S('ellipse', { cx: 0, cy: 11, rx: 15, ry: 10, sw: 2 }, '#8a6a44')
      + S('ellipse', { cx: 0, cy: 5, rx: 5, ry: 3.5, sw: 1.2 }, '#1a1a1a', true)
      + S('path', { d: 'M-12,12 Q0,27 12,12 Q0,16 -12,12 Z', sw: 2 }, '#ffffff', true) + ln('M-6,14 L-5,19 M0,15 V21 M6,14 L5,19', 1)
      + `<ellipse cx="-17" cy="6" rx="5" ry="3" fill="#ff5d73" opacity=".65"/><ellipse cx="17" cy="6" rx="5" ry="3" fill="#ff5d73" opacity=".65"/>`
      + eye(-10, -6, 6, { dx: .8, dy: -.2, lid: .35, fur: c.fur }) + eye(10, -7, 6.5, { dx: -.8, dy: .4, lid: .3, fur: c.fur }),
    kater: c => S('path', { d: 'M-29,-4 L-31,-31 L-10,-22 Z' }, c.fur) + S('path', { d: 'M29,-4 L31,-31 L10,-22 Z' }, c.fur)
      + S('ellipse', { cx: 0, cy: 0, rx: 31, ry: 25 }, c.fur)
      + S('ellipse', { cx: -7, cy: 10, rx: 8, ry: 6, sw: 1.8 }, '#fff4e6', true) + S('ellipse', { cx: 7, cy: 10, rx: 8, ry: 6, sw: 1.8 }, '#fff4e6', true)
      + S('path', { d: 'M-3,5 L3,5 L0,9 Z', sw: 1 }, '#f06292')
      + ln('M-14,9 L-32,6 M-14,12 L-32,13 M14,9 L32,6 M14,12 L32,13', 1.2)
      + eye(-11, -4, 6.5, { lid: .58, dy: .3, sclera: '#ffc9c9', fur: c.fur }) + eye(11, -4, 6.5, { lid: .62, dy: .3, sclera: '#ffc9c9', fur: c.fur })
      + ln('M-6,18 Q0,22 8,16', THIN * 1.2)
      + S('path', { d: 'M-27,-10 C-27,-42 27,-42 27,-10 Z' }, '#2a9d5c')
      + S('rect', { x: -28, y: -16, width: 56, height: 7, rx: 3, sw: 2 }, '#f4d03f')
      + S('circle', { cx: 0, cy: -38, r: 6 }, '#e63946')
      + `<g transform="rotate(-18 9 18)">${S('path', { d: 'M8,16 L24,14 L24,20 L8,19 Z', sw: 1.4 }, '#f5f0e6', true)}${S('circle', { cx: 25, cy: 17, r: 2.4, sw: 1 }, '#ff6b1a', true)}</g>`
      + [[34, 4, 5], [39, -6, 6.5], [34, -17, 8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#d9d9d9" opacity=".5"/>`).join(''),
  };

  // ---------- Oberkörper ----------
  const torso = col => S('path', { d: 'M-42,84 C-42,46 -28,26 0,26 C28,26 42,46 42,84 Z' }, col);
  const stains = pts => pts.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .75}" fill="#a07838" opacity=".5"/>`).join('');
  const BODIES = {
    feinripp: c => torso(c.fur) + S('path', { d: 'M-25,84 L-22,44 Q-17,34 -12,31 Q0,48 12,31 Q17,34 22,44 L25,84 Z' }, '#ece8dc') + stains([[-8, 52, 5], [10, 64, 3.5], [-12, 70, 2.5]]),
    muskel: c => torso(c.fur) + S('path', { d: 'M-25,84 L-22,44 Q-17,34 -12,31 Q0,46 12,31 Q17,34 22,44 L25,84 Z' }, '#3d405b') + ln('M-10,54 Q0,62 10,54', 1.5, '#ffffff', 'opacity=".5"'),
    hoodie: c => torso(c.shirt) + S('path', { d: 'M-20,30 Q0,46 20,30 Q12,40 0,42 Q-12,40 -20,30 Z', sw: 2 }, darken(c.shirt, .22))
      + ln('M-6,42 L-8,60 M6,42 L8,60', 2.2, '#ffffff') + S('path', { d: 'M-16,66 L16,66 L13,80 L-13,80 Z', sw: 2 }, darken(c.shirt, .12)),
    hemd: () => torso('#f1efe6') + S('path', { d: 'M-12,28 L0,40 L12,28 L8,44 L0,40 L-8,44 Z', sw: 2 }, '#ffffff', true)
      + `<g transform="rotate(16 0 40)">${S('path', { d: 'M-4,40 L4,40 L6,74 L0,80 L-6,74 Z', sw: 2 }, '#c1121f')}</g>` + stains([[16, 58, 5], [-18, 70, 3.5]]),
    batik: c => torso(c.shirt) + [[-18, 50, 8, '#f4d03f'], [14, 46, 6, '#2a9d5c'], [0, 70, 9, '#ff6b1a'], [22, 72, 5, '#3a86ff']].map(([x, y, r, f]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" opacity=".55"/>`).join('') + stains([[-6, 60, 4]]),
    smoking: () => torso('#262a36') + S('path', { d: 'M-13,27 L0,62 L13,27 Z', sw: 2 }, '#f5f5f5', true)
      + S('path', { d: 'M0,34 L-12,28 L-12,40 Z M0,34 L12,28 L12,40 Z', sw: 2 }, '#e63946') + S('circle', { cx: 0, cy: 34, r: 3, sw: 1.5 }, '#e63946'),
  };

  const bubble = (x, y, t) => `<g transform="translate(${x},${y}) rotate(-8)">${S('ellipse', { cx: 0, cy: 0, rx: 24, ry: 12, sw: 2 }, '#ffffff', true)}${txt(0, 4, t, 10, '#1a1a1a')}</g>`;
  const CAST = {
    joe: { name: 'Crazy Joe', kind: 'gorilla', body: 'feinripp', fur: '#4a4654', hand: [['K', '♣'], ['7', '♦']], bet: [25, 25] },
    du: { name: 'Du', kind: 'fuchs', body: 'hoodie', fur: '#e8772e', shirt: '#3a86ff', hand: [['8', '♥'], ['8', '♠']], you: true },
    rudi: { name: 'Rambo-Rudi', kind: 'hase', body: 'muskel', fur: '#d7d2cc', hand: [['A', '♦'], ['5', '♣']], bet: [5, 5, 5] },
    heinz: { name: 'Hicks-Heinz', kind: 'hyaene', body: 'hemd', fur: '#c9a15e', hand: [['10', '♥'], ['2', '♠']], bet: [5, 5], extra: bubble(30, -40, 'Hicks!') },
    futon: { name: 'Futon der Abi', kind: 'kater', body: 'batik', fur: '#e39b4f', shirt: '#8e5bd6', hand: [['9', '♣'], ['9', '♦']], bet: [25] },
  };
  const DEALER = { name: 'Frack-Fred', kind: 'pinguin', body: 'smoking' };

  function bust(c, x, y, s, noPlate) {
    const w = Math.max(54, c.name.length * 7.2 + 16);
    const plate = noPlate ? '' : `<rect x="${-w / 2}" y="54" width="${w}" height="19" rx="9.5" fill="${T.plate}" stroke="${T.plateLine}" stroke-width="${THIN}"/>` + txt(0, 68, c.name, 11, T.plateText);
    return `<g transform="translate(${x},${y}) scale(${s})">${fx(BODIES[c.body](c) + HEADS[c.kind](c))}${c.extra || ''}${plate}</g>`;
  }

  // ---------- Karten, Chips, Schuh, Ablage ----------
  function card(cx, cy, r, s, rot = 0) {
    const w = CW, h = CH, col = (s === '♥' || s === '♦') ? T.card.red : T.card.black;
    return `<g transform="translate(${cx},${cy}) rotate(${rot})" filter="url(#fx)">`
      + `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${w * .12}" fill="${T.card.fill}" stroke="${T.card.stroke}" stroke-width="${T.card.sw}"/>`
      + `<text x="${-w / 2 + 4}" y="${-h / 2 + 14}" font-family="${T.font}, sans-serif" font-size="${r === '10' ? 11 : 13}" fill="${col}">${r}</text>`
      + `<text x="${-w / 2 + 4}" y="${-h / 2 + 25}" font-size="10" fill="${col}">${s}</text>`
      + txt(3, h * .3, s, 24, col) + '</g>';
  }
  function chipStack(x, y, list) {
    return fx(list.map((v, i) => {
      const cy = y - i * 4.2, col = CHIPC[v];
      return S('ellipse', { cx: x, cy: cy + 2, rx: 15, ry: 6.5, sw: 2 }, darken(col, .25)) + S('ellipse', { cx: x, cy, rx: 15, ry: 6.5, sw: 2 }, col)
        + `<ellipse cx="${x}" cy="${cy}" rx="11" ry="4.6" fill="none" stroke="${v === 1 ? '#3a86ff' : '#ffffff'}" stroke-width="2.2" stroke-dasharray="3.5 3"/>`;
    }).join(''));
  }
  const badge = (x, y, t) => fx(`<rect x="${x - 17}" y="${y - 10}" width="34" height="19" rx="9.5" fill="${T.plate}" stroke="${T.plateLine}" stroke-width="${THIN}"/>` + txt(x, y + 4.5, t, 11, T.plateText));
  function wert(h) {
    let t = 0, a = 0;
    h.forEach(([r]) => { if (r === 'A') { a++; t += 1; } else t += isNaN(r) ? 10 : +r; });
    return a && t + 10 <= 21 ? `${t}/${t + 10}` : `${t}`;
  }
  // Schuh: Platz für 6 Decks, noch 3,5 Decks drin – im echten Größenverhältnis zur Karte
  function shoe(x, y) {
    const L = 6 * DECK, fill = 3.5 * DECK, x0 = x - L / 2;
    let s = S('path', { d: `M${x0 - 16},${y + 20} L${x + L / 2 + 8},${y + 20} L${x + L / 2 + 8},${y - 19} L${x0 + 2},${y - 19} Z` }, T.shoe);
    s += `<rect x="${x0}" y="${y - 15}" width="${fill}" height="30" fill="${T.card.fill}" stroke="${T.card.stroke}" stroke-width="1"/>`;
    for (let i = 1.6; i < fill; i += 1.6) s += `<line x1="${x0 + i}" y1="${y - 15}" x2="${x0 + i}" y2="${y + 15}" stroke="#00000033" stroke-width=".6"/>`;
    s += S('path', { d: `M${x0 - 13},${y + 18} L${x0 - 1},${y - 15} L${x0 + 3},${y - 15} L${x0 - 9},${y + 18} Z`, sw: 1.5 }, T.back);
    return fx(s) + txt(x, y + 34, 'SCHUH', 8, T.feltText, 'opacity=".75" letter-spacing="1"');
  }
  // Ablage: 2,5 Decks schon gespielt
  function tray(x, y) {
    const H = 6 * DECK + 6, st = 2.5 * DECK, w = CW + 10;
    let s = S('rect', { x: x - w / 2, y: y - H / 2, width: w, height: H, rx: 4 }, T.tray);
    s += `<rect x="${x - w / 2 + 5}" y="${y + H / 2 - 3 - st}" width="${w - 10}" height="${st}" fill="${T.card.fill}" stroke="${T.card.stroke}" stroke-width="1"/>`;
    for (let i = 1.6; i < st; i += 1.6) s += `<line x1="${x - w / 2 + 5}" y1="${y + H / 2 - 3 - i}" x2="${x + w / 2 - 5}" y2="${y + H / 2 - 3 - i}" stroke="#00000033" stroke-width=".6"/>`;
    return fx(s) + txt(x, y + H / 2 + 13, 'ABLAGE', 8, T.feltText, 'opacity=".75" letter-spacing="1"');
  }

  // ---------- Hintergrund und Tisch ----------
  function seeded(n) { let v = n * 9301 + 49297; return () => (v = (v * 9301 + 49297) % 233280) / 233280; }
  function bg(L) {
    const big = `x="-600" y="-600" width="${L.W + 1200}" height="${L.H + 1200}"`;
    if (STIL === 'a') {
      let s = `<rect ${big} fill="#4a2e1b"/>`;
      for (let x = -600; x < L.W + 600; x += 44) s += `<line x1="${x}" y1="-600" x2="${x}" y2="${L.H + 600}" stroke="#3a2313" stroke-width="3"/>`;
      return s + `<rect x="-600" y="${L.top - 34}" width="${L.W + 1200}" height="9" fill="#2e1b0e"/>`;
    }
    if (STIL === 'b') {
      const r = seeded(7);
      let s = `<rect ${big} fill="${BGB}"/>`;
      for (let i = 0; i < 40; i++) s += `<circle cx="${r() * L.W}" cy="${r() * L.top}" r="${r() * 1.4 + .3}" fill="#ffffff" opacity="${r() * .5 + .2}"/>`;
      return s + fx(txt(L.sign[0][0], L.sign[0][1], '21', 34, 'none', 'stroke="#27e0ff" stroke-width="2"')
        + txt(L.sign[1][0], L.sign[1][1], '♠♥♣♦', 22, 'none', 'stroke="#ff2e88" stroke-width="1.6"'));
    }
    const r = seeded(3);
    let s = '';
    for (let i = 0; i < 14; i++) s += `<circle cx="${r() * L.W}" cy="${r() * L.H}" r="${r() * 30 + 10}" fill="#ffffff" opacity="${r() * .07 + .03}"/>`;
    return s;
  }
  function table(L) {
    const cx = L.W / 2, t = L.top, R = 16;
    const arc = (rx, ry) => `M${cx - rx},${t} A${rx},${ry} 0 0,0 ${cx + rx},${t}`;
    let s = '';
    if (STIL === 'a') s += `<path d="${arc(L.rx + R, L.ry + R)} Z" fill="${T.rail}" stroke="#1a1a1a" stroke-width="4"/><path d="${arc(L.rx + R / 2, L.ry + R / 2)}" fill="none" stroke="${lighten(T.rail, .25)}" stroke-width="3" opacity=".6"/>`;
    if (STIL === 'b') s += `<path d="${arc(L.rx + R, L.ry + R)} Z" fill="${T.rail}" stroke="#ff2e88" stroke-width="3" filter="url(#fx)"/>`;
    if (STIL === 'c') {
      defs += `<linearGradient id="railG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(T.rail, .2)}"/><stop offset="1" stop-color="${darken(T.rail, .3)}"/></linearGradient>`
        + `<radialGradient id="feltG" cx="50%" cy="15%" r="90%"><stop offset="0" stop-color="${lighten(T.felt, .25)}"/><stop offset="1" stop-color="${darken(T.felt, .3)}"/></radialGradient>`;
      s += `<path d="${arc(L.rx + R, L.ry + R)} Z" fill="url(#railG)"/>`;
    }
    const edge = STIL === 'a' ? 'stroke="#1a1a1a" stroke-width="3"' : STIL === 'b' ? 'stroke="#27e0ff" stroke-width="2" filter="url(#fx)"' : `stroke="${darken(T.felt, .3)}" stroke-width="1.5"`;
    s += `<path d="${arc(L.rx, L.ry)} Z" fill="${STIL === 'c' ? 'url(#feltG)' : T.felt}" ${edge}/>`;
    // Beschriftung auf dem Filz
    const [ki, kr, km] = L.arcs;
    defs += `<path id="tI" d="${arc(L.rx * ki, L.ry * ki)}"/><path id="tR" d="${arc(L.rx * kr, L.ry * kr)}"/><path id="tM" d="${arc(L.rx * km, L.ry * km)}"/>`;
    const on = (id, size, str, extra = '') => `<text font-family="${T.font}, sans-serif" font-size="${size}" fill="${T.feltText}" letter-spacing="1.5" ${extra}><textPath href="#${id}" startOffset="50%" text-anchor="middle">${str}</textPath></text>`;
    s += `<path d="${arc(L.rx * ki + 5, L.ry * ki + 5)}" fill="none" stroke="${T.feltText}" stroke-width="1.5" opacity=".45"/>`
      + `<path d="${arc(L.rx * ki - 16, L.ry * ki - 16)}" fill="none" stroke="${T.feltText}" stroke-width="1.5" opacity=".45"/>`
      + on('tI', L.fs[0], 'VERSICHERUNG ZAHLT 2 ZU 1', 'opacity=".85"')
      + on('tR', L.fs[1], 'DEALER STEHT AUF SOFT 17', 'opacity=".7"')
      + on('tM', L.fs[2], 'BLACKJACK ZAHLT 3 ZU 2')
      + txt(cx, t + 13, 'HINTERZIMMER · 5 – 100 €', 9, T.feltText, 'opacity=".7" letter-spacing="1"');
    // Bierrand und Brandloch – es ist halt das Hinterzimmer
    const bx = cx + L.rx * .42, by = t + L.ry * .3;
    s += `<circle cx="${bx}" cy="${by}" r="13" fill="none" stroke="#3b2410" stroke-width="3" opacity=".25"/><circle cx="${bx + 4}" cy="${by + 2}" r="11" fill="none" stroke="#3b2410" stroke-width="2" opacity=".15"/>`
      + `<ellipse cx="${cx - L.rx * .36}" cy="${t + L.ry * .62}" rx="5" ry="3.5" fill="#1a0f08" opacity=".45"/>`;
    return s;
  }
  function lamp(L) {
    if (STIL !== 'a') return '';
    const cx = L.W / 2;
    return `<ellipse cx="${cx}" cy="${L.top + L.ry * .35}" rx="${L.rx * .8}" ry="${L.ry * .55}" fill="#ffe9a8" opacity=".09"/>`
      + `<line x1="${cx}" y1="-600" x2="${cx}" y2="4" stroke="#1a1a1a" stroke-width="3"/>`
      + S('path', { d: `M${cx - 28},22 L${cx - 14},2 L${cx + 14},2 L${cx + 28},22 Z` }, '#2a9d5c')
      + `<ellipse cx="${cx}" cy="23" rx="12" ry="4" fill="#fff6c8"/>`;
  }

  // ---------- Aufbau je nach Ausrichtung ----------
  function lay() {
    if (innerWidth <= innerHeight) return {
      W: 400, H: 600, top: 120, rx: 230, ry: 330, dealer: [200, 80], dealerCards: [200, 172], shoe: [336, 160], tray: [60, 160],
      seats: [[62, 392], [200, 476], [338, 392]], cast: ["joe", "du", "rudi"], bs: .95, k: [.26, .12], arcs: [.4, .48, .58], fs: [10, 8, 12],
      sign: [[52, 62], [348, 60]],
    };
    return {
      W: 800, H: 420, top: 104, rx: 440, ry: 270, dealer: [400, 64], dealerCards: [400, 158], shoe: [655, 142], tray: [145, 142],
      seats: [[90, 276], [240, 330], [400, 350], [560, 330], [710, 276]], cast: ['heinz', 'joe', 'du', 'rudi', 'futon'], bs: .82, k: [.27, .1],
      arcs: [.36, .43, .52], fs: [11, 9, 14], sign: [[160, 62], [640, 60]],
    };
  }

  let bet = [25];
  function seat(L, key, [x, y]) {
    const c = CAST[key], C = [L.W / 2, L.top];
    const p = k => [x + (C[0] - x) * k, y + (C[1] - y) * k];
    const [cx, cy] = p(L.k[0]), [bx, by] = p(L.k[1]);
    let s = `<ellipse cx="${bx}" cy="${by}" rx="20" ry="11" fill="none" stroke="${T.feltText}" stroke-width="2" opacity=".55"/>`;
    if (c.you) s += `<ellipse cx="${bx}" cy="${by}" rx="24" ry="14" fill="none" stroke="${T.acc}" stroke-width="3"><animate attributeName="opacity" values="1;.25;1" dur="1.6s" repeatCount="indefinite"/></ellipse>`;
    s += chipStack(bx, by, c.you ? bet : c.bet);
    s += card(cx - 9, cy, ...c.hand[0], -7) + card(cx + 9, cy - 5, ...c.hand[1], 6);
    s += badge(cx + 40, cy - 16, wert(c.hand));
    return { felt: s, bust: bust(c, x, y, L.bs) };
  }

  const FILTERS = {
    a: '<filter id="fx" x="-20%" y="-20%" width="150%" height="160%"><feFlood flood-color="#000" flood-opacity=".38"/><feComposite in2="SourceAlpha" operator="in"/><feOffset dx="2" dy="4" result="s"/><feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
    b: '<filter id="fx" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
    c: '<filter id="fx" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#1a0d2e" flood-opacity=".4"/></filter>',
  };

  let svg;
  function render() {
    const L = lay();
    defs = ''; grads = {}; uid = 0;
    const seats = L.cast.map((k, i) => seat(L, k, L.seats[i]));
    const [dx, dy] = L.dealerCards;
    const body = bg(L)
      + bust(DEALER, L.dealer[0], L.dealer[1], L.W > 500 ? .9 : 1, true)
      + table(L) + lamp(L)
      + shoe(...L.shoe) + tray(...L.tray)
      + card(dx - 24, dy, '6', '♠')
      + `<rect x="${dx + 4}" y="${dy - CH / 2}" width="${CW}" height="${CH}" rx="5" fill="none" stroke="${T.feltText}" stroke-width="1.5" stroke-dasharray="4 3" opacity=".55"/>`
      + txt(dx + 24, dy + 6, '?', 18, T.feltText, 'opacity=".55"')
      + seats.map(s => s.felt).join('') + seats.map(s => s.bust).join('');
    svg.setAttribute('viewBox', `0 0 ${L.W} ${L.H}`);
    svg.innerHTML = `<defs>${FILTERS[STIL]}${defs}</defs>${body}`;
  }

  // ---------- Oberfläche ----------
  const fmt = n => n.toLocaleString('de-DE') + ' €';
  const sum = l => l.reduce((a, b) => a + b, 0);
  document.body.innerHTML = `
<div id="app">
  <div id="demo"><b>Entwurf ${STIL.toUpperCase()}</b><span>${T.name}</span><i></i>
    <button data-ov="count">Count-Frage</button><button data-ov="bet">Chips</button>
    ${['a', 'b', 'c'].map(s => `<a href="${s}.html" class="${s === STIL ? 'on' : ''}">${s.toUpperCase()}</a>`).join('')}</div>
  <header id="hud">
    <div class="pn lvl"><span class="ava">🦊</span><div><b>Level 3</b> <small>Frischling</small><div class="bar"><i style="width:62%"></i></div></div></div>
    <div class="pn pott"><small>Pott</small><b>+45 XP</b><em>🔥 ×1,2</em></div>
    <div class="pn geld"><small>Guthaben</small><b id="geld">${fmt(1000 - sum(bet))}</b></div>
  </header>
  <main id="stage"><svg id="scene" preserveAspectRatio="xMidYMid meet"></svg></main>
  <section id="aux">
    <p class="pn tip">💡 <b>Lehrer:</b> 8er-Paar gegen eine 6?</p>
    <button class="btn aux" data-a="bet">Einsatz<small id="betlbl">${fmt(sum(bet))}</small></button>
    <button class="btn aux" data-a="surr">Aufgeben<small>Surrender</small></button>
    <button class="btn aux" data-a="up">Aufstehen<small>Pott sichern</small></button>
  </section>
  <section id="main">
    <button class="btn hit" data-a="hit">Karte<small>Hit</small></button>
    <button class="btn stand" data-a="stand">Bleiben<small>Stand</small></button>
    <button class="btn dbl" data-a="dbl">Verdoppeln<small>Double</small></button>
    <button class="btn split" data-a="split">Teilen<small>Split</small></button>
  </section>
</div>
<div id="toast" class="pn"></div>
<div class="ov" id="ov-count"><div class="pn sheet">
  <h2>Wie hoch ist der True Count?</h2>
  <p>Schätz die restlichen Decks im Schuh – ein Blick auf die Ablage hilft.</p>
  <div class="timer"><i></i></div>
  <div class="grid" id="cgrid">${[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(v => `<button class="btn num" data-tc="${v}">${v > 0 ? '+' + v : v}</button>`).join('')}</div>
  <div id="cres" hidden></div>
</div></div>
<div class="ov" id="ov-bet"><div class="pn sheet">
  <h2>Einsatz</h2>
  <p>Hinterzimmer · 5 – 100 € pro Hand</p>
  <div class="pile" id="bpile"></div>
  <div class="bsum" id="bsum"></div>
  <div class="chips">${[1, 5, 25, 100].map(v => `<button class="chip c${v}" style="--cc:${CHIPC[v]}" data-chip="${v}">${v}</button>`).join('')}</div>
  <div class="row"><button class="btn aux" data-b="undo">↩ Zurück</button><button class="btn aux" data-b="clear">Leeren</button><button class="btn hit" data-b="ok">✓ Setzen</button></div>
</div></div>`;
  svg = document.getElementById('scene');

  const $ = s => document.querySelector(s);
  function toast(m) { const t = $('#toast'); t.innerHTML = m; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('on'), 2800); }
  let draft = [], t0 = 0;
  function openOv(id) {
    $('#ov-' + id).classList.add('open');
    if (id === 'count') {
      $('#cres').hidden = true; $('#cgrid').hidden = false;
      const bar = $('.timer i'); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
      t0 = Date.now();
    } else { draft = bet.slice(); drawBet(); }
  }
  const closeOv = () => document.querySelectorAll('.ov').forEach(o => o.classList.remove('open'));
  function drawBet() {
    $('#bsum').textContent = fmt(sum(draft));
    $('#bpile').innerHTML = draft.map(v => `<span class="mini" style="--cc:${CHIPC[v]}"></span>`).join('') || '<em>Tipp auf die Chips</em>';
  }
  const LEHRER = {
    hit: '👨‍🏫 Halt! Ein <b>8er-Paar</b> teilt man <b>immer</b> – auch gegen eine 6.',
    stand: '👨‍🏫 Mit 16 gegen eine 6 bleiben wäre okay – aber ein 8er-Paar <b>teilt</b> man.',
    dbl: '👨‍🏫 Verdoppeln mit 16? Lieber nicht. 8er werden <b>geteilt</b>!',
    split: '✅ <b>Richtig!</b> 8er immer teilen. <b>+1 XP</b> in den Pott.',
    surr: '👨‍🏫 Aufgeben lohnt nicht – die 6 des Dealers ist schwach.',
    up: '🚪 Aufstehen sichert deinen Pott (+45 XP). Kommt in Etappe 3.',
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('button,.ov');
    if (!b) return;
    if (b.classList.contains('ov')) { if (e.target === b) closeOv(); return; }
    const d = b.dataset;
    if (d.ov) openOv(d.ov);
    else if (d.a === 'bet') openOv('bet');
    else if (d.a) toast(LEHRER[d.a]);
    else if (d.tc !== undefined) {
      const v = +d.tc, sec = (Date.now() - t0) / 1000, ok = v === 2;
      $('#cgrid').hidden = true;
      const r = $('#cres');
      r.hidden = false;
      r.innerHTML = (ok ? `<h3>Richtig! 🎉</h3><p><b>+10 XP</b>${sec < 6 ? ' · <b>+5 Tempo-Bonus</b>' : ''} – ab in den Pott.</p>` : `<h3>Knapp daneben 😬</h3><p>Richtig wäre <b>+2</b> gewesen.</p>`)
        + `<p class="calc">Laufender Count <b>+7</b> · im Schuh noch ca. <b>3,5 Decks</b><br>+7 ÷ 3,5 = <b>+2</b> → hoher Count, mehr setzen!</p><button class="btn hit" data-close="1">Weiter</button>`;
    }
    else if (d.close) closeOv();
    else if (d.chip) {
      const v = +d.chip;
      if (sum(draft) + v > 100) { const s = $('#ov-bet .sheet'); s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake'); toast('Tischlimit: höchstens <b>100 €</b> pro Hand'); return; }
      draft.push(v); drawBet();
    }
    else if (d.b === 'undo') { draft.pop(); drawBet(); }
    else if (d.b === 'clear') { draft = []; drawBet(); }
    else if (d.b === 'ok') {
      if (sum(draft) < 5) { toast('Mindesteinsatz: <b>5 €</b>'); return; }
      bet = draft.slice(); closeOv(); render();
      $('#betlbl').textContent = fmt(sum(bet)); $('#geld').textContent = fmt(1000 - sum(bet));
      toast(`Gesetzt: <b>${fmt(sum(bet))}</b>`);
    }
  });
  addEventListener('resize', render);
  render();
})();
