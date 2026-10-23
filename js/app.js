// TrueCount – Etappe 1: der Hinterzimmer-Tisch mit allen Spielzügen.
import { Tisch, HINTERZIMMER } from './tisch.js';
import { wert, punkte } from './karten.js';
import { zeichne, CHIPC } from './szene.js';

const DU = 1; // dein Platz in der Mitte
const TEMPO = [['Langsam', 900], ['Normal', 600], ['Schnell', 350]];
const SPRUCH = { karte: 'Karte!', bleiben: 'Bleib!', verdoppeln: 'Doppelt!', teilen: 'Teilen!', aufgeben: 'Ich pass …' };
const KEY = 'truecount.v1';

const stand = { geld: 1000, einsatz: 10, decks: HINTERZIMMER.decks, schnitt: HINTERZIMMER.schnitt, tempo: 1 };
try { Object.assign(stand, JSON.parse(localStorage.getItem(KEY))); } catch {}
const speichern = () => { try { localStorage.setItem(KEY, JSON.stringify(stand)); } catch {} };

const $ = s => document.querySelector(s);
const fmt = n => n.toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' €';
const pause = ms => new Promise(r => setTimeout(r, ms));
function toast(m) { const t = $('#toast'); t.innerHTML = m; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('on'), 3000); }

let tisch, sprech = null, laeuft = false;
function neuerTisch() {
  tisch = new Tisch({ ...HINTERZIMMER, decks: stand.decks, schnitt: stand.schnitt }, [
    { name: 'Rambo-Rudi', figur: 'rudi', art: 'npc', stil: 'wild' },
    { name: 'Du', figur: 'du', art: 'mensch', geld: stand.geld },
    { name: 'Crazy Joe', figur: 'joe', art: 'npc', stil: 'basis', fehler: .15, versichert: .3 },
  ], crypto.getRandomValues(new Uint32Array(1))[0]);
}
const ich = () => tisch.plaetze[DU];
const zwischenRunden = () => tisch.phase === 'setzen' || tisch.phase === 'fertig';

// ---------- Anzeige ----------
const handText = k => { const { summe, soft } = wert(k); return soft && summe < 21 ? `${summe - 10}/${summe}` : summe; };
function hinweis() {
  const p = ich(), ph = tisch.phase;
  if (ph === 'setzen') return '🃏 Setz deinen Einsatz und tipp auf <b>Austeilen</b>.';
  if (ph === 'fertig') {
    const d = wert(tisch.dealer).summe, dealer = d > 21 ? 'Dealer überkauft' : `Dealer ${tisch.dealer.length === 2 && d === 21 ? 'Blackjack' : d}`;
    const g = p.gewinn, bj = p.haende.some(h => h.ergebnis === 'blackjack');
    return `${dealer} · ${bj ? '🎉 <b>Blackjack!</b>' : g > 0 ? '🎉 Gewonnen:' : g < 0 ? '😬 Verloren:' : '🤝 Unentschieden'} ${g ? `<b>${g > 0 ? '+' : '−'}${fmt(Math.abs(g))}</b>` : ''}`;
  }
  if (ph === 'versicherung') return '🛡️ Der Dealer zeigt ein Ass …';
  if (ph === 'spielen' && tisch.ap === DU) {
    const h = p.haende[tisch.ah], n = p.haende.length, up = tisch.dealer[0];
    return `👉 ${n > 1 ? `Hand ${tisch.ah + 1} von ${n}:` : 'Du bist dran:'} <b>${handText(h.karten)}</b> gegen <b>${up.r === 'A' ? 'Ass' : punkte(up.r)}</b>`;
  }
  if (ph === 'spielen') return `⏳ ${tisch.plaetze[tisch.ap].name} ist dran …`;
  if (ph === 'dealer') return '⏳ Frack-Fred deckt auf …';
  return '⏳ Frack-Fred teilt aus …';
}

function render() {
  // hochkant liegen die Knöpfe über dem unteren Teil der Szene
  const verdeckt = innerWidth > innerHeight ? 0 : $('#stage').getBoundingClientRect().bottom - $('#aux').getBoundingClientRect().top;
  zeichne($('#scene'), tisch, { du: DU, sprech, verdeckt });
  const p = ich(), zw = zwischenRunden(), m = tisch.ap === DU ? tisch.moeglich() : {};
  $('#app').dataset.modus = zw ? 'setzen' : 'zug';
  document.querySelectorAll('#main .z').forEach(b => { b.disabled = !m[b.dataset.a]; });
  $('[data-a=aufgeben]').disabled = !m.aufgeben;
  $('[data-a=optionen]').disabled = !zw || laeuft;
  $('#tischlimit').textContent = `${tisch.regeln.min} – ${tisch.regeln.max} € · ${tisch.regeln.decks} ${tisch.regeln.decks > 1 ? 'Decks' : 'Deck'}`;
  $('#geld').textContent = fmt(p.geld);
  $('#einsatz').textContent = fmt(tisch.phase === 'setzen' ? stand.einsatz : p.haende.reduce((a, h) => a + h.einsatz, 0) + (p.versicherung || 0));
  $('#betlbl').textContent = fmt(stand.einsatz);
  $('#deallbl').textContent = tisch.phase === 'fertig' ? 'Nächste Runde' : 'Austeilen';
  $('#tip').innerHTML = hinweis();
  if (tisch.phase === 'versicherung' && p.versicherung === null && !laeuft) {
    $('#vers-preis').textContent = fmt(p.einsatz / 2);
    $('[data-v="1"]').disabled = p.geld < p.einsatz / 2;
    $('#ov-vers').classList.add('open');
  }
}

// Spielt alle automatischen Schritte nacheinander ab, bis du dran bist oder die Runde vorbei ist
async function ablauf() {
  if (laeuft) return;
  laeuft = true;
  for (let ms = 150; ;) {
    await pause(ms);
    const ev = tisch.schritt();
    if (!ev) break;
    sprech = SPRUCH[ev.typ] && ev.an !== DU ? { platz: ev.an, text: SPRUCH[ev.typ] } : null;
    if (tisch.gemischt) { tisch.gemischt = false; toast('🔀 Der Schuh ist leer – Frack-Fred mischt die Ablage.'); }
    render();
    if (ev.typ === 'abrechnung') break;
    ms = TEMPO[stand.tempo][1] * (sprech ? 1.5 : 1);
  }
  sprech = null;
  laeuft = false;
  if (tisch.phase === 'fertig') { stand.geld = ich().geld; speichern(); }
  render();
}

function austeilen() {
  if (laeuft || !zwischenRunden()) return;
  if (tisch.phase === 'fertig' && tisch.neueRunde()) toast('✂️ Die Schnittkarte ist da – Frack-Fred mischt einen neuen Schuh.');
  const p = ich(), r = tisch.regeln;
  pleite();
  tisch.setzen(DU, Math.max(r.min, Math.min(stand.einsatz, p.geld, r.max)));
  tisch.start();
  stand.geld = p.geld; // wer mitten in der Runde geht, verliert den Einsatz – wie im Casino
  speichern();
  render();
  ablauf();
}

// Unter dem Mindesteinsatz geht es wieder bei 1.000 € los (die XP-Regeln dazu kommen in Etappe 3)
function pleite() {
  if (ich().geld >= tisch.regeln.min) return;
  ich().geld = stand.geld = 1000;
  speichern();
  toast('💸 <b>Pleite!</b> Du fängst wieder mit 1.000 € an.');
}

// ---------- Einsatz ----------
let draft = [];
const zerlegen = n => { const l = []; for (const c of [100, 25, 5, 1]) while (n >= c) { l.push(c); n -= c; } return l; };
const summe = l => l.reduce((a, b) => a + b, 0);
function drawBet() {
  $('#bsum').textContent = fmt(summe(draft));
  $('#bpile').innerHTML = draft.map(v => `<span class="mini" style="--cc:${CHIPC[v]}"></span>`).join('') || '<em>Tipp auf die Chips</em>';
}
function wackeln(m) {
  const s = $('#ov-bet .sheet');
  s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake');
  toast(m);
}
function openBet() {
  const r = tisch.regeln;
  pleite();
  draft = zerlegen(Math.min(stand.einsatz, ich().geld));
  $('#bet-info').textContent = `${r.name} · ${r.min} – ${r.max} € pro Hand`;
  $('#chips').innerHTML = [1, 5, 25, 100].map(v => `<button class="chip c${v}" style="--cc:${CHIPC[v]}" data-chip="${v}">${v}</button>`).join('');
  drawBet();
  $('#ov-bet').classList.add('open');
}

// ---------- Optionen ----------
let optVorher = '';
function drawOpt() {
  $('#o-decks').textContent = stand.decks;
  $('#o-schnitt').textContent = Math.round(stand.schnitt * 100) + ' %';
  $('#o-tempo').textContent = TEMPO[stand.tempo][0];
}
function option(o) {
  const [k, d] = o.split(':'), r = +d;
  if (k === 'decks') stand.decks = Math.min(8, Math.max(1, stand.decks + r));
  if (k === 'schnitt') stand.schnitt = Math.min(.85, Math.max(.5, Math.round((stand.schnitt + r * .05) * 100) / 100));
  if (k === 'tempo') stand.tempo = Math.min(2, Math.max(0, stand.tempo + r));
  speichern();
  drawOpt();
}
function closeOv() {
  document.querySelectorAll('.ov.open').forEach(o => {
    o.classList.remove('open');
    if (o.id === 'ov-opt' && optVorher !== `${stand.decks}/${stand.schnitt}`) {
      neuerTisch();
      toast(`🔀 Neuer Schuh mit <b>${stand.decks} ${stand.decks > 1 ? 'Decks' : 'Deck'}</b>, Schnittkarte bei ${Math.round(stand.schnitt * 100)} %.`);
      render();
    }
  });
}

// ---------- Bedienung ----------
document.addEventListener('click', e => {
  const b = e.target.closest('button,.ov');
  if (!b) return;
  if (b.classList.contains('ov')) { if (e.target === b && !b.classList.contains('fest')) closeOv(); return; }
  const d = b.dataset, r = tisch.regeln;
  if (d.a === 'austeilen') austeilen();
  else if (d.a === 'einsatz') openBet();
  else if (d.a === 'optionen') { optVorher = `${stand.decks}/${stand.schnitt}`; drawOpt(); $('#ov-opt').classList.add('open'); }
  else if (d.a) { if (tisch.aktion(DU, d.a)) { render(); ablauf(); } }
  else if (d.v) { $('#ov-vers').classList.remove('open'); tisch.versichern(DU, d.v === '1'); render(); ablauf(); }
  else if (d.o) option(d.o);
  else if (d.zu) closeOv();
  else if (d.chip) {
    const v = +d.chip, grenze = Math.min(r.max, ich().geld);
    if (summe(draft) + v > grenze) return wackeln(grenze < r.max ? `Du hast nur <b>${fmt(ich().geld)}</b>` : `Tischlimit: höchstens <b>${fmt(r.max)}</b> pro Hand`);
    draft.push(v);
    drawBet();
  }
  else if (d.b === 'undo') { draft.pop(); drawBet(); }
  else if (d.b === 'clear') { draft = []; drawBet(); }
  else if (d.b === 'ok') {
    if (summe(draft) < r.min) return wackeln(`Mindesteinsatz: <b>${fmt(r.min)}</b>`);
    stand.einsatz = summe(draft);
    speichern();
    closeOv();
    austeilen();
  }
});
addEventListener('resize', render);

neuerTisch();
render();
document.fonts?.ready.then(render);
