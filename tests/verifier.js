// Test de la commande outils/verifier.js (codes de sortie, sortie texte et JSON, entrée standard).
// Usage : npm i jsdom && node tests/verifier.js
const fs = require('fs'), path = require('path'), os = require('os');
const { spawnSync } = require('child_process');
const racine = path.join(__dirname, '..'), cmd = path.join(racine, 'outils', 'verifier.js');
let echecs = 0;
const verifie = (nom, ok, detail = '') => { if (!ok) echecs++; console.log((ok ? 'OK    ' : 'ÉCHEC ') + nom + (ok ? '' : ' ' + detail)); };
const lance = (args, entree) => { const r = spawnSync(process.execPath, [cmd, ...args], { input: entree, encoding: 'utf8' }); return { code: r.status, out: r.stdout, err: r.stderr }; };
const tmp = (nom, contenu) => { const f = path.join(os.tmpdir(), nom); fs.writeFileSync(f, typeof contenu === 'string' ? contenu : JSON.stringify(contenu)); return f; };
const ex = path.join(__dirname, 'exemples', 'ex_adepte.json');

let r = lance([ex]);
verifie('fichier valide : code 0 et résumé', r.code === 0 && /✔/.test(r.out) && /Nuyens/.test(r.out) && /Essence/.test(r.out), r.out + r.err);
r = lance([ex, '--json']);
let j; try { j = JSON.parse(r.out); } catch (e) { j = null; }
verifie('--json : objet complet', j && j.valide === true && j.ouvert === true && j.pseudo === 'Ombre' && j.nuyens.restants === 0 && Array.isArray(j.anomalies) && Array.isArray(j.limites), r.out.slice(0, 200));
// budget dépassé et limites : code 1, détail dans « limites »
const trop = tmp('trop.json', { format: 'anarchy-pj', niveau_de_jeu: { nom: 'Runner', nuyens: 1000, nb_attributs_max: 1, indice_max_competence: 5, rr_max_competence: 1, rr_max_specialisation: 2 }, attributs: { force: 4, agilite: 4, volonte: 4, logique: 3, charisme: 3 } });
r = lance([trop, '--json']); j = JSON.parse(r.out);
verifie('budget et limites dépassés : code 1', r.code === 1 && j.valide === false && j.limites.some(x => /Nuyens restants/.test(x)) && j.limites.some(x => /maximum/i.test(x)), r.out);
// anomalie du fichier seule : code 1
const anomalie = tmp('anomalie.json', { format: 'anarchy-pj', atouts: [{ type: 'Cyberwear', nom: 'X' }] });
r = lance([anomalie]);
verifie('anomalie du fichier : code 1 et message', r.code === 1 && /Cyberwear/.test(r.out) && /Anomalies du fichier/.test(r.out), r.out);
// effet au-delà du maximum : signalé comme limite
const maxi = tmp('maxi.json', { format: 'anarchy-pj', atouts: [{ type: 'Éveil', nom: 'M', effets: [{ pre: 'maint', qte: 5 }] }] });
r = lance([maxi, '--json']); j = JSON.parse(r.out);
verifie('effet au-delà du maximum : signalé', r.code === 1 && [...j.limites, ...j.avertissements].some(x => /maximum/.test(x)), r.out);
// fichier illisible, format inconnu, absent : code 2
r = lance(['-'], 'x{');
verifie('JSON illisible : code 2', r.code === 2 && /illisible/.test(r.out), r.out);
r = lance(['-'], '{"format":"autre"}');
verifie('format inconnu : code 2', r.code === 2 && /anarchy-pj/.test(r.out), r.out);
r = lance([path.join(os.tmpdir(), 'absent_xyz.json')]);
verifie('fichier absent : code 2', r.code === 2 && /Lecture impossible/.test(r.out), r.out);
r = lance([]);
verifie('sans argument : usage et code 2', r.code === 2 && /Usage/.test(r.err));
// entrée standard et plusieurs fichiers
r = lance(['-', '--json'], JSON.stringify({ format: 'anarchy-pj' }));
verifie('entrée standard', r.code === 0 && JSON.parse(r.out).fichier === 'entrée standard', r.out);
r = lance([ex, anomalie, '--json']); j = JSON.parse(r.out);
verifie('plusieurs fichiers : tableau de résultats, code 1 si l’un est à corriger', Array.isArray(j) && j.length === 2 && j[0].valide && !j[1].valide && r.code === 1);
process.exit(echecs ? 1 : 0);
