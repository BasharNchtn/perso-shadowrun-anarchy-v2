#!/usr/bin/env node
// Vérifie un ou plusieurs fichiers JSON de personnage avec les vraies règles de l'application (index.html, via jsdom) :
// anomalies du fichier (champs inconnus, valeurs hors liste, liens rompus…), limites du niveau de jeu, budget, Essence.
// Usage : node outils/verifier.js personnage.json [autre.json …] [--json]
//         cat personnage.json | node outils/verifier.js - [--json]
// Code de sortie : 0 = valide, 1 = anomalies, avertissements ou limites dépassées, 2 = fichier illisible ou refusé.
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function verifie(texte, nom = '') {
  const w = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/' }).window;
  const r = { fichier: nom, ouvert: false, erreur: null, pseudo: null, anomalies: [], limites: [], avertissements: [], nuyens: null, essence: null, limites_actives: true, budget: true, valide: false };
  try {
    r.ouvert = w.openText(texte, null, true);
    if (!r.ouvert) {
      let erreur = 'Fichier refusé.';
      try { JSON.parse(texte); const p = JSON.parse(texte); erreur = p && p.format !== 'anarchy-pj' ? 'Format inconnu : "format" doit valoir "anarchy-pj".' : erreur; }
      catch (e) { erreur = 'JSON illisible : ' + e.message; }
      r.erreur = erreur; return r;
    }
    r.pseudo = w.eval('PJ.identite.pseudo') || null;
    r.anomalies = (w.eval('SESS[CUR].anom') || []).slice();
    const propre = x => x.replace(/^\s*[✖✔✓✗⚠]\s*/, '').trim();
    r.limites = [...w.document.querySelectorAll('#panel li.ko')].map(x => propre(x.textContent));
    const C = w.eval('costs(PJ)'), D = w.eval('derive(PJ)');
    r.avertissements = [...new Set(D.W.map(propre))].filter(x => !r.limites.includes(x));
    r.limites_actives = w.eval('PJ.niveau_de_jeu.limites_actives!==false');
    // Limites désactivées et pas de gains : pas de reste de nuyens, seulement le total dépensé et sa part du niveau Runner.
    r.budget = w.eval('budget(PJ)');
    r.nuyens = r.budget ? { depenses: C.total, disponibles: C.dispo, restants: C.reste } : { depenses: C.total, part_niveau_runner: w.eval('pctRunner(costs(PJ))') };
    r.essence = D.ess;
    r.valide = !r.anomalies.length && !r.limites.length && !r.avertissements.length;
  } catch (e) { r.erreur = 'Vérification impossible : ' + e.message; }
  finally { w.close(); }
  return r;
}
function texte(r) {
  const L = [];
  const titre = r.fichier || 'fichier';
  if (!r.ouvert) return `✖ ${titre} : ${r.erreur}`;
  L.push(`${r.valide ? '✔' : '✖'} ${titre}${r.pseudo ? ' (« ' + r.pseudo + ' »)' : ''} : ${r.valide ? 'valide' : 'à corriger'}`);
  const n = x => x.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ');
  L.push(r.budget
    ? `  Nuyens : ${n(r.nuyens.depenses)} dépensés sur ${n(r.nuyens.disponibles)} (reste ${n(r.nuyens.restants)}) · Essence : ${r.essence}`
    : `  Nuyens : ${n(r.nuyens.depenses)} dépensés (${r.nuyens.part_niveau_runner} % du niveau Runner ; limites du niveau de jeu désactivées, pas de gains) · Essence : ${r.essence}`);
  for (const [t, l] of [['Anomalies du fichier', r.anomalies], ['Limites et budget', r.limites], ['Avertissements', r.avertissements]])
    if (l.length) { L.push(`  ${t} :`); l.forEach(x => L.push('   - ' + x)); }
  return L.join('\n');
}
module.exports = { verifie, texte };

if (require.main === module) {
  const args = process.argv.slice(2), json = args.includes('--json'), fichiers = args.filter(a => a !== '--json');
  if (!fichiers.length) { console.error('Usage : node outils/verifier.js personnage.json [autre.json …] [--json]   ("-" lit l\'entrée standard)'); process.exit(2); }
  const res = fichiers.map(f => {
    let t;
    try { t = fs.readFileSync(f === '-' ? 0 : f, 'utf8'); } catch (e) { return { fichier: f, ouvert: false, erreur: 'Lecture impossible : ' + e.message, anomalies: [], limites: [], avertissements: [], valide: false }; }
    return verifie(t, f === '-' ? 'entrée standard' : f);
  });
  console.log(json ? JSON.stringify(res.length === 1 ? res[0] : res, null, 2) : res.map(texte).join('\n\n'));
  process.exit(res.some(r => !r.ouvert) ? 2 : res.every(r => r.valide) ? 0 : 1);
}
