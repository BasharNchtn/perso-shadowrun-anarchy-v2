// Test du schéma JSON (format_pj_v2.schema.json) : à jour par rapport à l'appli, accepte les fichiers valides
// (dont des fichiers « écrits par un autre programme » que l'appli ouvre sans erreur) et rejette les erreurs typiques.
// Usage : npm i jsdom ajv && node tests/schema.js
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const Ajv2020 = require('ajv/dist/2020');
const { genere } = require('../outils/genere_schema.js');
const racine = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(racine, 'index.html'), 'utf8');
let echecs = 0;
const verifie = (nom, ok, detail = '') => { if (!ok) echecs++; console.log((ok ? 'OK    ' : 'ÉCHEC ') + nom + (ok ? '' : ' ' + detail)); };

// 1. Le fichier du schéma correspond à ce que l'appli produirait aujourd'hui
const fichier = JSON.parse(fs.readFileSync(path.join(racine, 'format_pj_v2.schema.json'), 'utf8'));
verifie('schéma à jour (npm run schema pour le régénérer)', JSON.stringify(fichier) === JSON.stringify(genere()));
// Mode strict par défaut du validateur : le schéma ne doit produire aucun avertissement.
const avert = [];
const ajv = new Ajv2020({ allErrors: true, logger: { log() {}, warn: m => avert.push(m), error: m => avert.push(m) } });
const valide = ajv.compile(fichier);
verifie('schéma compatible avec le mode strict du validateur', avert.length === 0, avert.slice(0, 2).join(' | '));
const erreurs_ = () => (valide.errors || []).slice(0, 3).map(e => `${e.instancePath || '/'} ${e.message}`).join(' ; ');

// 2. Fichiers écrits par l'appli : exemples fictifs et personnages privés éventuels
for (const d of ['exemples', 'prives']) {
  const dir = path.join(__dirname, d);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json')))
    verifie(`${d}/${f} valide`, valide(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))), erreurs_());
}

// 3. Fichiers « générés par un autre programme » : valides pour le schéma ET ouverts sans erreur par l'appli
const { minimal, generique, erreurs, erreursSchemaSeul, bases, copie } = require('./cas.js');
for (const [nom, doc] of [['minimal', minimal], ['complet sans id ni niveaux', generique]]) {
  verifie(`fichier généré « ${nom} » : valide pour le schéma`, valide(doc), erreurs_());
  const w = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true }).window;
  let ok = false, detail = '';
  try {
    ok = w.openText(JSON.stringify(doc)) && Number.isFinite(w.eval('costs(PJ).reste')) && Array.isArray(w.eval('derive(PJ).W'));
    w.showTab('fiche'); w.eval("FMODE='seuil'"); w.showTab('fiche');
  } catch (e) { ok = false; detail = e.message; }
  verifie(`fichier généré « ${nom} » : ouvert par l'appli sans erreur`, ok && !w.document.querySelector('#msg').textContent, detail || w.document.querySelector('#msg').textContent);
  w.close();
}

// 4. Erreurs typiques : le schéma doit toutes les rejeter (tests/anomalies.js vérifie que l'appli les signale)
for (const [nom, base, f] of [...erreurs, ...erreursSchemaSeul]) { const d = copie(bases[base]); f(d); verifie(`rejeté : ${nom}`, !valide(d)); }

// 5. Les listes de champs de l'appli (CHAMPS) sont identiques à celles du schéma
{
  const w = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/' }).window;
  const champs = w.eval('JSON.parse(JSON.stringify(CHAMPS))'), D = fichier.$defs;
  const cles = o => Object.keys(o.properties).sort().join();
  const paires = { racine: fichier, identite: fichier.properties.identite, niveau: fichier.properties.niveau_de_jeu, attributs: fichier.properties.attributs,
    comp: D.competence, spec: D.specialite, conn: D.connaissance, contact: D.contact, atout: D.atout, effet: D.effet.oneOf[0], bonus: null,
    vehicule: D.vehicule, base: D.vehicule.properties.base, arme: D.arme, armure: D.armure, equip: D.equipement };
  for (const [k, o] of Object.entries(paires)) {
    let attendu;
    if (k === 'effet') attendu = [...new Set(D.effet.oneOf.flatMap(x => Object.keys(x.properties)))].sort().join();
    else if (k === 'bonus') attendu = [...new Set(D.bonus.oneOf.flatMap(x => Object.keys(x.properties)))].sort().join();
    else attendu = cles(o);
    verifie(`champs « ${k} » identiques dans l'appli et le schéma`, champs[k].slice().sort().join() === attendu, `${champs[k].slice().sort().join()} / ${attendu}`);
  }
  w.close();
}
process.exit(echecs ? 1 : 0);
