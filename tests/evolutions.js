// Test de la page de création : effet narratif (champ de description, premier inclus sans coût dans 4 types d'atouts)
// et affichage des nuyens quand les limites du niveau de jeu sont désactivées.
// Usage : npm i jsdom && node tests/evolutions.js
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
let echecs = 0;
const verifie = (nom, ok, detail = '') => { if (!ok) echecs++; console.log((ok ? 'OK    ' : 'ÉCHEC ') + nom + (ok ? '' : ' ' + detail)); };
const nouveau = () => new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true }).window;
const ouvre = (w, o) => w.openText(JSON.stringify({ format: 'anarchy-pj', ...o }));
const lvl = (w, i) => w.eval(`lvl(PJ.atouts[${i}])`);

// ---- Effet narratif : coût
{
  const w = nouveau();
  const nar = texte => ({ pre: 'nar', qte: 1, texte });
  ouvre(w, { atouts: [
    { type: 'Cyberware', nom: 'Yeux', effets: [nar('Vision thermographique')] },
    { type: 'Cyberware', nom: 'Yeux 2', effets: [nar('Vision'), nar('Zoom')] },
    { type: 'Trait', nom: 'Doué', effets: [nar('Charisme naturel')] },
    { type: 'Bioware', nom: 'Foie', effets: [nar('Résiste aux toxines')] },
    { type: "Pouvoir d'adepte", nom: 'Sens', effets: [nar('Sens aiguisés')] },
    { type: 'Équipement', nom: 'Sac', effets: [nar('Compartiment secret')] },
    { type: 'Éveil', nom: 'Magie', niveau_base: 1, effets: [nar('Aura visible')] },
    { type: 'Mutation', type_perso: true, nom: 'Peau', niveau_base: 1, perte_essence: 0, effets: [nar('Tatouages')] }
  ] });
  const base = [1, 1, 0, 2, 1, 0, 1, 1];            // niveaux de base (imposés par ATYPES, sauf l'Éveil et le type personnalisé fixés ici)
  const attendu = [1, 2, 0, 2, 1, 1, 2, 2];          // + 1 par effet narratif non inclus
  verifie('niveaux : le premier effet narratif est gratuit pour Cyberware, Trait, Bioware et Pouvoir d’adepte', JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7].map(i => lvl(w, i))) === JSON.stringify(attendu), JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7].map(i => lvl(w, i))));
  verifie('un deuxième effet narratif coûte 1 niveau', lvl(w, 1) === 2);
  verifie('Équipement, Éveil et type personnalisé : l’effet narratif coûte 1 niveau', lvl(w, 5) === 1 && lvl(w, 6) === 2 && lvl(w, 7) === 2);
  w.eval("PJ.atouts[0].effets=[]"); verifie('sans effet narratif : niveau de base seul', lvl(w, 0) === 1);
  w.close();
}
// ---- Effet narratif : texte conservé à l'enregistrement, à la réouverture et sur la fiche
{
  const w = nouveau();
  ouvre(w, { atouts: [{ type: 'Cyberware', nom: 'Yeux', effets: [{ pre: 'nar', qte: 1, texte: 'Vision thermographique' }] }] });
  verifie('texte de l’effet narratif conservé à l’ouverture', w.eval('PJ.atouts[0].effets[0].texte') === 'Vision thermographique');
  const json = w.eval('SER(PJ,2)');
  const w2 = nouveau(); w2.openText(json);
  verifie('texte conservé après enregistrement puis réouverture', w2.eval('PJ.atouts[0].effets[0].texte') === 'Vision thermographique');
  verifie('texte affiché sur la fiche', w2.eval("derive(PJ).atouts[0].effets.map(e=>e.texte).join()").includes('Vision thermographique'));
  ouvre(w2, { atouts: [{ type: 'Cyberware', nom: 'Y', effets: [{ pre: 'nar', qte: 1 }] }] });
  verifie('sans texte : libellé par défaut', w2.eval('PJ.atouts[0].effets[0].texte') === 'Effet narratif');
  w.close(); w2.close();
}
// ---- Effet narratif : champs du formulaire
{
  const w = nouveau(), doc = w.document;
  ouvre(w, { atouts: [{ type: 'Trait', nom: 'Doué' }, { type: 'Éveil', nom: 'Magie', niveau_base: 1 }] });
  w.showTab('crea');
  const champs = () => [...doc.querySelectorAll('#form [data-act=narinc]')];
  verifie('Trait sans effet narratif : champ « inclus » proposé', champs().length === 1 && /inclus/.test(champs()[0].closest('.eline').textContent) && champs()[0].closest('.eline').textContent.includes('niv.'));
  verifie('Éveil : pas de champ narratif d’office', doc.querySelectorAll('#form [data-act=narinc]').length === 1);
  const c = champs()[0]; c.value = 'Charisme naturel';
  c.dispatchEvent(new w.Event('change', { bubbles: true }));
  verifie('saisie : l’effet narratif est créé avec son texte', w.eval('PJ.atouts[0].effets.length') === 1 && w.eval('PJ.atouts[0].effets[0].pre') === 'nar' && w.eval('PJ.atouts[0].effets[0].texte') === 'Charisme naturel');
  verifie('niveau du Trait inchangé (effet inclus)', lvl(w, 0) === 0);
  const t = doc.querySelector('#form [data-p="atouts.0.effets.0.texte"]');
  verifie('le champ de description est affiché avec le texte', t && t.value === 'Charisme naturel' && champs().length === 0);
  t.value = 'Charisme surnaturel'; t.dispatchEvent(new w.Event('input', { bubbles: true }));
  verifie('modification du texte conservée', w.eval('PJ.atouts[0].effets[0].texte') === 'Charisme surnaturel' && lvl(w, 0) === 0);
  w.eval('PJ.atouts[1].effets=[{pre:"nar",qte:1,texte:"Aura",niveau:1}]'); w.eval('rebuild()');
  verifie('hors types inclus : le niveau affiché de l’effet narratif est 1', lvl(w, 1) === 2 && /Effet narratif :/.test(doc.querySelector('#form [data-row="atouts.1"]').textContent));
  w.close();
}
// ---- Limites désactivées : plus de « reste », seulement le total dépensé et sa part du niveau Runner
{
  const w = nouveau(), doc = w.document;
  ouvre(w, { niveau_de_jeu: { nom: 'Choix', nuyens: 1000, limites_actives: false }, attributs: { force: 4, agilite: 4, volonte: 4, logique: 3, charisme: 3 }, identite: { pseudo: 'Vétéran' } });
  w.showTab('crea');
  const total = w.eval('costs(PJ).total'), pct = Math.round(total / 375000 * 100);
  const panneau = doc.querySelector('#panel').textContent, mini = doc.querySelector('#mini').textContent;
  verifie('panneau : pas de « Reste » ni de « Disponible »', !/Reste|Disponible/.test(panneau), panneau.slice(0, 300));
  verifie('panneau : total dépensé et part du niveau Runner', /Dépensé/.test(panneau) && panneau.includes(`Part du niveau Runner`) && panneau.includes(pct + ' %'), panneau.slice(0, 300));
  verifie('barre du haut : pourcentage au lieu du reste', !/Reste/.test(mini) && mini.includes(pct + ' % du niveau Runner'), mini);
  verifie('limites : plus d’alerte « Nuyens restants » (même si le budget est dépassé)', !/Nuyens restants/.test(doc.querySelector('#panel').innerHTML) && w.eval('costs(PJ).reste') < 0);
  verifie('création : plus de ligne « Nuyens disponibles »', !/Nuyens disponibles/.test(doc.querySelector('#form').textContent));
  w.showTab('fiche');
  const fiche = doc.querySelector('#out').textContent;
  verifie('fiche : « Nuyens dépensés » à la place de « Nuyens dispo »', /Nuyens dépensés/.test(fiche) && !/Nuyens dispo/.test(fiche));
  // Comparer
  ouvre(w, { niveau_de_jeu: { nom: 'Runner', nuyens: 375000, nb_attributs_max: 1, indice_max_competence: 5, rr_max_competence: 1, rr_max_specialisation: 2 }, identite: { pseudo: 'Débutant' } });
  w.showTab('comp');
  const lignes = [...doc.querySelectorAll('#comp tbody tr')].map(r => [...r.children].map(x => x.textContent.trim()));
  const restants = lignes.find(l => l[0].toLowerCase() === 'nuyens restants'), part = lignes.find(l => /part du niveau/i.test(l[0]));
  verifie('Comparer : « – » pour les nuyens restants d’un personnage sans limites, valeur pour l’autre', restants && restants[1] === '–' && /¥/.test(restants[2]), JSON.stringify(restants));
  verifie('Comparer : part du niveau Runner pour chaque personnage', part && /%/.test(part[1]) && /%/.test(part[2]));
  // limites réactivées : le reste revient
  w.activate(0); w.eval('PJ.niveau_de_jeu.limites_actives=true;touch(true)'); w.showTab('crea');
  verifie('limites réactivées : « Reste » et « Disponible » reviennent', /Reste/.test(doc.querySelector('#panel').textContent) && /Disponible/.test(doc.querySelector('#panel').textContent));
  w.close();
}
// ---- Limites désactivées mais gains renseignés : le suivi des nuyens (départ + gains) reste affiché, sans les limites
{
  const w = nouveau(), doc = w.document;
  ouvre(w, { niveau_de_jeu: { nom: 'Choix', nuyens: 1000, nb_attributs_max: 0, limites_actives: false }, gains: 20000, attributs: { force: 4, agilite: 4, volonte: 4, logique: 3, charisme: 3 }, identite: { pseudo: 'Joueur' } });
  w.showTab('crea');
  const panneau = doc.querySelector('#panel').textContent, total = w.eval('costs(PJ).total');
  verifie('gains renseignés : « Disponible » et « Reste » reviennent', /Disponible/.test(panneau) && /Reste/.test(panneau) && !/Part du niveau Runner/.test(panneau), panneau.slice(0, 200));
  verifie('disponible = nuyens de départ + gains', w.eval('costs(PJ).dispo') === 21000 && w.eval('costs(PJ).reste') === 21000 - total);
  verifie('budget dépassé : alerte « Nuyens restants »', [...doc.querySelectorAll('#panel li.ko')].some(x => /Nuyens restants/.test(x.textContent)));
  verifie('les limites du niveau de jeu restent désactivées (aucune autre alerte)', [...doc.querySelectorAll('#panel li.ko')].every(x => /Nuyens restants/.test(x.textContent)));
  verifie('création : ligne « Nuyens disponibles » présente', /Nuyens disponibles/.test(doc.querySelector('#form').textContent));
  verifie('barre du haut : reste affiché', /Reste/.test(doc.querySelector('#mini').textContent));
  w.showTab('fiche');
  verifie('fiche : « Nuyens (dispo / total) » comme pour un PJ avec gains', /Nuyens \(dispo \/ total\).*20\s?000/.test(doc.querySelector('#out').textContent.replace(/\u202f|\u00a0/g, ' ')));
  w.eval('PJ.gains=0;touch(true)'); w.showTab('crea');
  verifie('gains remis à zéro : le suivi disparaît de nouveau', !/Reste|Disponible/.test(doc.querySelector('#panel').textContent));
  w.close();
}
// ---- Commande de vérification : limites désactivées
{
  const { verifie: v } = require('../outils/verifier.js');
  const r = v(JSON.stringify({ format: 'anarchy-pj', niveau_de_jeu: { nom: 'Choix', nuyens: 1000, nb_attributs_max: 0, limites_actives: false }, attributs: { force: 4, agilite: 4, volonte: 4, logique: 3, charisme: 3 } }), 'x.json');
  verifie('vérificateur : limites désactivées, budget dépassé non signalé', r.valide && r.limites_actives === false && r.nuyens.restants === undefined && r.nuyens.part_niveau_runner > 0 && r.limites.length === 0, JSON.stringify(r));
  const g = v(JSON.stringify({ format: 'anarchy-pj', niveau_de_jeu: { nom: 'Choix', nuyens: 1000, nb_attributs_max: 0, limites_actives: false }, gains: 20000, attributs: { force: 4, agilite: 4, volonte: 4, logique: 3, charisme: 3 } }), 'y.json');
  verifie('vérificateur : limites désactivées avec gains, budget suivi (seule alerte : nuyens restants)', g.budget === true && g.limites_actives === false && g.nuyens.restants < 0 && g.limites.length === 1 && /Nuyens restants/.test(g.limites[0]), JSON.stringify(g));
}
process.exit(echecs ? 1 : 0);
