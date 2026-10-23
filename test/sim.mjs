// Prüft die Spiellogik mit vielen automatischen Runden: Geld und Karten dürfen nie verloren gehen.
// Aufruf: MSYS_NO_PATHCONV=1 docker run --rm -v "$PWD":/app -w /app node:22-alpine node test/sim.mjs
import { Tisch, HINTERZIMMER, istBJ } from '../js/tisch.js';
import { basisZug } from '../js/strategie.js';
import { hiLo } from '../js/karten.js';

const ZUG = { H: 'karte', S: 'bleiben', D: 'verdoppeln', P: 'teilen', R: 'aufgeben' };
const fehler = m => { console.error('FEHLER:', m); process.exit(1); };
let gesamt = { runden: 0, einsatz: 0, gewinn: 0, bj: 0, splits: 0, vers: 0, misch: 0 };

for (const decks of [1, 2, 6, 8]) {
  const t = new Tisch({ ...HINTERZIMMER, decks, schnitt: decks === 1 ? .85 : .75 }, [
    { name: 'Joe', art: 'npc', stil: 'basis', fehler: .15, versichert: .3 },
    { name: 'Du', art: 'mensch', konto: { geld: 1e9 } },
    { name: 'Rudi', art: 'npc', stil: 'wild' },
  ], 4711 + decks);
  const du = t.plaetze[1];
  for (let r = 0; r < 50000; r++) {
    const vorher = du.konto.geld;
    t.setzen(1, 10) || fehler('setzen');
    t.start() || fehler('start');
    for (let n = 0; t.phase !== 'fertig'; n++) {
      if (n > 200) fehler('Endlosschleife in Phase ' + t.phase);
      if (t.schritt()) continue;
      if (t.phase === 'versicherung') { t.versichern(1, false); gesamt.vers++; continue; }
      const h = du.haende[t.ah], m = t.moeglich();
      if (m.teilen) gesamt.splits++;
      t.aktion(1, ZUG[basisZug(h.karten, t.dealer[0], m)]) || fehler('Zug abgelehnt');
    }
    if (du.konto.geld - vorher !== du.gewinn) fehler('Geld stimmt nicht');
    const rc = t.schuh.karten.slice(1, t.schuh.pos).reduce((n, k) => n + hiLo(k.r), 0);
    if (t.schuh.schnitt && rc !== t.rc) fehler('Laufender Count stimmt nicht');
    if (du.haende.some(istBJ)) gesamt.bj++;
    gesamt.einsatz += 10; gesamt.gewinn += du.gewinn; gesamt.runden++;
    const aufTisch = t.dealer.length + t.alleHaende().reduce((a, h) => a + h.karten.length, 0);
    if (t.ablage + aufTisch + t.schuh.karten.length - t.schuh.pos !== decks * 52) fehler('Kartenzahl stimmt nicht');
    if (t.neueRunde()) gesamt.misch++;
  }
}
const g = gesamt;
console.log(`${g.runden} Runden, ${g.misch}× gemischt, Blackjack ${(g.bj / g.runden * 100).toFixed(2)} % (erwartet ca. 4,7 %)`);
console.log(`Teilen möglich: ${g.splits}×, Versicherung angeboten: ${g.vers}×`);
console.log(`Ergebnis mit Basisstrategie: ${(g.gewinn / g.einsatz * 100).toFixed(2)} % vom Einsatz (erwartet nahe 0, Zufallsschwankung ca. ±0,3 %)`);
console.log('OK');
