// Test de la gestion de plusieurs personnages : ouverture, changement, fermeture, comparaison, copie locale.
// Usage : npm i jsdom && node tests/multi.js
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const ex = f => fs.readFileSync(path.join(__dirname, 'exemples', f), 'utf8');
let echecs = 0;
const verifie = (nom, ok, detail = '') => { if (!ok) echecs++; console.log((ok ? 'OK    ' : 'ÉCHEC ') + nom + (ok ? '' : ' ' + detail)); };
const nouveau = (store) => new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/', pretendToBeVisual: true,
  beforeParse(w) { if (store) for (const [k, v] of Object.entries(store)) w.localStorage.setItem(k, v); w.confirm = () => true; } }).window;

(async () => {
  let w = nouveau();
  verifie('démarrage : 1 personnage vide', w.eval('SESS.length') === 1 && w.document.querySelector('#pjs').hidden);
  for (const f of ['ex_samourai.json', 'ex_mage.json', 'ex_decker.json']) w.openText(ex(f));
  verifie('3 ouverts, le personnage vide initial est remplacé', w.eval('SESS.length') === 3);
  verifie('puces affichées', w.document.querySelectorAll('#pjs .chip').length === 3 && !w.document.querySelector('#pjs').hidden);
  verifie('le dernier ouvert est actif', w.eval('CUR') === 2 && w.eval('PJ.identite.pseudo') === JSON.parse(ex('ex_decker.json')).identite.pseudo);

  w.activate(0);
  verifie('changement de personnage', w.eval('PJ.identite.pseudo') === JSON.parse(ex('ex_samourai.json')).identite.pseudo);
  w.eval('PJ.identite.pseudo="Lame2";touch()');
  w.activate(1);
  verifie('modification gardée, signalée sur la puce', w.eval('SESS[0].pj.identite.pseudo') === 'Lame2' && w.eval('SESS[0].dirty') === true
    && /●\s*Lame2/.test(w.document.querySelector('#pjs').textContent));
  verifie('dirty du personnage actif distinct', w.eval('DIRTY') === false);

  // comparaison
  w.showTab('comp');
  const t = w.document.querySelector('#comp table');
  verifie('tableau de comparaison : une colonne par personnage', t && t.querySelectorAll('thead th').length === 4);
  verifie('comparaison : sections attendues', ['Ressources', 'Attributs', 'Compétences', 'Atouts', 'Armes'].every(x => t.textContent.includes(x)));
  verifie('comparaison : nuyens restants', /7\s?500/.test(t.textContent.replace(/\u202f|\u00a0/g, ' ')));
  verifie('comparaison : meilleures valeurs surlignées', t.querySelectorAll('td.mx').length > 0);

  // l'onglet Comparer suit les ouvertures, fermetures et la sélection
  {
    const cols = () => w.document.querySelectorAll('#comp table thead th').length - 1;
    w.showTab('comp');
    verifie('comparer : 3 colonnes au départ', cols() === 3);
    w.openText(ex('ex_adepte.json'));
    verifie('comparer : se met à jour à l’ouverture d’un personnage', w.eval('SESS.length') === 4 && cols() === 4);
    const cb = w.document.querySelector('#comp input[data-c="1"]');
    cb.checked = false; w.document.querySelector('#comp').onchange({ target: cb });
    verifie('comparer : un personnage décoché disparaît du tableau', cols() === 3 && w.eval('SESS[1].cmp') === false);
    w.document.querySelector('#comp').onchange({ target: Object.assign(w.document.querySelector('#comp input[data-c="0"]'), { checked: false }) });
    w.document.querySelector('#comp').onchange({ target: Object.assign(w.document.querySelector('#comp input[data-c="2"]'), { checked: false }) });
    verifie('comparer : moins de deux cochés, message sans tableau', !w.document.querySelector('#comp table') && /au moins deux/.test(w.document.querySelector('#comp').textContent));
    for (const i of [0, 1, 2]) w.document.querySelector('#comp').onchange({ target: Object.assign(w.document.querySelector('#comp input[data-c="' + i + '"]'), { checked: true }) });
    verifie('comparer : tout recoché, 4 colonnes', cols() === 4);
    w.closePJ(3);
    verifie('comparer : se met à jour à la fermeture d’un personnage', w.eval('SESS.length') === 3 && cols() === 3);
    const cb2 = w.document.querySelector('#comp input[data-c="1"]');
    cb2.checked = false; w.document.querySelector('#comp').onchange({ target: cb2 });
    verifie('comparer : on reste sur l’onglet après une fermeture', !w.document.querySelector('#comp').hidden);
    w.showTab('crea');
    w.activate(1);
  }

  // copie locale puis rechargement
  w.persist();
  const stock = w.localStorage.getItem('anarchy-pjs');
  w.close();
  w = nouveau({ 'anarchy-pjs': stock });
  verifie('rechargement : 3 personnages restaurés', w.eval('SESS.length') === 3);
  verifie('rechargement : sélection de la comparaison restaurée', w.eval('SESS.map(s=>s.cmp!==false).join()') === 'true,false,true');
  verifie('rechargement : état modifié restauré', w.eval('SESS[0].dirty') === true && w.eval('SESS[0].pj.identite.pseudo') === 'Lame2');
  verifie('rechargement : personnage actif restauré', w.eval('CUR') === 1);

  // fermeture
  w.closePJ(0);
  verifie('fermeture d’un personnage', w.eval('SESS.length') === 2 && w.eval('CUR') === 0);
  w.closePJ(0); w.closePJ(0);
  verifie('fermer le dernier crée un personnage vide', w.eval('SESS.length') === 1 && w.eval('SESS[0].neuf') === true);

  // Nouveau : pas de doublon de personnage vide
  w.document.querySelector('#bnew').click();
  verifie('« Nouveau » sur un personnage vide ne crée rien', w.eval('SESS.length') === 1);

  // deux versions d'un même personnage : le second ouvert est numéroté
  {
    const w3 = nouveau();
    w3.openText(ex('ex_samourai.json')); w3.openText(ex('ex_samourai.json')); w3.openText(ex('ex_mage.json')); w3.openText(ex('ex_samourai.json'));
    const noms = [...w3.document.querySelectorAll('#pjs .chip button[data-go]')].map(b => b.textContent.trim());
    verifie('noms identiques : numérotés dans l’ordre d’ouverture', noms.join('|') === 'Lame|Lame (2)|Ondine|Lame (3)', noms.join('|'));
    w3.showTab('comp');
    const ent = [...w3.document.querySelectorAll('#comp thead th')].map(x => x.textContent);
    verifie('comparaison : les colonnes portent le nom numéroté', ent.some(x => x.startsWith('Lame (2)')) && ent.some(x => x.startsWith('Lame (3)')));
    verifie('comparaison : cases à cocher numérotées', [...w3.document.querySelectorAll('#comp .csel label')].map(l => l.textContent.trim()).includes('Lame (2)'));
    w3.eval('SESS[1].pj.identite.pseudo="Lame v2"');
    w3.closePJ(0);
    const apres = [...w3.document.querySelectorAll('#pjs .chip button[data-go]')].map(b => b.textContent.trim());
    verifie('plus de numéro quand le nom n’est plus partagé', apres.join('|') === 'Lame v2|Ondine|Lame', apres.join('|'));
  }
  // surlignage des différences entre deux versions d'un même personnage
  {
    const w4 = nouveau();
    w4.openText(ex('ex_samourai.json')); w4.openText(ex('ex_samourai.json'));
    w4.eval('PJ.attributs.force=4;PJ.competences.find(x=>x.nom==="Perception").indice=4;PJ.atouts=PJ.atouts.filter(a=>a.nom!=="Vétéran");touch()');
    w4.showTab('comp');
    const doc = w4.document, radio = v => doc.querySelector('#comp input[name="cmode"][value="' + v + '"]');
    const ligne = nom => [...doc.querySelectorAll('#comp tbody tr')].find(r => r.querySelector('th') && r.querySelector('th').textContent.trim().toLowerCase() === nom);
    verifie('versions du même nom : mode « différences » par défaut', radio('diff').checked && /diffère/.test(doc.querySelector('#comp').textContent));
    const f = ligne('force').querySelectorAll('td');
    verifie('différence : seule la colonne modifiée est surlignée', !f[0].classList.contains('df') && f[1].classList.contains('df'));
    const same = ligne('agilité').querySelectorAll('td');
    verifie('valeur identique : pas de surlignage', !same[1].classList.contains('df'));
    verifie('compétence modifiée surlignée', ligne('perception').querySelectorAll('td')[1].classList.contains('df'));
    verifie('élément retiré : barré dans la colonne modifiée', [...doc.querySelectorAll('#comp td .l.del')].some(x => /Vétéran/.test(x.textContent)));
    w4.eval('PJ.armes.push({id:"zz",nom:"Couteau",actif:true,categorie:"arme",type_arme:"contact",specialisation:"lames"});touch()');
    w4.showTab('comp');
    verifie('élément ajouté : surligné dans la colonne modifiée', [...doc.querySelectorAll('#comp td .l.add')].some(x => /Couteau/.test(x.textContent)));
    doc.querySelector('#comp').onchange({ target: { name: 'cmode', value: 'best' } });
    verifie('mode « meilleure valeur » : plus de différences, meilleure valeur surlignée', doc.querySelectorAll('#comp td.df').length === 0 && doc.querySelectorAll('#comp td.mx').length > 0);
    doc.querySelector('#comp').onchange({ target: { name: 'cmode', value: 'none' } });
    verifie('mode « rien » : aucun surlignage', doc.querySelectorAll('#comp td.df, #comp td.mx, #comp .l.add, #comp .l.del').length === 0);
    w4.persist();
    const w5 = nouveau({ 'anarchy-pjs': w4.localStorage.getItem('anarchy-pjs') });
    w5.showTab('comp');
    verifie('mode de surlignage conservé après rechargement', w5.document.querySelector('#comp input[name="cmode"][value="none"]').checked);
    const w6 = nouveau();
    w6.openText(ex('ex_mage.json')); w6.openText(ex('ex_decker.json')); w6.showTab('comp');
    verifie('personnages différents : « meilleure valeur » par défaut', w6.document.querySelector('#comp input[name="cmode"][value="best"]').checked);
  }
  // ancienne copie locale (clé unique) reprise
  const vieux = JSON.stringify(JSON.parse(ex('ex_samourai.json')));
  const w2 = nouveau({ 'anarchy-pj': vieux });
  verifie('ancienne copie locale reprise', w2.eval('SESS.length') === 1 && w2.eval('PJ.identite.pseudo') !== '');
  process.exit(echecs ? 1 : 0);
})();
