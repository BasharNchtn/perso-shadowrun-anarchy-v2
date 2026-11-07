// Test de logique : ouvre chaque JSON d'exemple dans index.html (jsdom)
// et vérifie l'absence d'avertissement, le respect des limites et le reste de nuyens attendu.
// Usage : npm i jsdom && node tests/logique.js
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
// Reste de nuyens attendu pour chaque exemple fictif (tests/exemples/).
const ATTENDU = { 'ex_samourai.json': 2500, 'ex_mage.json': 2500, 'ex_decker.json': 7500, 'ex_adepte.json': 0 };
// Personnages privés facultatifs (tests/prives/, ignoré par git) : seuls les avertissements et limites sont contrôlés.
const dossiers = [['exemples', f => ATTENDU[f]], ['prives', () => undefined]];
let echecs = 0;
for (const [d, attendu] of dossiers) {
  const dir = path.join(__dirname, d);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json'))) {
    const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true });
    const w = dom.window;
    w.openText(fs.readFileSync(path.join(dir, f), 'utf8'));
    const msg = w.document.querySelector('#msg').textContent;
    const r = w.eval('costs(PJ).reste'), av = w.eval('derive(PJ).W');
    const ko = [...w.document.querySelectorAll('#panel li.ko')].map(x => x.textContent);
    const att = attendu(f);
    const ok = !msg && av.length === 0 && ko.length === 0 && (att === undefined || r === att);
    if (!ok) echecs++;
    console.log((ok ? 'OK    ' : 'ÉCHEC ') + d + '/' + f + ' reste=' + r + ' avertissements=' + av.length + ' limites dépassées=' + ko.length + (msg ? ' erreur=' + msg : ''));
    w.close();
  }
}
// Les exemples fictifs doivent, ensemble, utiliser tous les types d'atouts (et un type personnalisé).
{
  const w = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true }).window;
  const types = w.eval('ATYPES.map(t=>t[0])'), vus = new Set(); let perso = false;
  for (const f of Object.keys(ATTENDU)) for (const a of JSON.parse(fs.readFileSync(path.join(__dirname, 'exemples', f), 'utf8')).atouts) { vus.add(a.type); if (a.type_perso) perso = true; }
  const manque = types.filter(t => !vus.has(t));
  const ok = manque.length === 0 && perso;
  if (!ok) echecs++;
  console.log((ok ? 'OK    ' : 'ÉCHEC ') + 'exemples : tous les types d’atouts' + (manque.length ? ', manquants : ' + manque.join(', ') : '') + (perso ? '' : ', pas de type personnalisé'));
  w.close();
}
process.exit(echecs ? 1 : 0);
