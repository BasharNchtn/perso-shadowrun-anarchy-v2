// Test des fiches de PNJ (planche de blocs compacts, en RD ou en seuils fixes).
// Usage : npm i jsdom && node tests/pnj.js
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let echecs = 0;
const verifie = (nom, ok, detail = '') => { if (!ok) echecs++; console.log((ok ? 'OK    ' : 'ÉCHEC ') + nom + (ok ? '' : ' ' + detail)); };
const fichiers = ['exemples', 'prives'].map(d => path.join(__dirname, d)).filter(d => fs.existsSync(d))
  .flatMap(d => fs.readdirSync(d).filter(x => x.endsWith('.json')).map(x => path.join(d, x)));
const nouveau = store => new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true,
  beforeParse(w) { if (store) for (const [k, v] of Object.entries(store)) w.localStorage.setItem(k, v); } }).window;
const nombres = (doc, sel) => [...doc.querySelectorAll(sel)].map(x => +x.textContent);

// 1. Formule du seuil fixe : s = RD/3 + RR + 1, arrondi au plus proche
{
  const w = nouveau();
  const cas = [[9, 0, 4], [9, 1, 5], [7, 0, 3], [8, 0, 4], [10, 2, 6], [2, 0, 2], [12, 1, 6], [11, 0, 5]];
  verifie('formule du seuil fixe', cas.every(([rd, rr, s]) => w.eval(`seuil(${rd},${rr})`) === s), JSON.stringify(cas.map(([rd, rr]) => w.eval(`seuil(${rd},${rr})`))));
  w.close();
}
// 2. Valeurs affichées pour chaque personnage (exemples fictifs et privés éventuels)
for (const f of fichiers) {
  const w = nouveau(), doc = w.document;
  w.openText(fs.readFileSync(f, 'utf8'));
  const comps = w.eval('derive(PJ).comps.filter(c=>c.indice||c.rr)');
  const specs = comps.flatMap(c => c.specs);
  w.eval("FMODE='seuil'"); w.showTab('fiche');
  const sd = nombres(doc, '.pnj .pk b.v'), ssp = nombres(doc, '.pnj .pk i.sx b');
  const ok1 = JSON.stringify(sd) === JSON.stringify(comps.map(c => Math.round(c.rd / 3) + c.rr + 1))
    && JSON.stringify(ssp) === JSON.stringify(specs.map(x => Math.round(x.rd / 3) + x.rr + 1));
  w.eval("FMODE='rd'"); w.showTab('fiche');
  const rd = nombres(doc, '.pnj .pk b.v');
  const ok2 = JSON.stringify(rd) === JSON.stringify(comps.map(c => c.rd));
  const fo = w.eval('PJ.attributs.force'), bp = w.eval('derive(PJ).bon.phys');
  const bl = nombres(doc, '.pnj .bl2 b').slice(3, 6).length ? [...doc.querySelectorAll('.pnj .bl2')][0].textContent : '';
  const ok3 = bl.includes('Physique' + (fo + bp) + (fo + bp + 3) + (fo + bp + 6));
  const nbArmes = doc.querySelectorAll('.pnj table tr').length - 1, attendu = w.eval('derive(PJ).main.length');
  const ok4 = nbArmes === Math.max(attendu, 0) || (attendu === 0 && nbArmes === -1);
  verifie(path.basename(f) + ' : seuils, RD, blessures et armes', ok1 && ok2 && ok3 && ok4, `seuils=${ok1} rd=${ok2} blessures=${ok3} armes=${ok4}`);
  w.close();
}
// 3. Planche, sélection, mode mémorisé
{
  let w = nouveau();
  for (const f of fichiers.slice(0, 3)) w.openText(fs.readFileSync(f, 'utf8'));
  const doc = w.document, n = w.eval('SESS.length');
  w.showTab('fiche');
  verifie('mode PJ par défaut : fiche complète', doc.querySelector('.sheet') && !doc.querySelector('.planche'));
  doc.querySelector('#fmodes').onchange({ target: { name: 'fmode', value: 'seuil' } });
  verifie('mode PNJ : un bloc par personnage ouvert', doc.querySelectorAll('.pnj').length === n && doc.querySelector('.pnj header i').textContent === 'SEUILS');
  verifie('mode PNJ : « Imprimer tous » masqué', doc.querySelector('#bprintall').hidden === true);
  verifie('seuils : note de bas de planche', /s = RD ÷ 3 \+ RR \+ 1/.test(doc.querySelector('.planche .pn').textContent));
  doc.querySelector('#fmodes').onchange({ target: { dataset: { p: '1' }, checked: false } });
  verifie('personnage décoché : retiré de la planche', doc.querySelectorAll('.pnj').length === n - 1);
  doc.querySelector('#fmodes').onchange({ target: { name: 'fmode', value: 'rd' } });
  verifie('mode RD', doc.querySelector('.pnj header i').textContent === 'RD' && /réserve de dés/.test(doc.querySelector('.planche .pn').textContent));
  w.openText(fs.readFileSync(fichiers[3] || fichiers[0], 'utf8'));
  verifie('planche mise à jour à l’ouverture d’un personnage', doc.querySelectorAll('.pnj').length === n);
  w.persist();
  const stock = w.localStorage.getItem('anarchy-pjs'); w.close();
  w = nouveau({ 'anarchy-pjs': stock }); w.showTab('fiche');
  verifie('mode et sélection conservés après rechargement', w.eval('FMODE') === 'rd' && w.eval('SESS[1].pl') === false && w.document.querySelector('#fmodes input[value="rd"]').checked);
  w.document.querySelector('#fmodes').onchange({ target: { name: 'fmode', value: 'pj' } });
  verifie('retour à la fiche PJ', !!w.document.querySelector('.sheet') && !w.document.querySelector('.planche'));
  w.close();
}
process.exit(echecs ? 1 : 0);
