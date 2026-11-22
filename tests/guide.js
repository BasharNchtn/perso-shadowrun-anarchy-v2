// Test du guide generer_un_personnage.md : section générée à jour, exemples JSON valides, liens existants.
// Usage : npm i jsdom ajv && node tests/guide.js
const fs = require('fs'), path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const { guideAJour } = require('../outils/genere_schema.js');
const { verifie: verifierFichier } = require('../outils/verifier.js');
const racine = path.join(__dirname, '..');
let echecs = 0;
const verifie = (nom, ok, detail = '') => { if (!ok) echecs++; console.log((ok ? 'OK    ' : 'ÉCHEC ') + nom + (ok ? '' : ' ' + detail)); };
const guide = fs.readFileSync(path.join(racine, 'generer_un_personnage.md'), 'utf8');

verifie('section « valeurs permises » à jour (npm run schema pour la régénérer)', guideAJour(guide) === guide);

const ajv = new Ajv2020({ allErrors: true, strict: false });
const valide = ajv.compile(JSON.parse(fs.readFileSync(path.join(racine, 'format_pj_v2.schema.json'), 'utf8')));
let n = 0;
for (const [, bloc] of guide.matchAll(/```json\n([\s\S]*?)```/g)) {
  let d; try { d = JSON.parse(bloc); } catch (e) { continue; }          // fragments à plusieurs objets : ignorés
  if (!d.format) continue;
  n++;
  const r = verifierFichier(bloc, 'exemple du guide n° ' + n);
  verifie(`exemple complet n° ${n} du guide : valide pour le schéma`, valide(d), JSON.stringify((valide.errors || []).slice(0, 2)));
  verifie(`exemple complet n° ${n} du guide : valide pour l'appli (budget, limites, anomalies)`, r.valide, JSON.stringify([r.erreur, r.anomalies, r.limites, r.avertissements]));
}
verifie('le guide contient au moins deux exemples complets', n >= 2);

// Liens relatifs des documents : les fichiers cibles existent
for (const f of ['generer_un_personnage.md', 'README.md', 'format_pj_v2.md']) {
  const t = fs.readFileSync(path.join(racine, f), 'utf8');
  const manquants = [...t.matchAll(/\]\(([^)#\s]+)\)/g)].map(m => m[1]).filter(l => !/^(https?:|mailto:)/.test(l)).filter(l => !fs.existsSync(path.join(racine, l)));
  verifie(`${f} : liens relatifs valides`, manquants.length === 0, manquants.join(', '));
}
process.exit(echecs ? 1 : 0);
