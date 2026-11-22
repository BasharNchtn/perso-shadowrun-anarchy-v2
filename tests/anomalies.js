// Test du rapport d'anomalies à l'ouverture : l'appli ouvre le fichier, mais signale tout ce que le schéma rejette.
// Usage : npm i jsdom && node tests/anomalies.js
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const { minimal, generique, erreurs, bases, copie } = require('./cas.js');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let echecs = 0;
const verifie = (nom, ok, detail = '') => { if (!ok) echecs++; console.log((ok ? 'OK    ' : 'ÉCHEC ') + nom + (ok ? '' : ' ' + detail)); };
const nouveau = () => new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true }).window;
const anom = w => w.eval('SESS[CUR].anom') || [];

// 1. Aucun faux positif : fichiers valides (exemples fictifs, privés éventuels, fichiers générés)
{
  const fichiers = ['exemples', 'prives'].map(d => path.join(__dirname, d)).filter(d => fs.existsSync(d))
    .flatMap(d => fs.readdirSync(d).filter(x => x.endsWith('.json')).map(x => path.join(d, x)));
  for (const f of fichiers) {
    const w = nouveau(); w.openText(fs.readFileSync(f, 'utf8'));
    verifie(`${path.basename(f)} : aucune anomalie`, anom(w).length === 0, JSON.stringify(anom(w)));
    w.close();
  }
  for (const [nom, doc] of [['minimal', minimal], ['complet généré', generique]]) {
    const w = nouveau(); w.openText(JSON.stringify(doc));
    verifie(`fichier ${nom} : aucune anomalie`, anom(w).length === 0, JSON.stringify(anom(w)));
    w.close();
  }
  // anciens champs encore tolérés
  const w = nouveau();
  w.openText(JSON.stringify({ format: 'anarchy-pj', identite: { pseudo: 'Ancien', role: 'Mage', origine: 'Rue' }, armure: { nom: 'Veste', valeur: 2 } }));
  verifie('anciens champs (role, origine, armure) tolérés sans anomalie', anom(w).length === 0, JSON.stringify(anom(w)));
  w.close();
}

// 2. Chaque erreur que le schéma rejette est signalée par l'appli (ou le fichier est refusé avec un message)
for (const [nom, base, f, mot, refus] of erreurs) {
  const d = copie(bases[base]); f(d);
  const w = nouveau(), ouvert = w.openText(JSON.stringify(d));
  if (refus) verifie(`signalé : ${nom} (fichier refusé avec un message)`, ouvert === false && /Erreur/.test(w.document.querySelector('#msg').textContent));
  else {
    const a = anom(w);
    verifie(`signalé : ${nom}`, ouvert === true && a.some(x => x.includes(mot)), JSON.stringify(a));
    verifie(`  … et le fichier est ouvert quand même (${nom})`, ouvert === true && Number.isFinite(w.eval('costs(PJ).reste')));
  }
  w.close();
}

// 3. Bannière, marqueur sur la puce, masquage
{
  const w = nouveau(), doc = w.document;
  const d = copie(generique); d.atouts[0].type = 'Cyberwear'; d.atouts[0].effets[0].pre = 'zzz';
  w.openText(JSON.stringify(minimal));
  verifie('pas de bannière pour un fichier sans anomalie', doc.querySelector('#anom').hidden === true);
  w.openText(JSON.stringify(d));
  verifie('bannière affichée avec le nombre d’anomalies', doc.querySelector('#anom').hidden === false && /2 anomalies/.test(doc.querySelector('#anom').textContent) && /Cyberwear/.test(doc.querySelector('#anom').textContent));
  verifie('marqueur ⚠ sur la puce du personnage concerné', /⚠\s*Généré/.test(doc.querySelector('#pjs').textContent) && !/⚠\s*Sans nom/.test(doc.querySelector('#pjs').textContent));
  w.activate(0);
  verifie('bannière propre à chaque personnage', doc.querySelector('#anom').hidden === true);
  w.activate(1);
  verifie('bannière retrouvée en revenant sur le personnage', doc.querySelector('#anom').hidden === false);
  doc.querySelector('#anom').onclick({ target: { closest: s => s === '[data-close]' ? {} : null } });
  verifie('bannière masquée par la croix, marqueur retiré', doc.querySelector('#anom').hidden === true && !/⚠/.test(doc.querySelector('#pjs').textContent));
  w.close();
}
// 4. Beaucoup d'anomalies : liste tronquée
{
  const w = nouveau(), d = copie(minimal);
  for (let i = 0; i < 20; i++) d['inconnu' + i] = 1;
  w.openText(JSON.stringify(d));
  verifie('liste tronquée au-delà de 12 anomalies', anom(w).length === 20 && /et 8 autre/.test(w.document.querySelector('#anom').textContent));
  w.close();
}
process.exit(echecs ? 1 : 0);
