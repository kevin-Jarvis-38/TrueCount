// Prüft, ob der Lehrer Verdoppeln richtig empfiehlt und erklärt, wenn es nicht erlaubt ist.
// Aufruf: MSYS_NO_PATHCONV=1 docker run --rm -v "$PWD":/app -w /app node:22-alpine node test/verdoppeln.mjs
import { lehrerZug, lehrerAusfuehrlich } from '../js/strategie.js';
const k = (...r) => r.map((r, id) => ({ r, s: '♠', id }));
const alle = { verdoppeln: true, teilen: false, aufgeben: true }, ohne = { ...alle, verdoppeln: false };
const fall = (t, karten, up, m, tc = 0) => console.log(t.padEnd(28), '→', lehrerZug(karten, { r: up }, m, tc).zug, '|', lehrerZug(karten, { r: up }, m, tc).text.replace(/<[^>]+>/g, ''));
fall('11 (6+5) gegen 6', k('6', '5'), '6', alle);
fall('11 (6+5) gegen 10', k('6', '5'), '10', alle);
fall('11 (6+5) gegen 10, TC +3', k('6', '5'), '10', alle, 3);
fall('10 (6+4) gegen 9', k('6', '4'), '9', alle);
fall('9 (5+4) gegen 4', k('5', '4'), '4', alle);
fall('Soft 17 (A+6) gegen 5', k('A', '6'), '5', alle);
fall('Soft 18 (A+7) gegen 4', k('A', '7'), '4', alle);
fall('11 aus 3 Karten gegen 6', k('2', '3', '6'), '6', ohne);
fall('11 ohne Geld gegen 6', k('6', '5'), '6', ohne);
fall('Soft 18 aus 3 Karten gg 4', k('A', '3', '4'), '4', ohne);
console.log(lehrerAusfuehrlich(k('2', '3', '6'), { r: '6' }, ohne, 0).absaetze.join('\n').replace(/<[^>]+>/g, ''));
