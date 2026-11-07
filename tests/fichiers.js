// Test des fichiers liés aux personnages : mémorisation après rechargement, « Tout enregistrer », ouverture d'un dossier.
// L'API File System Access et IndexedDB sont simulées. Usage : npm i jsdom && node tests/fichiers.js
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const ex = f => fs.readFileSync(path.join(__dirname, 'exemples', f), 'utf8');
let echecs = 0;
const verifie = (nom, ok, detail = '') => { if (!ok) echecs++; console.log((ok ? 'OK    ' : 'ÉCHEC ') + nom + (ok ? '' : ' ' + detail)); };
const attend = (ms = 30) => new Promise(r => setTimeout(r, ms));

const faux = (name, texte, perm = 'granted') => {
  const h = { kind: 'file', name, ecrits: [], perm, demandes: 0,
    getFile: async () => ({ text: async () => texte }),
    createWritable: async () => ({ write: async t => h.ecrits.push(t), close: async () => {} }),
    isSameEntry: async o => o === h,
    queryPermission: async () => h.perm,
    requestPermission: async () => { h.demandes++; return h.perm === 'denied' ? 'denied' : 'granted'; } };
  return h;
};
const fenetre = (opts = {}) => new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true,
  beforeParse(w) {
    w.confirm = () => true;
    if (opts.store) for (const [k, v] of Object.entries(opts.store)) w.localStorage.setItem(k, v);
    if (opts.hstore) w.__hstore = opts.hstore;
    if (opts.open) w.showOpenFilePicker = async () => opts.open();
    if (opts.save) w.showSaveFilePicker = async () => opts.save();
    if (opts.dir) w.showDirectoryPicker = async () => opts.dir();
  } }).window;
const magasin = () => { const m = new Map(); return { m, put: async (k, v) => { m.set(k, v); }, get: async k => m.get(k), del: async k => { m.delete(k); } }; };

(async () => {
  // 1. Les fichiers sont retrouvés après un rechargement
  {
    const hs = magasin(), H1 = faux('Lame.json', ex('ex_samourai.json'));
    let w = fenetre({ hstore: hs, open: () => [H1], save: () => faux('autre.json', '') });
    await w.openFile(); await attend();
    verifie('fichier mémorisé à l’ouverture', hs.m.size === 1 && [...hs.m.values()][0] === H1);
    w.eval('PJ.identite.pseudo="Lame bis";touch()');
    w.persist();
    const stock = w.localStorage.getItem('anarchy-pjs'); w.close();

    const H2save = faux('nouveau.json', '');
    w = fenetre({ hstore: hs, store: { 'anarchy-pjs': stock }, open: () => [], save: () => H2save });
    await attend();
    verifie('rechargement : fichier retrouvé', w.eval('FH') !== null && w.eval('FH.name') === 'Lame.json');
    verifie('rechargement : nom du fichier dans l’info-bulle de la puce', w.document.querySelector('#pjs').innerHTML.includes('title="Lame.json"'));
    H1.perm = 'prompt';
    await w.save(false);
    verifie('enregistrement dans le fichier retrouvé, accès redemandé', H1.ecrits.length === 1 && H1.demandes === 1 && JSON.parse(H1.ecrits[0]).identite.pseudo === 'Lame bis');
    H1.perm = 'denied';
    w.eval('touch()');
    await w.save(false);
    verifie('accès refusé : proposition d’un nouvel emplacement', H2save.ecrits.length === 1 && H1.ecrits.length === 1);
    w.close();
  }
  // 2. Tout enregistrer
  {
    const A = faux('a.json', ex('ex_samourai.json')), B = faux('b.json', ex('ex_mage.json')), C = faux('c.json', ex('ex_decker.json')), N = faux('neuf.json', '');
    const w = fenetre({ hstore: magasin(), open: () => [A, B, C], save: () => N });
    await w.openFile();
    w.eval('addPJ({})'); w.eval('PJ.identite.pseudo="Sans fichier";touch()');
    w.activate(0); w.eval('PJ.identite.pseudo="A2";touch()');
    w.activate(2); w.eval('PJ.identite.pseudo="C2";touch()');
    w.activate(1);
    verifie('3 personnages modifiés avant « Tout enregistrer »', w.eval('SESS.filter(s=>s.dirty).length + (DIRTY&&!SESS[CUR].dirty?1:0)') >= 3);
    verifie('bouton « Tout enregistrer » visible', !w.document.querySelector('#bsaveall').hidden);
    w.showTab('comp');
    verifie('comparaison : nom du fichier dans l’en-tête', /a\.json/.test(w.document.querySelector('#comp thead').textContent));
    w.showTab('crea');
    await w.saveAll();
    verifie('tous les modifiés enregistrés dans leur fichier', A.ecrits.length === 1 && C.ecrits.length === 1 && B.ecrits.length === 0 && N.ecrits.length === 1);
    verifie('plus rien de modifié', w.eval('SESS.every(s=>!s.dirty)') && w.eval('DIRTY') === false);
    verifie('personnage actif d’origine rétabli', w.eval('CUR') === 1);
    await w.saveAll();
    verifie('rien à enregistrer : aucune écriture en plus', A.ecrits.length === 1 && /Rien à enregistrer/.test(w.document.querySelector('#msg').textContent));
    w.close();
  }
  // 3. Ouvrir un dossier
  {
    const a = faux('a.json', ex('ex_samourai.json')), b = faux('b.json', ex('ex_mage.json')), pk = faux('package.json', '{"name":"x"}'), txt = faux('notes.txt', 'x');
    const dossier = { name: 'table', entries: async function* () { yield ['b.json', b]; yield ['notes.txt', txt]; yield ['package.json', pk]; yield ['a.json', a]; } };
    const w = fenetre({ hstore: magasin(), dir: () => dossier, open: () => [] });
    await w.ouvrirDossier();
    verifie('dossier : seuls les personnages Anarchy sont ouverts', w.eval('SESS.length') === 2);
    verifie('dossier : ordre alphabétique des fichiers', w.eval('SESS.map(s=>s.fh.name).join()') === 'a.json,b.json');
    verifie('dossier : pas de message d’erreur pour les autres JSON', !/Erreur/.test(w.document.querySelector('#msg').textContent) && /2 personnage/.test(w.document.querySelector('#msg').textContent));
    await w.ouvrirDossier();
    verifie('dossier rouvert : pas de doublons', w.eval('SESS.length') === 2);
    w.close();
  }
  // 4. Dossier sans l'API (Firefox, Safari) : sélection d'un dossier par le champ fichier
  {
    const w = fenetre({ hstore: magasin() });
    const f = (n, t, rel) => ({ name: n, webkitRelativePath: rel || 'table/' + n, text: async () => t });
    await w.document.querySelector('#fdir').onchange({ target: { value: 'x', files: [f('b.json', ex('ex_mage.json')), f('a.json', ex('ex_samourai.json')), f('x.json', '{}'), f('profond.json', ex('ex_decker.json'), 'table/sous/profond.json')] } });
    verifie('dossier sans API : 2 personnages, sous-dossiers ignorés', w.eval('SESS.length') === 2);
    w.close();
  }
  process.exit(echecs ? 1 : 0);
})();
