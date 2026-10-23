// TrueCount – Spiellogik eines Blackjack-Tisches nach europäischen Regeln (keine Hole Card).
// Reine Logik ohne Oberfläche, damit der Mehrspieler-Modus später darauf aufbauen kann.
// Ablauf: setzen → start() → schritt() bis null (ein Mensch ist dran) bzw. 'abrechnung' → neueRunde().
import { neuerSchuh, wert, punkte, zufall } from './karten.js';
import { basisZug } from './strategie.js';

export const HINTERZIMMER = { name: 'Hinterzimmer', min: 5, max: 100, decks: 2, schnitt: .75, maxHaende: 4, bj: 1.5 };

const neueHand = einsatz => ({ karten: [], einsatz, geteilt: false, asse: false, verdoppelt: false, aufgegeben: false, fertig: false, ergebnis: null, gewinn: 0 });
// Blackjack nur mit den ersten zwei Karten, nicht nach einem Split
export const istBJ = h => !h.geteilt && h.karten.length === 2 && wert(h.karten).summe === 21;
const ZUG = { H: 'karte', S: 'bleiben', D: 'verdoppeln', P: 'teilen', R: 'aufgeben' };

export class Tisch {
  // plaetze: [{ name, art: 'mensch' | 'npc', geld, stil, fehler, versichert }]
  constructor(regeln, plaetze, seed) {
    this.regeln = regeln;
    this.rnd = zufall(seed);
    this.schuhNr = 0;
    this.plaetze = plaetze.map(p => ({ geld: Infinity, ...p, einsatz: 0, haende: [], versicherung: 0, gewinn: 0 }));
    this.dealer = [];
    this.phase = 'setzen';
    this.mischen();
  }

  mischen() {
    this.schuh = neuerSchuh(this.regeln.decks, this.regeln.schnitt, this.rnd, ++this.schuhNr);
    this.schuh.pos = 1; // die erste Karte wird verbrannt und kommt verdeckt in die Ablage
    this.ablage = 1;
  }

  ziehen() {
    if (this.schuh.pos >= this.schuh.karten.length) this.ablageMischen();
    return this.schuh.karten[this.schuh.pos++];
  }

  // Notfall (vor allem bei 1 Deck): Der Schuh ist mitten in der Runde leer. Wie im Casino wird die Ablage gemischt,
  // also alle Karten außer denen auf dem Tisch. Nach der Runde kommt ein ganz neuer Schuh.
  ablageMischen() {
    const weg = [...this.dealer, ...this.alleHaende().flatMap(h => h.karten)].map(k => k.r + k.s);
    this.schuh = neuerSchuh(this.regeln.decks, this.regeln.schnitt, this.rnd, ++this.schuhNr);
    this.schuh.karten = this.schuh.karten.filter(k => { const i = weg.indexOf(k.r + k.s); return i < 0 || !weg.splice(i, 1); });
    this.schuh.schnitt = 0;
    this.ablage = 0;
    this.gemischt = true;
  }

  alleHaende() { return this.plaetze.flatMap(p => p.haende); }

  setzen(i, betrag) {
    const p = this.plaetze[i], r = this.regeln;
    if (this.phase !== 'setzen' || betrag < r.min || betrag > r.max || betrag > p.geld) return false;
    p.einsatz = betrag;
    return true;
  }

  start() {
    if (this.phase !== 'setzen' || !this.plaetze.some(p => p.art === 'mensch' && p.einsatz)) return false;
    for (const p of this.plaetze) {
      if (p.art === 'npc') p.einsatz = this.npcEinsatz(p);
      p.geld -= p.einsatz;
      p.haende = p.einsatz ? [neueHand(p.einsatz)] : [];
      p.versicherung = 0;
      p.gewinn = 0;
    }
    // Jeder bekommt eine Karte, der Dealer eine, dann jeder die zweite. Die zweite Dealer-Karte kommt erst am Ende.
    const mit = this.plaetze.map((p, i) => i).filter(i => this.plaetze[i].haende.length);
    this.plan = [...mit, 'd', ...mit];
    this.phase = 'austeilen';
    return true;
  }

  // Ein automatischer Schritt (Karte austeilen, Zug eines Mitspielers, Dealer zieht).
  // Gibt null zurück, wenn ein Mensch entscheiden muss oder die Runde vorbei ist.
  schritt() {
    switch (this.phase) {
      case 'austeilen': {
        const an = this.plan.shift();
        if (an === 'd') this.dealer.push(this.ziehen()); else this.plaetze[an].haende[0].karten.push(this.ziehen());
        if (!this.plan.length) this.dealer[0].r === 'A' ? this.versicherungAnbieten() : this.spielBeginnen();
        return { typ: 'karte', an };
      }
      case 'spielen': {
        const an = this.ap, p = this.plaetze[an], h = p.haende[this.ah];
        if (h.karten.length < 2) { // geteilte Hand bekommt ihre zweite Karte
          h.karten.push(this.ziehen());
          if (h.asse) h.fertig = true; // geteilte Asse bekommen nur eine Karte
          this.pruefen(h);
          return { typ: 'karte', an };
        }
        if (p.art === 'mensch') return null;
        return this.zug(this.npcZug(p, h));
      }
      case 'dealer': {
        const offen = this.alleHaende().filter(h => !h.aufgegeben && wert(h.karten).summe <= 21);
        const zieht = offen.length && (this.dealer.length < 2 || (offen.some(h => !istBJ(h)) && wert(this.dealer).summe < 17));
        if (zieht) { this.dealer.push(this.ziehen()); return { typ: 'karte', an: 'd' }; }
        this.abrechnen();
        return { typ: 'abrechnung' };
      }
    }
    return null;
  }

  versicherungAnbieten() {
    this.phase = 'versicherung';
    for (const p of this.plaetze) {
      if (!p.haende.length) continue;
      if (p.art === 'mensch') { p.versicherung = null; continue; } // null = noch nicht entschieden
      p.versicherung = p.versichert && this.rnd() < p.versichert ? p.einsatz / 2 : 0;
      p.geld -= p.versicherung;
    }
    this.versicherungFertig();
  }

  versichern(i, ja) {
    const p = this.plaetze[i], preis = p.einsatz / 2;
    if (this.phase !== 'versicherung' || p.versicherung !== null) return false;
    p.versicherung = ja && p.geld >= preis ? preis : 0;
    p.geld -= p.versicherung;
    this.versicherungFertig();
    return true;
  }

  versicherungFertig() {
    if (this.plaetze.every(p => p.versicherung !== null)) this.spielBeginnen();
  }

  spielBeginnen() {
    this.phase = 'spielen';
    this.ap = 0;
    this.ah = 0;
    for (const h of this.alleHaende()) if (istBJ(h)) h.fertig = true;
    this.weiter();
  }

  // Springt zur nächsten Hand, die noch spielen muss. Sind alle fertig, ist der Dealer dran.
  weiter() {
    for (; this.ap < this.plaetze.length; this.ap++, this.ah = 0) {
      const haende = this.plaetze[this.ap].haende;
      while (this.ah < haende.length && haende[this.ah].fertig) this.ah++;
      if (this.ah < haende.length) return;
    }
    this.phase = 'dealer';
  }

  pruefen(h) {
    if (wert(h.karten).summe >= 21) h.fertig = true;
    if (h.fertig) this.weiter();
  }

  // Welche Züge die Hand, die gerade dran ist, machen darf
  moeglich() {
    const p = this.plaetze[this.ap], h = p?.haende[this.ah];
    if (this.phase !== 'spielen' || !h || h.fertig || h.karten.length < 2) return {};
    const zwei = h.karten.length === 2, geld = p.geld >= h.einsatz;
    return {
      karte: true,
      bleiben: true,
      verdoppeln: zwei && geld,
      teilen: zwei && geld && !h.asse && p.haende.length < this.regeln.maxHaende && punkte(h.karten[0].r) === punkte(h.karten[1].r),
      aufgeben: zwei && p.haende.length === 1,
    };
  }

  // Zug eines Menschen an Platz i
  aktion(i, a) {
    if (this.phase !== 'spielen' || this.ap !== i || this.plaetze[i].art !== 'mensch') return null;
    return this.zug(a);
  }

  zug(a) {
    const an = this.ap, p = this.plaetze[an], h = p.haende[this.ah];
    if (!this.moeglich()[a]) return null;
    if (a === 'karte') h.karten.push(this.ziehen());
    else if (a === 'bleiben') h.fertig = true;
    else if (a === 'aufgeben') h.aufgegeben = h.fertig = true;
    else if (a === 'verdoppeln') {
      p.geld -= h.einsatz;
      h.einsatz *= 2;
      h.verdoppelt = h.fertig = true;
      h.karten.push(this.ziehen());
    } else if (a === 'teilen') {
      p.geld -= h.einsatz;
      const neu = neueHand(h.einsatz);
      neu.karten.push(h.karten.pop());
      h.geteilt = neu.geteilt = true;
      h.asse = neu.asse = h.karten[0].r === 'A';
      p.haende.splice(this.ah + 1, 0, neu);
    }
    this.pruefen(h);
    return { typ: a, an };
  }

  npcEinsatz(p) {
    const r = this.regeln, [a, b] = p.stil === 'wild' ? [25, r.max] : [r.min, 25];
    return Math.round((a + this.rnd() * (b - a)) / 5) * 5;
  }

  npcZug(p, h) {
    const m = this.moeglich(), s = wert(h.karten).summe;
    if (p.stil === 'wild') { // teilt alles, verdoppelt alles von 9 bis 11, zieht bis 17
      if (m.teilen) return 'teilen';
      if (m.verdoppeln && s >= 9 && s <= 11) return 'verdoppeln';
      return s < 17 ? 'karte' : 'bleiben';
    }
    if (p.fehler && s < 20 && this.rnd() < p.fehler) return this.rnd() < .5 ? 'karte' : 'bleiben';
    return ZUG[basisZug(h.karten, this.dealer[0], m)];
  }

  abrechnen() {
    const d = wert(this.dealer).summe, dBJ = this.dealer.length === 2 && d === 21;
    for (const p of this.plaetze) {
      if (p.versicherung) {
        const zurueck = dBJ ? p.versicherung * 3 : 0;
        p.geld += zurueck;
        p.gewinn += zurueck - p.versicherung;
      }
      for (const h of p.haende) {
        const s = wert(h.karten).summe;
        // Ohne Hole Card verliert man bei Dealer-Blackjack auch die Einsätze aus Verdoppeln und Teilen
        const [ergebnis, zurueck] =
          h.aufgegeben ? ['aufgegeben', h.einsatz / 2]
          : s > 21 ? ['bust', 0]
          : istBJ(h) ? (dBJ ? ['push', h.einsatz] : ['blackjack', h.einsatz * (1 + this.regeln.bj)])
          : dBJ ? ['verloren', 0]
          : d > 21 || s > d ? ['gewonnen', h.einsatz * 2]
          : s === d ? ['push', h.einsatz] : ['verloren', 0];
        h.ergebnis = ergebnis;
        h.gewinn = zurueck - h.einsatz;
        p.geld += zurueck;
        p.gewinn += h.gewinn;
      }
    }
    this.phase = 'fertig';
  }

  // Karten in die Ablage. Gibt true zurück, wenn die Schnittkarte erreicht war und neu gemischt wurde.
  neueRunde() {
    if (this.phase !== 'fertig') return false;
    this.ablage += this.dealer.length + this.alleHaende().reduce((n, h) => n + h.karten.length, 0);
    this.dealer = [];
    for (const p of this.plaetze) { p.haende = []; p.versicherung = 0; }
    this.phase = 'setzen';
    if (this.schuh.pos < this.schuh.schnitt) return false;
    this.mischen();
    return true;
  }
}
