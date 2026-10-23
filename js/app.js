// TrueCount – Hauptprogramm: Lobby, Tisch, Count-Fragen, Lehrer, XP, Shop, Erfolge, Optionen und Admin-Modus.
import { Tisch, ZUG, istBJ } from './tisch.js';
import { wert, punkte } from './karten.js';
import { lehrerZug, lehrerAusfuehrlich, zugName, versicherungRichtig, einsatzBewerten } from './strategie.js';
import { zeichne, CHIPC } from './szene.js';
import { TISCHE, NPC, tischNr } from './tische.js';
import { figurBild, deineFigur, TIERE, OUTFITS, ACCESSOIRES, FAECHER, accNr } from './figuren.js';
import * as pr from './profil.js';
import { sound, aktivieren, lautstaerke, ambienteStart, ambienteStop } from './sound.js';
import { $, fmt, zahl, vz, pause, zufallZwischen, toast, sheet, sheetZu, sheetOffen, wackeln, zahlenfeld, taste, uhu, uhuWeg, uhuOffen } from './ui.js';
import { trainingMenue, trainingKlick } from './training.js';

const TEMPO = [['Langsam', 900], ['Normal', 600], ['Schnell', 350]];
const SPRUCH = { karte: 'Karte!', bleiben: 'Bleib!', verdoppeln: 'Doppelt!', teilen: 'Teilen!', aufgeben: 'Ich pass …' };
const E = pr.E;

// Hilfen gibt es nur an den ersten Tischen (Wunsch vom 23.10.): Zählwerte auf den Karten bis Tisch 2,
// Deck-Anzeige und Lehrer bis Tisch 3, Professor Uhu (der i-Knopf) nur an Tisch 1. Die höheren Tische werden dadurch schwerer.
const HILFE_BIS = { zaehlwerte: 2, decks: 3, lehrer: 3, uhu: 1 };
const hilfe = (k, nr = T?.nr) => nr <= HILFE_BIS[k];
const lehrerAn = () => E.lehrer && hilfe('lehrer');
function hilfenText(nr) {
  const l = [hilfe('zaehlwerte', nr) && 'Zählwerte', hilfe('decks', nr) && 'Deck-Anzeige', hilfe('lehrer', nr) && 'Lehrer', hilfe('uhu', nr) && 'Professor Uhu'].filter(Boolean);
  return l.length ? `Hilfen: ${l.join(', ')}` : 'Keine Hilfen mehr – jetzt zählst du allein';
}

// ---------- Meldungen aus dem Spielstand ----------
function meldungenZeigen() {
  while (pr.meldungen.length) {
    const m = pr.meldungen.shift();
    toast(`${m.emoji} ${m.text}`, { ms: 2600, ton: m.art === 'level' ? 'level' : m.art === 'erfolg' ? 'erfolg' : null });
  }
}
// Zähler hochsetzen und bei bestimmten Ständen einen Erfolg vergeben
function zaehlerErfolg(k, n, stufen) {
  const v = pr.zaehlen(k, n);
  for (const [grenze, id] of stufen) if (v >= grenze) pr.erfolg(id);
}

// ---------- Bildschirme ----------
function zeige(s) {
  document.body.dataset.screen = s;
  if (s !== 'tisch') ambienteStop();
  if (s === 'lobby') lobbyZeigen();
  if (s === 'training') trainingMenue();
}

// ---------- Lobby ----------
function lobbyZeigen() {
  pr.freischalten();
  const P = pr.P, f = pr.fortschritt(P.xp);
  $('#admin-badge').hidden = !pr.istAdmin();
  $('[data-l=admin]').innerHTML = pr.istAdmin() ? '🔑 Admin aus' : '🔑 Admin';
  $('#profil').innerHTML = (P.figur ? figurBild(deineFigur(P.figur), 'ava-gross') : '')
    + `<div class="pdaten"><b>Level ${f.level} · ${f.titel}</b><div class="bar"><i style="width:${(f.anteil * 100).toFixed(1)}%"></i></div>`
    + `<small>${zahl(P.xp, 0)} XP · noch ${zahl(f.fehlt, 0)} bis Level ${f.level + 1}</small>`
    + `<div class="zahlen"><span>💰 <b>${fmt(P.geld)}</b></span><span>🔥 Serie ×${zahl(pr.serienFaktor(P.serie))}</span>`
    + `<span>🎯 Quote ${Math.round(pr.quote() * 100)} %</span><span>💸 ${P.pleiten} ${P.pleiten === 1 ? 'Pleite' : 'Pleiten'}</span></div>`
    + `<em class="mehr">Profil & Charakter ›</em></div>`;
  $('#tischliste').innerHTML = TISCHE.map(tischKarte).join('');
  meldungenZeigen();
  if (!P.figur) figurWahl();
}
function tischKarte(t) {
  const P = pr.P, offen = P.tische.includes(t.nr), b = pr.freischaltBedingung(t), hier = P.sitzung?.tisch === t.nr;
  const limit = t.max === Infinity ? `ab ${fmt(t.min)}, ohne Limit` : `${fmt(t.min)} – ${fmt(t.max)}`;
  const info = `${limit} · ${t.decks} Decks${t.hands[1] > 1 ? ` · ${t.hands[0]}–${t.hands[1]} Hände` : ''}`;
  let unten;
  if (!offen) {
    const bed = [[`${fmt(t.frei.geld)} Guthaben`, b.geld], [`Level ${t.frei.level}`, b.level]];
    if (t.frei.quote) bed.push([`${t.frei.quote * 100} % Count-Quote`, b.quote]);
    unten = `<ul class="bed">${bed.map(([s, ok]) => `<li class="${ok ? 'ok' : ''}">${ok ? '✓' : '✗'} ${s}</li>`).join('')}</ul>`;
  } else if (P.sitzung && !hier) unten = `<small>Du sitzt noch im ${tischNr(P.sitzung.tisch).name}.</small>`;
  else if (!hier && P.geld < t.sitz) unten = `<small>Zum Hinsetzen brauchst du ${fmt(t.sitz)}.</small>`;
  else unten = `<button class="btn hit" data-sitz="${t.nr}">${hier ? `Weiterspielen<small>Pott +${P.sitzung.pott} XP</small>` : 'Hinsetzen'}</button>`;
  return `<div class="pn tischkarte ${offen ? '' : 'zu'}" style="--filz:${t.filz}"><div class="tk-kopf"><b>${offen ? '' : '🔒 '}${t.name}</b><small>Tisch ${t.nr} · ${info}</small><small class="hilfen">${hilfenText(t.nr)}</small></div>${unten}</div>`;
}

// ---------- Charakter wählen (einmal am Anfang) ----------
let wahl = { tier: 'fuchs', farbe: TIERE.fuchs.farben[0], outfit: pr.STARTER[0] };
function figurWahl() {
  sheet(`<h2>Wer bist du?</h2><p>Such dir dein Tier aus. Die Farbe kannst du später im Shop ändern, dort gibt es auch neue Outfits.</p>`
    + `<div class="vorschau">${figurBild(deineFigur(wahl))}</div>`
    + `<div class="wahl">${Object.entries(TIERE).map(([k, t]) => `<button class="btn aux ${k === wahl.tier ? 'an' : ''}" data-tier="${k}">${t.name}</button>`).join('')}</div>`
    + `<div class="farben">${TIERE[wahl.tier].farben.map(c => `<button class="farbe ${c === wahl.farbe ? 'an' : ''}" style="--c:${c}" data-farbe="${c}" aria-label="Farbe"></button>`).join('')}</div>`
    + `<div class="wahl">${pr.STARTER.map(id => `<button class="btn aux ${id === wahl.outfit ? 'an' : ''}" data-outfit="${id}">${OUTFITS.find(o => o.id === id).name}</button>`).join('')}</div>`
    + `<button class="btn hit voll" data-wahl="ok">Los geht's!</button>`, { fest: true });
}

// ---------- Tisch aufbauen ----------
// DU = deine Plätze (eine Hand je Platz), ICH = dein Hauptplatz, FREI = leere Plätze, auf die du noch eine Hand legen kannst
let tisch, T, KONTO, DU = [], FREI = [], ICH = 0, sprech = null, laeuft = false, runde = {};
const sitzung = () => pr.P.sitzung;
const mehrHaende = () => T.hands[1] > 1;
const einsatzWert = () => pr.P.einsatz[T.nr] || T.min * 2;

// Sitzordnung: Bei Tischen mit einer Hand kannst du deinen Platz frei wählen
function sitzordnung() {
  const a = [...T.plaetze], wunsch = pr.P.einsatz['p' + T.nr];
  if (T.hands[1] === 1 && wunsch !== undefined && wunsch < a.length) {
    const du = a.indexOf('du');
    [a[du], a[wunsch]] = [a[wunsch], a[du]];
  }
  return a;
}
function tischBauen(alterSchuh = null) {
  const a = sitzordnung(), mitte = (a.length - 1) / 2, naheMitte = (x, y) => Math.abs(x - mitte) - Math.abs(y - mitte);
  const moeglich = a.map((k, i) => k === 'du' ? i : -1).filter(i => i >= 0);
  // Mehrere Hände: Die gewählten Plätze stehen im Spielstand, sonst spielst du eine Hand am mittleren Platz
  const wahl = mehrHaende() ? (pr.P.einsatz['s' + T.nr] || []).filter(i => moeglich.includes(i)).slice(0, T.hands[1]) : [];
  DU = (wahl.length ? wahl : [[...moeglich].sort(naheMitte)[0]]).sort((x, y) => x - y);
  ICH = [...DU].sort(naheMitte)[0];
  FREI = moeglich.filter(i => !DU.includes(i));
  const plaetze = a.map((k, i) => {
    if (k === 'du') return DU.includes(i) ? { name: '', figur: null, art: 'mensch', konto: KONTO } : { name: '', art: 'leer' };
    return k ? { ...NPC[k], figur: NPC[k], art: 'npc' } : { name: '', art: 'leer' };
  });
  const regeln = { name: T.name, min: T.min, max: T.max, decks: E.decks || T.decks, schnitt: E.schnitt };
  tisch = new Tisch(regeln, plaetze, crypto.getRandomValues(new Uint32Array(1))[0]);
  if (alterSchuh) Object.assign(tisch, alterSchuh); // Platz- oder Händewechsel: der Schuh bleibt
}
const schuhMerken = () => ({ schuh: tisch.schuh, ablage: tisch.ablage, rc: tisch.rc, rnd: tisch.rnd, schuhNr: tisch.schuhNr });

function hinsetzen(nr) {
  const t = tischNr(nr);
  if (!pr.P.sitzung && !pr.darfSitzen(t)) return;
  if (!pr.hinsetzen(t)) return;
  T = t;
  KONTO = { geld: pr.P.geld };
  if (!sitzung().naechsteFrage) sitzung().naechsteFrage = zufallZwischen(T.fragen);
  tischBauen();
  pr.speichern();
  zeige('tisch');
  aktivieren();
  if (E.ton) ambienteStart(T.nr >= 3);
  render();
  toast(`${T.name}: ${T.nr === 1 ? 'Willkommen im Hinterzimmer. Crazy Joe ist schon wieder blau …' : `Tisch ${T.nr}, ${T.decks} Decks im Schuh. Viel Glück!`}`);
}

// ---------- Anzeige am Tisch ----------
const zwischenRunden = () => tisch.phase === 'setzen' || tisch.phase === 'fertig';
const meinZug = () => tisch.phase === 'spielen' && DU.includes(tisch.ap);
const handText = k => { const { summe, soft } = wert(k); return soft && summe < 21 ? `${summe - 10}/${summe}` : summe; };
function hinweis() {
  const ph = tisch.phase;
  if (ph === 'setzen') return mehrHaende() && DU.length < T.hands[1] ? '🃏 <b>+</b> = noch eine Hand, dann <b>Austeilen</b>' : `🃏 Tipp auf <b>Austeilen</b> – oder ändere vorher deinen Einsatz.`;
  if (ph === 'fertig') {
    const d = wert(tisch.dealer).summe, dealer = d > 21 ? 'Dealer überkauft' : `Dealer ${tisch.dealerBJ ? 'Blackjack' : d}`;
    const g = DU.reduce((a, i) => a + tisch.plaetze[i].gewinn, 0), bj = DU.some(i => tisch.plaetze[i].haende.some(h => h.ergebnis === 'blackjack'));
    return `${dealer} · ${bj && g > 0 ? '🎉 <b>Blackjack!</b>' : g > 0 ? '🎉 Gewonnen:' : g < 0 ? '😬 Verloren:' : '🤝 Unentschieden'} ${g ? `<b>${g > 0 ? '+' : '−'}${fmt(Math.abs(g))}</b>` : ''}`;
  }
  if (ph === 'versicherung') return `🛡️ Der Dealer zeigt ein Ass …`;
  if (meinZug()) {
    const p = tisch.plaetze[tisch.ap], h = p.haende[tisch.ah], up = tisch.dealer[0], n = p.haende.length;
    const wo = DU.length > 1 ? `Hand ${DU.indexOf(tisch.ap) + 1}${n > 1 ? `.${tisch.ah + 1}` : ''}: ` : n > 1 ? `Hand ${tisch.ah + 1} von ${n}: ` : 'Du bist dran: ';
    return `👉 ${wo}<b>${handText(h.karten)}</b> gegen <b>${up.r === 'A' ? 'Ass' : punkte(up.r)}</b>`;
  }
  if (ph === 'spielen') return `⏳ ${tisch.plaetze[tisch.ap].name} ist dran …`;
  if (ph === 'dealer') return `⏳ Frack-Fred deckt auf …`;
  return `⏳ Frack-Fred teilt aus …`;
}
function hudZeigen() {
  const P = pr.P, f = pr.fortschritt(P.xp), s = sitzung();
  $('#hud-ava').innerHTML = P.figur ? figurBild(deineFigur(P.figur), 'ava') : '';
  $('#hud-level').textContent = `Level ${f.level}`;
  $('#hud-titel').textContent = pr.istAdmin() ? 'Admin' : !E.lehrer && !E.fragen ? 'Freestyle' : f.titel;
  $('#hud-bar').style.width = (f.anteil * 100).toFixed(1) + '%';
  $('#hud-pott').textContent = `+${s ? s.pott : 0} XP`;
  $('#hud-serie').textContent = `🔥 ×${zahl(pr.serienFaktor(P.serie))}`;
  $('#geld').textContent = fmt(KONTO.geld);
}
function render() {
  if (!tisch) return;
  // hochkant liegen die Knöpfe über dem unteren Teil der Szene
  const verdeckt = innerWidth > innerHeight ? 0 : $('#stage').getBoundingClientRect().bottom - $('#aux').getBoundingClientRect().top;
  const zw = zwischenRunden(), wechseln = zw && !laeuft && mehrHaende();
  // Deine Figur sitzt an der Hand, die gerade dran ist, sonst an deinem Hauptplatz
  const bei = meinZug() ? tisch.ap : ICH;
  DU.forEach(i => { const p = tisch.plaetze[i]; p.figur = i === bei ? deineFigur(pr.P.figur) : null; p.name = i === bei ? 'Du' : ''; });
  zeichne($('#scene'), tisch, {
    nr: T.nr, filz: T.filz, sprech, verdeckt, zaehlwerte: E.zaehlwerte && hilfe('zaehlwerte'), decks: hilfe('decks'),
    admin: pr.istAdmin() && E.countAnzeige, setzen: zw ? DU : [],
    plus: wechseln && DU.length < T.hands[1] ? FREI : [], minus: wechseln && DU.length > 1 ? DU.filter(i => i !== ICH) : [],
  });
  const m = meinZug() ? tisch.moeglich() : {};
  $('[data-a=info]').hidden = !(hilfe('uhu') && meinZug());
  $('#app').dataset.modus = zw ? 'setzen' : 'zug';
  document.querySelectorAll('#main .z').forEach(b => { b.disabled = !m[b.dataset.a]; });
  $('[data-a=aufgeben]').disabled = !m.aufgeben;
  $('[data-a=aufstehen]').disabled = !zw || laeuft;
  $('[data-a=optionen]').disabled = !zw || laeuft;
  $('#betlbl').textContent = fmt(einsatzWert()) + (DU.length > 1 ? ` × ${DU.length}` : '');
  $('#deallbl').textContent = tisch.phase === 'fertig' ? 'Nächste Runde' : 'Austeilen';
  $('#tip').innerHTML = hinweis();
  hudZeigen();
  if (tisch.phase === 'versicherung' && !laeuft && !sheetOffen() && DU.some(i => tisch.plaetze[i].versicherung === null)) versicherungFragen();
}

// ---------- Ablauf einer Runde ----------
async function ablauf() {
  if (laeuft) return;
  laeuft = true;
  const ms = TEMPO[E.tempo][1] * T.tempo;
  for (let warte = 150; ;) {
    await pause(warte);
    const ev = tisch.schritt();
    if (!ev) break;
    sprech = SPRUCH[ev.typ] && !DU.includes(ev.an) ? { platz: ev.an, text: SPRUCH[ev.typ] } : null;
    if (ev.typ === 'karte' || ev.typ === 'verdoppeln') sound.karte();
    if (ev.typ === 'teilen' || ev.typ === 'verdoppeln') sound.chip();
    if (tisch.gemischt) { tisch.gemischt = false; toast('🔀 Der Schuh ist leer – Frack-Fred mischt die Ablage.'); sound.mischen(); }
    if (ev.typ === 'abrechnung') { laeuft = false; rundeAuswerten(); render(); return; }
    render();
    warte = ms * (sprech ? 1.5 : 1);
  }
  sprech = null;
  laeuft = false;
  render();
}

// Tipp auf „Austeilen“ / „Nächste Runde“
function naechsteRunde() {
  if (laeuft || !zwischenRunden() || sheetOffen()) return;
  if (tisch.phase === 'fertig') abraeumen();
  const s = sitzung();
  if (E.fragen && s.naechsteFrage <= 0 && tisch.gespielt() >= 12) return countFrage();
  austeilen();
}
function abraeumen() {
  if (!tisch.neueRunde()) return render();
  const s = sitzung().schuh;
  if (s.fragen >= 3 && s.richtig === s.fragen) pr.erfolg('perfekter_schuh');
  sitzung().schuh = { fragen: 0, richtig: 0 };
  toast('✂️ Die Schnittkarte ist da – Frack-Fred mischt einen neuen Schuh. Der Count beginnt wieder bei 0.');
  sound.mischen();
  meldungenZeigen();
  render();
}

function austeilen() {
  if (laeuft || !zwischenRunden()) return;
  if (tisch.phase === 'fertig') abraeumen();
  const r = tisch.regeln, s = sitzung();
  if (KONTO.geld < r.min) return zuWenigGeld();
  const e = Math.max(r.min, Math.min(einsatzWert(), r.max, KONTO.geld));
  const n = Math.min(DU.length, Math.floor(KONTO.geld / e));
  DU.forEach((i, j) => tisch.setzen(i, j < n ? e : 0));
  const tc = tisch.trueCount();
  tisch.start();
  runde = { tc, allIn: KONTO.geld === 0, versichertBeiTc: false };
  sound.chip();
  if (n >= 3) pr.erfolg('mehrhaendig');
  if (E.lehrer) { // Einsatz nach dem Count bewerten. Ab Tisch 4 gibt es die XP still, ohne Hinweis.
    const b = einsatzBewerten(e, tc, r.min, r.max);
    if (b.ok) { pr.xpPott(3); if (tc >= 2 && lehrerAn()) toast(`💰 ${b.text} <b>+3 XP</b>`); }
    else if (lehrerAn()) toast(`💡 ${b.text}`, { ms: 3600 });
  }
  meldungenZeigen();
  s.naechsteFrage--;
  pr.P.geld = KONTO.geld; // wer mitten in der Runde geht, verliert den Einsatz – wie im Casino
  pr.speichern();
  render();
  ablauf();
}

// Dein Zug. Der Lehrer prüft vorher, was richtig wäre.
function spielerZug(a) {
  if (!meinZug()) return;
  const i = tisch.ap, h = tisch.plaetze[i].haende[tisch.ah], rat = lehrerZug(h.karten, tisch.dealer[0], tisch.moeglich(), tisch.trueCount());
  if (!tisch.aktion(i, a)) return;
  sound[a === 'teilen' || a === 'verdoppeln' ? 'chip' : a === 'karte' ? 'karte' : 'klick']();
  if (E.lehrer) { // ab Tisch 4 schweigt der Lehrer, die XP für richtige Züge gibt es trotzdem
    if (ZUG[rat.zug] === a) {
      pr.xpPott(1);
      zaehlerErfolg('zugSerie', 1, [[50, 'lehrers_liebling']]);
      if (rat.abweichung && lehrerAn()) toast(`✅ Stark! ${rat.text} <b>+1 XP</b>`, { ms: 3600, vorne: true });
    } else {
      pr.P.stat.zugSerie = 0;
      if (lehrerAn()) toast(`👨‍🏫 Besser: <b>${zugName(rat.zug)}</b>. ${rat.text}`, { ms: 4200, ton: 'falsch', vorne: true });
    }
  }
  render();
  ablauf();
}

// Der i-Knopf (nur an Tisch 1): Professor Uhu kommt ins Bild und erklärt ausführlich, was du tun sollst und warum.
// Das Spiel wartet ohnehin auf deinen Zug, bis er wieder weg ist.
function uhuFragen() {
  if (!meinZug() || !hilfe('uhu')) return;
  const h = tisch.plaetze[tisch.ap].haende[tisch.ah], e = lehrerAusfuehrlich(h.karten, tisch.dealer[0], tisch.moeglich(), tisch.trueCount());
  uhu(`Mein Tipp: ${zugName(e.zug)}`, e.absaetze, { knopf: 'Alles klar, weiter!' });
}

// Plus auf einem leeren Platz: noch eine Hand dazu. Rotes ×: die Hand wieder weglegen. Geht nur zwischen den Runden.
function haendeAendern(i, dazu) {
  if (laeuft || !zwischenRunden() || sheetOffen()) return;
  if (dazu && (!FREI.includes(i) || DU.length >= T.hands[1])) return;
  if (!dazu && (!DU.includes(i) || i === ICH)) return;
  if (dazu && KONTO.geld < einsatzWert() * (DU.length + 1)) return toast(`Für noch eine Hand reicht dein Guthaben nicht (${fmt(einsatzWert())} pro Hand).`, { vorne: true });
  if (tisch.phase === 'fertig') abraeumen();
  pr.P.einsatz['s' + T.nr] = dazu ? [...DU, i] : DU.filter(x => x !== i);
  tischBauen(schuhMerken());
  pr.speichern();
  sound[dazu ? 'chip' : 'klick']();
  render();
}

function versicherungFragen() {
  const mein = DU.filter(i => tisch.plaetze[i].versicherung === null), preis = mein.reduce((a, i) => a + tisch.plaetze[i].einsatz / 2, 0);
  sheet(`<h2>Versicherung?</h2><p>Der Dealer zeigt ein <b>Ass</b>. Die Versicherung kostet <b>${fmt(preis)}</b>${mein.length > 1 ? ` (für ${mein.length} Hände)` : ''} und zahlt 2 zu 1, wenn er Blackjack bekommt.</p>`
    + `<div class="row zwei"><button class="btn aux" data-v="0">Nein</button><button class="btn hit" data-v="1" ${KONTO.geld < preis ? 'disabled' : ''}>Ja, versichern</button></div>`, { fest: true, klar: true });
}
function versichern(ja) {
  sheetZu();
  const tc = tisch.trueCount(), richtig = versicherungRichtig(tc) === ja;
  DU.forEach(i => tisch.plaetze[i].versicherung === null && tisch.versichern(i, ja));
  runde.versichertBeiTc = ja && tc >= 3;
  if (ja) sound.chip();
  if (E.lehrer) {
    if (richtig) { pr.xpPott(1); if (ja && lehrerAn()) toast(`✅ Richtig: Bei True Count ${vz(tc)} lohnt sich die Versicherung. <b>+1 XP</b>`); }
    else if (lehrerAn()) toast(`👨‍🏫 ${ja ? `Versicherung lohnt sich erst ab True Count +3 (jetzt ${vz(tc)}).` : `Bei True Count ${vz(tc)} hättest du versichern sollen – ab +3 lohnt es sich.`}`, { ms: 4000, ton: 'falsch', vorne: true });
  }
  render();
  ablauf();
}

// Nach der Abrechnung: Geld, Statistik, Erfolge
function rundeAuswerten() {
  const P = pr.P, s = sitzung(), haende = DU.flatMap(i => tisch.plaetze[i].haende);
  const g = DU.reduce((a, i) => a + tisch.plaetze[i].gewinn, 0);
  P.geld = KONTO.geld;
  s.haende++;
  zaehlerErfolg('haende', haende.length, [[1, 'erste_hand'], [100, 'haende_100'], [1000, 'haende_1000'], [10000, 'haende_10000']]);
  const bj = haende.some(h => h.ergebnis === 'blackjack');
  if (bj) { pr.erfolg('erster_bj'); if (P.stat.letzteBJ) pr.erfolg('bj_serie'); }
  P.stat.letzteBJ = bj;
  if (haende.some(h => h.ergebnis === 'gewonnen' && h.karten.length >= 5)) pr.erfolg('fuenf_karten');
  const dopp = haende.filter(h => h.verdoppelt && h.ergebnis === 'gewonnen').length;
  if (dopp) zaehlerErfolg('verdoppeltGewonnen', dopp, [[25, 'verdoppler']]);
  if (DU.some(i => tisch.plaetze[i].haende.length === 4 && tisch.plaetze[i].haende.every(h => h.ergebnis === 'gewonnen'))) pr.erfolg('split_koenig');
  if (runde.allIn && g > 0) pr.erfolg('all_in');
  if (runde.versichertBeiTc && tisch.dealerBJ) pr.erfolg('versichert');
  sound[bj && g > 0 ? 'blackjack' : g > 0 ? 'gewinn' : g < 0 ? 'verlust' : 'push']();
  pr.geldGeaendert();
  pr.freischalten();
  pr.speichern();
  meldungenZeigen();
  if (KONTO.geld < TISCHE[0].min) pleiteZeigen();
  else if (KONTO.geld < tisch.regeln.min) zuWenigGeld();
}

function zuWenigGeld() {
  sheet(`<h2>Zu wenig Chips</h2><p>Für diesen Tisch reicht dein Guthaben (${fmt(KONTO.geld)}) nicht mehr. Steh auf und sichere deinen Pott – im Hinterzimmer geht es weiter.</p>`
    + `<button class="btn hit voll" data-a="aufstehen">Aufstehen</button>`, { fest: true });
}
function pleiteZeigen() {
  const pott = pr.pleite();
  tisch = null;
  meldungenZeigen();
  sound.verlust();
  sheet(`<h2>💸 Pleite!</h2><p>Frack-Fred schiebt dir mitleidig einen Kaffee rüber.</p><p class="calc">Dein Pott (<b>${pott} XP</b>) ist weg und der Serien-Bonus fällt auf ×1.<br>`
    + `Level, Erfolge, Tische und Outfits bleiben. Du fängst wieder mit <b>1.000 €</b> an.</p><button class="btn hit voll" data-l="lobby">Zur Lobby</button>`, { fest: true });
}

function aufstehen() {
  if (laeuft || !zwischenRunden()) return;
  if (sheetOffen()) sheetZu();
  if (tisch.phase === 'fertig') tisch.neueRunde();
  pr.P.geld = KONTO.geld;
  const tc = tisch.trueCount(), i = pr.aufstehen(tc);
  tisch = null;
  sound.kasse();
  const zeile = (a, b) => `<div class="zeile"><span>${a}</span><b>${b}</b></div>`;
  sheet(`<h2>🚪 Aufgestanden</h2><p>${i.haende} Runden · ${i.gewinn >= 0 ? 'Gewinn' : 'Verlust'}: <b>${i.gewinn >= 0 ? '+' : '−'}${fmt(Math.abs(i.gewinn))}</b></p><div class="calc">`
    + zeile('Pott', `${i.pott} XP`) + zeile('Serien-Bonus', `× ${zahl(i.faktor)}`)
    + (i.wong ? zeile(`Wonging (True Count ${vz(tc)})`, `+${i.wong} XP`) : '') + (i.sitzungsXp ? zeile('Sitzungsgewinn', `+${i.sitzungsXp} XP`) : '')
    + `<hr>${zeile('Gesichert', `+${i.gesichert} XP`)}</div>`
    + `<p>${i.gewinn > 0 && i.haende >= 5 ? `🔥 Gewinn-Sitzung! Dein Serien-Bonus steigt auf ×${zahl(pr.serienFaktor(i.serie))}.` : i.gewinn < 0 ? 'Verlust-Sitzung: Der Serien-Bonus fängt wieder bei ×1 an.' : ''}</p>`
    + `<button class="btn hit voll" data-l="lobby">Zur Lobby</button>`, { fest: true });
}

// ---------- Count-Frage vor dem Setzen ----------
let frage = null;
function countFrage() {
  const rc = tisch.rc, rest = tisch.restDecks(), est = Math.max(.5, Math.round(rest * 2) / 2), art = Math.random() < .3 ? 'rc' : 'tc';
  // Wer die Decks um ein halbes Deck anders schätzt, liegt auch richtig
  const richtig = art === 'rc' ? [rc] : [...new Set([est - .5, est, est + .5].filter(d => d >= .5).map(d => Math.trunc(rc / d)))];
  frage = { art, rc, rest, est, richtig, haupt: art === 'rc' ? rc : Math.trunc(rc / est), start: performance.now() };
  sheet(`<h2>${art === 'tc' ? 'Wie hoch ist der True Count?' : 'Wie hoch ist der laufende Count?'}</h2>`
    + `<p>${art === 'tc' ? 'Laufender Count geteilt durch die Decks im Schuh. Schätz die Decks mit einem Blick auf Schuh und Ablage.' : 'Die Summe aller Zählwerte seit dem Mischen.'}</p>`
    + (T.zeit ? `<div class="timer"><i style="animation-duration:${T.zeit}s"></i></div>` : '') + zahlenfeld(antwort), { fest: true, klar: true });
  if (T.zeit) frage.timer = setTimeout(() => antwort(null), T.zeit * 1000);
}
function antwort(w) {
  const f = frage, s = sitzung();
  if (!f || f.fertig) return;
  f.fertig = true;
  clearTimeout(f.timer);
  const sek = (performance.now() - f.start) / 1000, ok = w !== null && f.richtig.includes(w);
  let xp = 0;
  if (ok) {
    xp = pr.xpPott(10 + (sek < 3 ? 5 : sek < 6 ? 3 : sek < 10 ? 1 : 0));
    zaehlerErfolg('countRichtig', 1, [[50, 'zaehler_50'], [500, 'zaehler_500']]);
    if (f.art === 'tc' && sek < 3) zaehlerErfolg('schnell', 1, [[10, 'schnellrechner']]);
  }
  pr.countAntwort(ok);
  s.schuh.fragen++;
  if (ok) s.schuh.richtig++;
  s.naechsteFrage = zufallZwischen(T.fragen);
  pr.speichern();
  sound[ok ? 'richtig' : 'falsch']();
  const decks = tisch.regeln.decks, dz = n => zahl(n, 2);
  const weg = f.art === 'tc'
    ? `In der Ablage liegen ca. <b>${dz(decks - f.rest)}</b> von ${decks} Decks → im Schuh noch ca. <b>${dz(f.est)} Decks</b><br>Laufender Count <b>${vz(f.rc)}</b> ÷ ${dz(f.est)} = ${dz(f.rc / f.est)} → abgerundet <b>${vz(f.haupt)}</b>`
    : `Seit dem Mischen wurden ${tisch.gespielt() - 1} Karten offen gespielt. Ihre Zählwerte ergeben <b>${vz(f.rc)}</b>.<br>Bei ca. ${dz(f.est)} Decks im Schuh ist das ein True Count von <b>${vz(Math.trunc(f.rc / f.est))}</b>.`;
  const tc = Math.trunc(f.rc / f.est);
  const rat = tc >= 2 ? '📈 Hoher Count: Jetzt mehr setzen!' : tc <= -1 ? '📉 Kalter Count: klein setzen – oder aufstehen und den Pott sichern (Wonging-Bonus).' : '➖ Neutral: Bleib beim kleinen Einsatz.';
  sheet(`<h2>${ok ? 'Richtig! 🎉' : w === null ? 'Zeit abgelaufen ⏰' : 'Knapp daneben 😬'}</h2>`
    + `<p>${ok ? `<b>+${xp} XP</b> in den Pott${sek < 6 ? ' – schön schnell!' : '.'}` : `Richtig wäre <b>${vz(f.haupt)}</b> gewesen${w !== null ? ` (du: ${vz(w)})` : ''}.`}</p>`
    + `<p class="calc">${weg}</p><p>${rat}</p>`
    + `<div class="row zwei"><button class="btn aux" data-f="einsatz">Einsatz ändern</button><button class="btn hit" data-f="weiter">Weiter</button></div>`, { fest: true, klar: true });
  meldungenZeigen();
}

// ---------- Einsatz ----------
let draft = [];
const summe = l => l.reduce((a, b) => a + b, 0);
function zerlegen(n) { const l = []; for (const c of [...T.chips].sort((a, b) => b - a)) while (n >= c && l.length < 40) { l.push(c); n -= c; } return l; }
function drawBet() {
  $('#bsum').textContent = fmt(summe(draft)) + (DU.length > 1 ? ` × ${DU.length}` : '');
  $('#bpile').innerHTML = draft.slice(-24).map(v => `<span class="mini" style="--cc:${CHIPC[v]}"></span>`).join('') || '<em>Tipp auf die Chips</em>';
}
function betSheet() {
  draft = zerlegen(Math.min(einsatzWert(), KONTO.geld));
  const limit = T.max === Infinity ? `ab ${fmt(T.min)}` : `${fmt(T.min)} – ${fmt(T.max)}`;
  sheet(`<h2>Einsatz</h2><p>${T.name} · ${limit} pro Hand · Guthaben ${fmt(KONTO.geld)}</p>`
    + (mehrHaende() ? `<p>Du spielst <b>${DU.length} ${DU.length === 1 ? 'Hand' : 'Hände'}</b>, jede mit diesem Einsatz. Weitere Hände legst du mit dem <b>+</b> auf einem freien Platz dazu.</p>` : '')
    + `<div class="pile" id="bpile"></div><div class="bsum" id="bsum"></div>`
    + `<div class="chips">${T.chips.map(v => `<button class="chip c${v}" style="--cc:${CHIPC[v]}" data-chip="${v}">${v >= 1000 ? v / 1000 + 'k' : v}</button>`).join('')}</div>`
    + `<div class="row"><button class="btn aux" data-b="undo">↩ Zurück</button><button class="btn aux" data-b="clear">Leeren</button><button class="btn hit" data-b="ok">✓ Setzen</button></div>`);
  drawBet();
}
function chipDazu(v) {
  const grenze = Math.min(T.max, Math.floor(KONTO.geld / DU.length));
  if (summe(draft) + v > grenze) return wackeln(grenze < T.max ? `Dafür reicht dein Guthaben nicht (${fmt(KONTO.geld)}).` : `Tischlimit: höchstens <b>${fmt(T.max)}</b> pro Hand`);
  draft.push(v);
  sound.chip();
  drawBet();
}
function einsatzOk() {
  if (summe(draft) < T.min) return wackeln(`Mindesteinsatz: <b>${fmt(T.min)}</b>`);
  pr.P.einsatz[T.nr] = summe(draft);
  pr.speichern();
  sheetZu();
  naechsteRunde();
}

// ---------- Optionen ----------
let optVorher = '';
const OPT = () => [
  ['decks', 'Decks im Schuh', E.decks ? E.decks : `Tisch (${T ? T.decks : '–'})`],
  ['schnitt', 'Schnittkarte', Math.round(E.schnitt * 100) + ' %'],
  ['tempo', 'Tempo', TEMPO[E.tempo][0]],
  ['zaehlwerte', 'Zählwerte auf den Karten', E.zaehlwerte, `Hi-Lo: +1 / 0 / −1 · nur Tisch 1–${HILFE_BIS.zaehlwerte}`],
  ['legende', 'Zählhilfe im Training', E.legende, 'Blitz-Zählen und Deck-Countdown: welche Karten +1, 0 oder −1 zählen'],
  ['lehrer', 'Strategie-Lehrer', E.lehrer, `zeigt falsche Züge und bewertet den Einsatz · nur Tisch 1–${HILFE_BIS.lehrer}`],
  ['fragen', 'Count-Fragen', E.fragen, 'True Count vor dem Setzen abfragen'],
  ['ton', 'Ton', E.ton],
  ['lautEffekte', 'Effekte', Math.round(E.lautEffekte * 100) + ' %'],
  ['lautAmbiente', 'Hintergrund', Math.round(E.lautAmbiente * 100) + ' %', 'Gemurmel und Spielautomaten'],
  ...(tisch && T.hands[1] === 1 ? [['platz', 'Dein Platz', `${sitzordnung().indexOf('du') + 1} von ${T.plaetze.length}`, 'Platz 1 bekommt die Karten zuerst']] : []),
  ...(pr.istAdmin() ? [['countAnzeige', 'Count anzeigen (Admin)', E.countAnzeige]] : []),
];
function optSheet() {
  optVorher = `${E.decks}/${E.schnitt}/${tisch ? sitzordnung().join() : ''}`;
  optZeichnen();
}
function optZeichnen() {
  const freestyle = !E.lehrer && !E.fragen;
  sheet(`<h2>Optionen</h2>` + OPT().map(([k, name, w, info]) => {
    const text = `<span>${name}${info ? `<br><small>${info}</small>` : ''}</span>`;
    if (typeof w === 'boolean') return `<div class="opt">${text}<button class="btn ${w ? 'hit' : 'aux'} schalter" data-o="${k}">${w ? 'An' : 'Aus'}</button></div>`;
    return `<div class="opt">${text}<button class="btn aux" data-o="${k}:-1">−</button><b>${w}</b><button class="btn aux" data-o="${k}:1">+</button></div>`;
  }).join('')
    + `<div class="opt">${'<span>Freestyle<br><small>Lehrer und Count-Fragen aus, einfach spielen</small></span>'}<button class="btn ${freestyle ? 'hit' : 'aux'} schalter" data-o="freestyle">${freestyle ? 'An' : 'Aus'}</button></div>`
    + `<p>Ändern sich Decks oder Schnittkarte, mischt der Dealer sofort einen neuen Schuh.</p><button class="btn hit voll" data-zu="1">Fertig</button>`, { zu: optFertig });
}
function option(o) {
  const [k, d] = o.split(':'), r = +d, grenz = (v, a, b) => Math.min(b, Math.max(a, v));
  if (k === 'decks') E.decks = grenz(E.decks + r, 0, 8);
  else if (k === 'schnitt') E.schnitt = grenz(Math.round((E.schnitt + r * .05) * 100) / 100, .5, .85);
  else if (k === 'tempo') E.tempo = grenz(E.tempo + r, 0, 2);
  else if (k === 'lautEffekte' || k === 'lautAmbiente') E[k] = grenz(Math.round((E[k] + r * .2) * 10) / 10, 0, 1);
  else if (k === 'platz') pr.P.einsatz['p' + T.nr] = grenz(sitzordnung().indexOf('du') + r, 0, T.plaetze.length - 1);
  else if (k === 'freestyle') { const an = E.lehrer || E.fragen; E.lehrer = E.fragen = !an; }
  else E[k] = !E[k];
  if (k === 'ton') { aktivieren(); if (E.ton && tisch) ambienteStart(T.nr >= 3); if (!E.ton) ambienteStop(); }
  lautstaerke();
  pr.einstellungenSpeichern();
  pr.speichern();
  sound.klick();
  optZeichnen();
  if (tisch) render();
}
function optFertig() {
  if (!tisch) return;
  const jetzt = `${E.decks}/${E.schnitt}/${sitzordnung().join()}`;
  if (jetzt === optVorher) return;
  const nurPlatz = jetzt.split('/').slice(0, 2).join('/') === optVorher.split('/').slice(0, 2).join('/');
  if (tisch.phase === 'fertig') tisch.neueRunde();
  tischBauen(nurPlatz ? schuhMerken() : null);
  if (!nurPlatz) { toast(`🔀 Neuer Schuh mit <b>${tisch.regeln.decks} Decks</b>, Schnittkarte bei ${Math.round(E.schnitt * 100)} %.`); sound.mischen(); }
  render();
}

// ---------- Kleidung: Shop und Kleiderschrank teilen sich die Karten ----------
// ansicht merkt sich, welche Einblendung nach einem Klick neu gezeichnet wird
let ansicht = 'shop', shopTab = 'outfits', profilTab = 'ich';
const istOutfit = id => OUTFITS.some(o => o.id === id);
const traegt = (f, it) => istOutfit(it.id) ? f.outfit === it.id : f.acc[it.fach] === it.id;
function ware(it, mitPreis) {
  const P = pr.P, f = P.figur, hat = P.besitz.includes(it.id), an = traegt(f, it);
  const vorschau = deineFigur(istOutfit(it.id) ? { ...f, outfit: it.id } : { ...f, acc: { ...f.acc, [it.fach]: it.id } });
  const knopf = an ? (istOutfit(it.id) ? `<button class="btn aux" disabled>Trägst du</button>` : `<button class="btn aux" data-ab="${it.fach}">Ablegen</button>`)
    : hat ? `<button class="btn hit" data-an="${it.id}">Anziehen</button>`
    : mitPreis ? `<button class="btn dbl" data-kauf="${it.id}" ${pr.kaufbar(it.preis) ? '' : 'disabled'}>${fmt(it.preis)}</button>` : '';
  return `<div class="ware ${an ? 'an' : ''}">${figurBild(vorschau)}<b>${it.name}</b>${knopf}</div>`;
}
// Accessoires nach Fächern: aus jedem Fach kannst du eins tragen (z. B. Cap, Sonnenbrille und Kette zusammen)
const nachFach = (liste, mitPreis) => Object.entries(FAECHER).map(([fach, name]) => {
  const teile = liste.filter(a => a.fach === fach);
  return teile.length ? `<h3 class="fach">${name}</h3><div class="waren">${teile.map(it => ware(it, mitPreis)).join('')}</div>` : '';
}).join('');
const tabs = (akt, liste) => `<div class="tabs">${liste.map(([id, name]) => `<button class="btn ${akt === id ? 'hit' : 'aux'}" data-tab="${id}">${name}</button>`).join('')}</div>`;

function shopSheet() {
  ansicht = 'shop';
  const P = pr.P;
  sheet(`<h2>🛍️ Shop</h2><p>Bezahlt wird mit Chips – aber nur mit dem, was über 1.000 € liegt. Guthaben: <b>${fmt(P.geld)}</b>. Umfärben und Umziehen geht im Profil.</p>`
    + tabs(shopTab, [['outfits', 'Outfits'], ['acc', 'Accessoires']])
    + (shopTab === 'outfits' ? `<div class="waren">${OUTFITS.map(it => ware(it, true)).join('')}</div>` : nachFach(ACCESSOIRES, true))
    + `<button class="btn hit voll" data-zu="1">Fertig</button>`, { zu: lobbyZeigen });
}

// ---------- Profil: Übersicht, Kleiderschrank und Erfolge ----------
function erfolgeHtml() {
  return `<div class="erfolge">` + pr.ERFOLGE.map(e => {
    const d = pr.P.erfolge[e.id], s = pr.erfolgStand(e.id);
    return `<div class="erf ${d ? 'ja' : ''}"><span>${d ? e.emoji : '🔒'}</span><div><b>${e.name}</b><small>${e.text}</small>`
      + `<div class="bar"><i style="width:${(s.anteil * 100).toFixed(1)}%"></i></div><small class="stand">${s.text}</small></div><em>${e.xp} XP</em></div>`;
  }).join('') + '</div>';
}
function profilSheet(tab = profilTab) {
  ansicht = 'profil';
  profilTab = tab;
  const P = pr.P, f = P.figur, lv = pr.fortschritt(P.xp), n = pr.ERFOLGE.filter(e => P.erfolge[e.id]).length;
  const wert = (emoji, name, w, info = '') => `<div class="wert"><span>${emoji}</span><div><small>${name}</small><b>${w}</b>${info ? `<em>${info}</em>` : ''}</div></div>`;
  let inhalt;
  if (tab === 'ich') inhalt = `<div class="prof-kopf"><div class="vorschau">${figurBild(deineFigur(f))}</div><div><b>Level ${lv.level}</b><span>${pr.istAdmin() ? 'Admin' : lv.titel}</span>`
    + `<div class="bar"><i style="width:${(lv.anteil * 100).toFixed(1)}%"></i></div><small>${zahl(P.xp, 0)} XP · noch ${zahl(lv.fehlt, 0)} bis Level ${lv.level + 1}</small></div></div>`
    + `<div class="werte">`
    + wert('💰', 'Guthaben', fmt(P.geld), 'deine Chips')
    + wert('🔥', 'Serien-Bonus', `× ${zahl(pr.serienFaktor(P.serie))}`, 'steigt mit jeder Gewinn-Sitzung')
    + wert('🎯', 'Count-Quote', `${Math.round(pr.quote() * 100)} %`, `richtige Antworten (letzte ${P.verlauf.length || 0})`)
    + wert('💸', 'Pleiten', P.pleiten, 'so oft bist du pleite gegangen')
    + wert('🃏', 'Hände gespielt', zahl(P.stat.haende || 0, 0))
    + wert('🧮', 'Richtige Counts', zahl(P.stat.countRichtig || 0, 0))
    + wert('🏆', 'Erfolge', `${n} / ${pr.ERFOLGE.length}`)
    + wert('🔓', 'Tische offen', `${P.tische.length} / ${TISCHE.length}`)
    + wert('👕', 'Teile im Schrank', P.besitz.length)
    + `</div>`;
  else if (tab === 'schrank') {
    const outfits = OUTFITS.filter(o => P.besitz.includes(o.id)), acc = ACCESSOIRES.filter(a => P.besitz.includes(a.id));
    inhalt = `<div class="vorschau">${figurBild(deineFigur(f))}</div>`
      + `<h3 class="fach">Tier</h3><div class="wahl">${Object.entries(TIERE).map(([k, t]) => `<button class="btn aux ${k === f.tier ? 'an' : ''}" data-ptier="${k}">${t.name}</button>`).join('')}</div>`
      + `<h3 class="fach">Farbe</h3><div class="farben">${TIERE[f.tier].farben.map(c => `<button class="farbe ${c === f.farbe ? 'an' : ''}" style="--c:${c}" data-fell="${c}" aria-label="Farbe"></button>`).join('')}</div>`
      + `<h3 class="fach">Outfits</h3><div class="waren">${outfits.map(it => ware(it, false)).join('')}</div>`
      + (acc.length ? nachFach(acc, false) : '<p>Noch keine Accessoires – im Shop gibt es Caps, Brillen, Ketten und mehr.</p>')
      + `<button class="btn dbl voll" data-l="shop">🛍️ Zum Shop</button>`;
  } else inhalt = `<p>${n} von ${pr.ERFOLGE.length} geschafft. Der Balken zeigt, wie weit du bei jedem Erfolg bist.</p>` + erfolgeHtml();
  sheet(`<h2>👤 Dein Profil</h2>` + tabs(tab, [['ich', 'Übersicht'], ['schrank', 'Charakter'], ['erfolge', 'Erfolge']]).replaceAll('data-tab=', 'data-ptab=')
    + inhalt + `<button class="btn hit voll" data-zu="1">Fertig</button>`, { zu: lobbyZeigen });
}
const kleidungNeu = () => ansicht === 'profil' ? profilSheet() : shopSheet();

// ---------- Admin-Testmodus ----------
function adminSheet() {
  if (pr.istAdmin()) return sheet(`<h2>🔑 Admin-Testmodus</h2><p>Hier ist alles freigeschaltet, mit eigenem Spielstand. Dein normaler Spielstand bleibt unberührt.</p>`
    + `<button class="btn hit voll" data-adm="normal">Zurück zum normalen Spielstand</button><button class="btn aux voll" data-adm="reset">Admin-Spielstand zurücksetzen</button>`);
  sheet(`<h2>🔑 Admin-Testmodus</h2><p>PIN eingeben:</p>${zahlenfeld(pin => {
    if (String(pin) !== pr.ADMIN_PIN) { toast('Falsche PIN.', { vorne: true, ton: 'falsch' }); return adminSheet(); }
    pr.laden('admin'); sheetZu(); toast('🔑 Admin-Testmodus an – alles freigeschaltet.'); lobbyZeigen();
  }, { knopf: 'Entsperren', stellen: 4, pin: true })}`);
}

// ---------- Bedienung ----------
document.addEventListener('click', e => {
  aktivieren();
  const b = e.target.closest('button,.ov,[data-plus],[data-minus]');
  if (!b) return;
  if (b.classList.contains('ov')) { if (e.target === b && !b.classList.contains('fest')) sheetZu(); return; }
  const d = b.dataset, P = pr.P;
  if (d.uhu) return uhuWeg();
  if (d.k) return taste(d.k);
  if (d.tr !== undefined) return trainingKlick(d);
  if (d.l === 'lobby') { sheetZu(); return zeige('lobby'); }
  if (d.l === 'training') return zeige('training');
  if (d.l === 'shop') { shopTab = 'outfits'; return shopSheet(); }
  if (d.l === 'erfolge') return profilSheet('erfolge');
  if (d.l === 'profil') return P.figur && profilSheet('ich');
  if (d.ptab) return profilSheet(d.ptab);
  if (d.ptier) { P.figur.tier = d.ptier; P.figur.farbe = TIERE[d.ptier].farben[0]; pr.speichern(); sound.klick(); return profilSheet(); }
  if (d.l === 'optionen') return optSheet();
  if (d.l === 'admin') return adminSheet();
  if (d.l === 'install') return installieren();
  if (d.sitz) return hinsetzen(+d.sitz);
  // Charakterwahl
  if (d.tier) { wahl = { ...wahl, tier: d.tier, farbe: TIERE[d.tier].farben[0] }; return figurWahl(); }
  if (d.farbe) { wahl.farbe = d.farbe; return figurWahl(); }
  if (d.outfit) { wahl.outfit = d.outfit; return figurWahl(); }
  if (d.wahl) { P.figur = { ...wahl, acc: {} }; pr.speichern(); sheetZu(); sound.erfolg(); return lobbyZeigen(); }
  // Shop und Kleiderschrank
  if (d.tab) { shopTab = d.tab; return shopSheet(); }
  const anziehen = id => { if (istOutfit(id)) P.figur.outfit = id; else P.figur.acc[accNr(id).fach] = id; };
  if (d.kauf) { const it = [...OUTFITS, ...ACCESSOIRES].find(x => x.id === d.kauf); if (pr.kaufen(it)) { sound.kasse(); anziehen(it.id); pr.speichern(); meldungenZeigen(); } return kleidungNeu(); }
  if (d.an) { anziehen(d.an); pr.speichern(); sound.klick(); return kleidungNeu(); }
  if (d.ab) { delete P.figur.acc[d.ab]; pr.speichern(); sound.klick(); return kleidungNeu(); }
  if (d.fell) { P.figur.farbe = d.fell; pr.speichern(); return kleidungNeu(); }
  // Admin
  if (d.adm === 'normal') { pr.laden('normal'); sheetZu(); toast('Zurück im normalen Spielstand.'); return lobbyZeigen(); }
  if (d.adm === 'reset') { try { localStorage.removeItem('truecount.admin'); } catch {} pr.laden('admin'); sheetZu(); toast('Admin-Spielstand zurückgesetzt.'); return lobbyZeigen(); }
  // Optionen und Einblendungen
  if (d.o) return option(d.o);
  if (d.zu) return sheetZu();
  // Tisch
  if (!tisch) return;
  if (d.a === 'austeilen') return naechsteRunde();
  if (d.a === 'einsatz') return betSheet();
  if (d.a === 'optionen') return optSheet();
  if (d.a === 'aufstehen') return aufstehen();
  if (d.a === 'info') return uhuFragen();
  if (d.a) return spielerZug(d.a);
  if (d.plus) return haendeAendern(+d.plus, true);
  if (d.minus) return haendeAendern(+d.minus, false);
  if (d.v) return versichern(d.v === '1');
  if (d.f === 'weiter') { sheetZu(); return austeilen(); }
  if (d.f === 'einsatz') return betSheet();
  if (d.chip) return chipDazu(+d.chip);
  if (d.b === 'undo') { draft.pop(); return drawBet(); }
  if (d.b === 'clear') { draft = []; return drawBet(); }
  if (d.b === 'ok') return einsatzOk();
});
addEventListener('resize', render);

// ---------- Installation als App ----------
let installEvent = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvent = e; $('[data-l=install]').hidden = false; });
async function installieren() {
  if (!installEvent) return toast('Im Browser-Menü „Zum Startbildschirm hinzufügen“ wählen.');
  installEvent.prompt();
  await installEvent.userChoice;
  installEvent = null;
  $('[data-l=install]').hidden = true;
}
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});

// ---------- Start ----------
pr.laden();
zeige('lobby');
document.fonts?.ready.then(() => { if (tisch) render(); });
