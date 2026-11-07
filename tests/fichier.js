// Test de l'enregistrement (API File System Access simulée) et de la version du format.
// Usage : npm i jsdom && node tests/fichier.js
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const exemple = fs.readFileSync(path.join(__dirname, 'exemples', 'ex_samourai.json'), 'utf8');
let echecs = 0;
const verifie = (nom, ok, detail = '') => { if (!ok) echecs++; console.log((ok ? 'OK    ' : 'ÉCHEC ') + nom + (ok ? '' : ' ' + detail)); };

(async () => {
  // 1. Avec l'API de fichiers : ouvrir puis enregistrer réécrit le même fichier
  {
    const ecrits = []; let pickers = 0;
    const handle = { name: 'ex_samourai.json', getFile: async () => ({ text: async () => exemple }),
      createWritable: async () => ({ write: async t => ecrits.push(t), close: async () => {} }) };
    const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true,
      beforeParse(w) { w.showOpenFilePicker = async () => [handle]; w.showSaveFilePicker = async () => { pickers++; return handle; }; } });
    const w = dom.window;
    await w.openFile();
    verifie('ouverture via l’API', w.eval('PJ.identite.pseudo') !== '' && w.eval('FH') === handle);
    w.eval('PJ.identite.pseudo="Test";touch()');
    verifie('modification signalée', w.eval('DIRTY') === true);
    await w.save(false);
    verifie('enregistrement dans le fichier ouvert', ecrits.length === 1 && pickers === 0 && w.eval('DIRTY') === false);
    verifie('contenu écrit = JSON valide à jour', JSON.parse(ecrits[0]).identite.pseudo === 'Test');
    await w.save(true);
    verifie('« Enregistrer sous » demande un fichier', pickers === 1 && ecrits.length === 2);
    w.eval('setPJ({})');
    verifie('« Nouveau » oublie le fichier', w.eval('FH') === null);
    w.close();
  }
  // 2. Sans l'API : repli par téléchargement
  {
    const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true,
      beforeParse(w) { w.URL.createObjectURL = () => 'blob:x'; } });
    const w = dom.window; let clics = 0;
    w.HTMLAnchorElement.prototype.click = function () { clics++; this._nom = this.download; };
    w.eval('PJ.identite.pseudo="Ondine";touch()');
    await w.save(false);
    verifie('repli par téléchargement', clics === 1 && w.eval('DIRTY') === false);
    w.close();
  }
  // 3. Version du format
  {
    const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true });
    const w = dom.window, p = JSON.parse(exemple);
    p.version = 99;
    const ok99 = w.openText(JSON.stringify(p));
    verifie('refuse un format plus récent', ok99 === false && /plus récente/.test(w.document.querySelector('#msg').textContent));
    delete p.version;
    verifie('accepte un fichier sans version', w.openText(JSON.stringify(p)) === true && w.eval('PJ.version') === w.eval('FMT_VERSION'));
    p.version = 1;
    verifie('refuse une version sans migration', w.openText(JSON.stringify(p)) === false);
    w.eval('MIGRATIONS[1]=p=>{p.migre=true}');
    verifie('applique une migration', w.openText(JSON.stringify(p)) === true && w.eval('PJ.version') === 2);
    w.close();
  }
  process.exit(echecs ? 1 : 0);
})();
