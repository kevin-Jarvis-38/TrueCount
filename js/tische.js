// TrueCount – die fünf Tische mit Limits, Schwierigkeit, Freischaltung und Mitspielern.
// fragen: alle wie viele Hände eine Count-Frage kommt (von–bis), zeit: Sekunden für die Antwort (0 = ohne Zeitlimit),
// tempo: Faktor für die Dealer-Geschwindigkeit, xp: XP-Faktor, sitz: Mindestguthaben zum Hinsetzen,
// plaetze: Sitzordnung von rechts nach links ('du' = deine Hand, null = leerer Platz).
export const TISCHE = [
  {
    nr: 1, name: 'Hinterzimmer', min: 5, max: 100, decks: 2, fragen: [2, 3], zeit: 0, tempo: 1, xp: 1, sitz: 0,
    frei: { geld: 0, level: 1, quote: 0 }, chips: [1, 5, 25, 100], filz: '#2f8f4e', hands: [1, 1],
    plaetze: ['rudi', 'du', 'joe'],
  },
  {
    nr: 2, name: 'Kellerclub', min: 25, max: 500, decks: 4, fragen: [3, 5], zeit: 20, tempo: .85, xp: 1.5, sitz: 500,
    frei: { geld: 2000, level: 5, quote: 0 }, chips: [5, 25, 100, 500], filz: '#1f6f8b', hands: [1, 1],
    plaetze: ['bello', 'heinz', 'du', 'futon', null],
  },
  {
    nr: 3, name: 'Grand Casino', min: 100, max: 2000, decks: 6, fragen: [5, 8], zeit: 15, tempo: .7, xp: 2, sitz: 2000,
    frei: { geld: 10000, level: 12, quote: 0 }, chips: [25, 100, 500, 1000], filz: '#8b1e3f', hands: [1, 1],
    plaetze: ['eddie', 'gustav', 'du', 'karlo', 'hartmann'],
  },
  {
    nr: 4, name: 'Lounge', min: 50, max: 1000, decks: 6, fragen: [6, 10], zeit: 12, tempo: .6, xp: 3, sitz: 1000,
    frei: { geld: 25000, level: 20, quote: .8 }, chips: [25, 100, 500, 1000], filz: '#3d2c6b', hands: [2, 3],
    plaetze: ['dieter', 'du', 'du', 'du', 'hilde'],
  },
  {
    nr: 5, name: 'Penthouse', min: 500, max: Infinity, decks: 6, fragen: [8, 12], zeit: 8, tempo: .5, xp: 4, sitz: 10000,
    frei: { geld: 100000, level: 30, quote: .9 }, chips: [100, 500, 1000, 5000], filz: '#14213d', hands: [1, 5],
    plaetze: ['du', 'du', 'du', 'du', 'du'],
  },
];

// Mitspieler: goofy Tiere. Im Hinterzimmer abgerissen, je besser der Tisch, desto schicker.
// stil: 'basis' = Basisstrategie (fehler = Anteil zufälliger Züge), 'wild' = teilt alles, zieht bis 17.
export const NPC = {
  rudi: { name: 'Rambo-Rudi', kind: 'hase', body: 'muskel', fur: '#d7d2cc', shirt: '#3d405b', acc: 'stirnband', stil: 'wild' },
  joe: { name: 'Crazy Joe', kind: 'gorilla', body: 'feinripp', fur: '#4a4654', acc: 'kippe', stil: 'basis', fehler: .15, versichert: .3 },
  bello: { name: 'Bello Bankrott', kind: 'hund', body: 'hoodie', fur: '#c68642', shirt: '#6c757d', acc: 'cap', stil: 'wild' },
  heinz: { name: 'Hicks-Heinz', kind: 'hyaene', body: 'hemd', fur: '#c9a15e', shirt: '#f1efe6', flecken: true, stil: 'basis', fehler: .2, versichert: .5 },
  futon: { name: 'Futon der Abi', kind: 'kater', body: 'batik', fur: '#e39b4f', shirt: '#8e5bd6', acc: ['muetze', 'kippe'], muede: true, stil: 'basis', fehler: .1 },
  eddie: { name: 'Esel-Eddie', kind: 'esel', body: 'sakko', fur: '#9a8f86', shirt: '#2b4c7e', acc: 'fliege', stil: 'basis', fehler: .05 },
  gustav: { name: 'Gorilla Gustav', kind: 'gorilla', body: 'smoking', fur: '#3b3845', acc: 'zylinder', stil: 'basis', fehler: .05, versichert: .2 },
  karlo: { name: 'Kater Karlo', kind: 'kater', body: 'sakko', fur: '#6d6875', shirt: '#7b2cbf', acc: 'goldkette', stil: 'basis', fehler: .08 },
  hartmann: { name: 'Hasi Hartmann', kind: 'hase', body: 'hemd', fur: '#f2e9e4', shirt: '#a8dadc', acc: 'sonnenbrille', stil: 'wild' },
  dieter: { name: 'Diamanten-Dieter', kind: 'hund', body: 'smoking', fur: '#8d6e63', acc: 'sonnenbrille', stil: 'basis' },
  hilde: { name: 'Hyänen-Hilde', kind: 'hyaene', body: 'sakko', fur: '#d4a373', shirt: '#c1121f', acc: 'goldkette', stil: 'basis', fehler: .03 },
};

export const tischNr = nr => TISCHE[nr - 1];
