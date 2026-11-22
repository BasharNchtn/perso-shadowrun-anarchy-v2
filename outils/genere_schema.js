// Génère format_pj_v2.schema.json (JSON Schema 2020-12) et la section « valeurs permises » de generer_un_personnage.md
// à partir des données de index.html :
// compétences et spécialisations, types d'atouts, codes d'effets, types d'armes et de véhicules, niveaux de jeu.
// Le schéma ne peut donc pas diverger de l'application.
// Usage : npm i jsdom && node outils/genere_schema.js        (écrit format_pj_v2.schema.json à la racine)
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');

function genere() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const w = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/' }).window;
  const D = {
    keys: w.eval('KEYS'), cat: w.eval('CATALOGUE.map(c=>({nom:c.nom,specs:c.specs.map(s=>s.nom)}))'),
    types: w.eval('ATYPES.map(t=>t[0])'), pre: w.eval('EFP.filter(e=>e.id).map(e=>e.id)'),
    efp: w.eval('EFP.filter(e=>e.id).map(e=>({id:e.id,only:e.only||null,max:typeof e.max==="number"?e.max:null}))'),
    armes: w.eval('WT.map(t=>t.id)'), vehicules: w.eval('VMOD.map(v=>v.id)'),
    niveaux: w.eval('Object.keys(NIV)'), sorts: w.eval('TSORT'), metatypes: w.eval('Object.keys(META)'),
    vehTypes: w.eval("VMOD.filter(v=>v.k==='Véhicule').map(v=>v.id)"), droneTypes: w.eval("VMOD.filter(v=>v.k==='Drone').map(v=>v.id)")
  };
  w.close();
  const ref = n => ({ $ref: '#/$defs/' + n });
  const entier = (min, max) => ({ type: 'integer', minimum: min, maximum: max });
  const bool = { type: 'boolean' };
  const txt = { type: 'string' };
  const objet = (properties, required = []) => ({ type: 'object', additionalProperties: false, properties, ...(required.length ? { required } : {}) });
  const persoVrai = { type: 'object', required: ['perso'], properties: { perso: { const: true } } };
  const typeSeulement = (types, cle) => ({ if: { properties: { type: { enum: types } }, required: ['type'] }, then: {}, else: { not: { required: [cle] } } });

  const bonus = (type, props, requis) => objet({ type: { const: type }, valeur: entier(1, 5), ...props }, ['type', 'valeur', ...requis]);
  const $defs = {
    attribut: { enum: D.keys },
    portee: { enum: ['OK', 'Dés', '-'] },
    competence: {
      ...objet({
        nom: { type: 'string', minLength: 1 }, actif: bool, attribut: ref('attribut'), indice: entier(0, 8), perso: bool,
        specialites: { type: 'array', items: ref('specialite') }
      }, ['nom']),
      description: "Un nom absent du catalogue exige `perso: true`. Les 16 compétences officielles sont ajoutées par l'application si elles manquent.",
      allOf: [
        { if: { not: persoVrai }, then: { properties: { nom: { enum: D.cat.map(c => c.nom) } } } },
        ...D.cat.map(c => ({
          if: { required: ['nom'], properties: { nom: { const: c.nom } } },
          then: { properties: { specialites: { type: 'array', items: { if: { not: persoVrai }, then: { type: 'object', properties: { nom: { enum: c.specs } } } } } } }
        }))
      ]
    },
    specialite: objet({ nom: { type: 'string', minLength: 1 }, detail: txt, actif: bool, attribut: ref('attribut'), perso: bool }, ['nom']),
    connaissance: objet({ nom: txt, actif: bool }, ['nom']),
    contact: objet({ nom: txt, type: txt, description: txt, actif: bool }),
    armure: objet({ id: txt, nom: txt, valeur: entier(0, 10), actif: bool }),
    equipement: objet({ id: txt, nom: txt, actif: bool, offert: bool, description: txt }, ['nom']),
    effet: {
      description: "Trois formes : bonus typé (`bonus`), effet prédéfini (`pre` + `qte`) ou effet personnalisé (`texte` + `niveau`, sans `bonus` ni `pre`). Le niveau d'un bonus ou d'un effet prédéfini est calculé par l'application.",
      oneOf: [
        { ...objet({ texte: txt, niveau: entier(-20, 30), bonus: ref('bonus') }, ['bonus']) },
        { ...objet({ texte: txt, niveau: entier(-20, 30), pre: { enum: D.pre }, qte: entier(1, 10) }, ['pre']),
          description: 'La quantité `qte` ne peut pas dépasser le maximum de chaque effet (voir generer_un_personnage.md).',
          allOf: D.efp.filter(e => e.max !== null).map(e => ({ if: { required: ['pre'], properties: { pre: { const: e.id } } }, then: { properties: { qte: { type: 'integer', maximum: e.max } } } })) },
        { ...objet({ texte: txt, niveau: entier(-20, 30) }, ['texte', 'niveau']) }
      ]
    },
    bonus: {
      oneOf: [
        bonus('rr', { competence: txt, specialisation: { type: ['string', 'null'] }, perso_comp: bool, perso_spec: bool }, ['competence']),
        bonus('rr_attribut', { attribut: ref('attribut') }, ['attribut']),
        bonus('vd', { cible: txt }, ['cible']),
        bonus('armure', { portee: { enum: ['physique', 'mental', 'tous'] } }, ['portee']),
        bonus('case', { gravite: { enum: ['legere', 'grave', 'incap'] } }, ['gravite']),
        bonus('portee', { cible: txt, rang: { enum: ['Contact', 'Courte', 'Moyenne', 'Longue'] } }, ['cible', 'rang'])
      ]
    },
    vehicule: objet({
      modele: { enum: [...D.vehicules, 'perso'] }, micro: bool,
      base: objet({ structure: entier(0, 12), maniabilite: entier(0, 12), vitesse: entier(0, 12) })
    }, ['modele']),
    atout: {
      ...objet({
        id: txt, type: { type: 'string', minLength: 1 }, type_perso: bool, nom: txt, actif: bool, niveau_base: entier(0, 20),
        perte_essence: { type: 'number', minimum: 0, maximum: 6 }, effets: { type: 'array', items: ref('effet') }, ref: txt,
        programmes: { type: 'array', items: txt }, vehicule: ref('vehicule')
      }, ['type', 'nom']),
      description: 'Un type hors liste exige `type_perso: true` (alors `niveau_base` et `perte_essence` sont saisis).',
      allOf: [
        { if: { not: { type: 'object', required: ['type_perso'], properties: { type_perso: { const: true } } } }, then: { properties: { type: { enum: D.types } } } },
        { if: { required: ['type'], properties: { type: { enum: ['Véhicule', 'Drone'] } } }, then: { required: ['vehicule'] }, else: { not: { required: ['vehicule'] } } },
        { if: { required: ['type'], properties: { type: { const: 'Véhicule' } } }, then: { properties: { vehicule: { type: 'object', properties: { modele: { enum: [...D.vehTypes, 'perso'] } } } } } },
        { if: { required: ['type'], properties: { type: { const: 'Drone' } } }, then: { properties: { vehicule: { type: 'object', properties: { modele: { enum: [...D.droneTypes, 'perso'] } } } } } },
        { if: { required: ['type'], properties: { type: { const: 'Cyberdeck' } } }, else: { not: { required: ['programmes'] } } },
        { if: { required: ['type'], properties: { type: { const: 'Équipement' } } }, else: { not: { required: ['ref'] } } },
        // effets prédéfinis réservés à certains types d'atouts
        ...D.efp.filter(e => e.only).map(e => ({
          if: { required: ['type'], properties: { type: { enum: e.only } } },
          else: { properties: { effets: { type: 'array', items: { not: { type: 'object', required: ['pre'], properties: { pre: { const: e.id } } } } } } }
        }))
      ]
    },
    arme: {
      ...objet({
        id: txt, nom: txt, actif: bool, categorie: { enum: ['arme', 'arme_specialiste', 'sort', 'forme_complexe'] },
        type_arme: { enum: D.armes }, vd: { anyOf: [{ type: 'number' }, { type: 'string' }] }, portees: { type: 'array', minItems: 4, maxItems: 4, items: ref('portee') },
        specialisation: txt, toxine: bool, description: txt, monte_ref: txt, monte_sur: txt,
        type_sort: { enum: D.sorts }, seuil: txt, aire: bool, taille: bool
      }, ['nom', 'categorie']),
      description: "Armes : `type_arme` fixe VD, portées et spécialisation ; sans `type_arme`, `vd` et `portees` sont obligatoires. Sorts : `type_sort`, `seuil`. Formes complexes : `seuil`.",
      allOf: [
        { if: { properties: { categorie: { enum: ['arme', 'arme_specialiste'] } } }, then: { not: { anyOf: [{ required: ['type_sort'] }, { required: ['seuil'] }, { required: ['aire'] }, { required: ['taille'] }] } } },
        { if: { properties: { categorie: { enum: ['arme', 'arme_specialiste'] } }, required: ['categorie'], not: { required: ['type_arme'] } }, then: { required: ['vd', 'portees'] } },
        { if: { properties: { categorie: { const: 'sort' } }, required: ['categorie'] }, then: { not: { anyOf: [{ required: ['type_arme'] }, { required: ['vd'] }, { required: ['portees'] }, { required: ['toxine'] }, { required: ['monte_ref'] }, { required: ['monte_sur'] }] } } },
        { if: { properties: { categorie: { const: 'forme_complexe' } }, required: ['categorie'] }, then: { not: { anyOf: [{ required: ['type_arme'] }, { required: ['type_sort'] }, { required: ['vd'] }, { required: ['portees'] }, { required: ['toxine'] }, { required: ['aire'] }, { required: ['taille'] }] } } }
      ]
    }
  };
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://github.com/BasharNchtn/perso-shadowrun-anarchy-v2/format_pj_v2.schema.json',
    title: 'Personnage Shadowrun Anarchy 2.0 (format_pj_v2)',
    description: "Généré par outils/genere_schema.js à partir de index.html : ne pas modifier à la main. Les champs calculés (coûts, réserves de dés, Essence…) ne sont jamais stockés. Seul `format` est obligatoire ; l'application complète tout le reste (compétences officielles, `id`, niveaux de base, niveaux des effets prédéfinis).",
    type: 'object', additionalProperties: false, required: ['format'],
    properties: {
      format: { const: 'anarchy-pj' }, version: { const: 2 },
      identite: objet({
        pseudo: txt, nom: txt, metatype: { type: 'string', examples: D.metatypes }, mots_cles: { type: 'array', items: txt },
        train_de_vie: txt, naissance: txt, taille: txt, poids: txt, particularites: txt,
        repliques: { type: 'array', items: txt }, comportements: { type: 'array', items: txt },
        portrait: { type: 'string', pattern: '^data:image/' }, portrait_x: { type: 'number' }, portrait_y: { type: 'number' },
        portrait_zoom: { type: 'number' }, portrait_ratio: { type: 'number' }
      }),
      niveau_de_jeu: objet({
        nom: { enum: [...D.niveaux, 'Choix'] }, limites_actives: bool, nuyens: { type: 'integer', minimum: 0 },
        nb_attributs_max: entier(0, 5), indice_max_competence: entier(1, 8), rr_max_competence: entier(0, 3), rr_max_specialisation: entier(0, 3)
      }),
      gains: { type: 'number' },
      attributs: objet(Object.fromEntries(D.keys.map(k => [k, entier(0, 12)]))),
      attributs_max: { oneOf: [{ type: 'null' }, objet(Object.fromEntries(D.keys.map(k => [k, entier(1, 12)])))] },
      competences: { type: 'array', items: ref('competence') },
      contacts: { type: 'array', items: ref('contact') },
      connaissances: { type: 'array', items: ref('connaissance') },
      atouts: { type: 'array', items: ref('atout') },
      armes: { type: 'array', items: ref('arme') },
      equipement: { type: 'array', items: ref('equipement') },
      armures: { type: 'array', items: ref('armure') }
    },
    $defs
  };
}

// Section « valeurs permises » du guide (generer_un_personnage.md) : toutes les listes de valeurs de l'appli, en Markdown.
function valeurs() {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const w = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/' }).window;
  const J = e => JSON.parse(JSON.stringify(w.eval(e)));
  const niv = J('NIV'), meta = J('META'), cat = J('CATALOGUE'), atypes = J('ATYPES'), efp = J('EFP'), wt = J('WT'), vmod = J('VMOD'), tsort = J('TSORT'), keys = J('KEYS');
  w.close();
  const n = x => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const L = [];
  L.push('### Niveaux de jeu (`niveau_de_jeu.nom`)', '', '| Niveau | `nuyens` | `nb_attributs_max` | `indice_max_competence` | `rr_max_competence` | `rr_max_specialisation` |', '|---|---|---|---|---|---|');
  for (const [k, v] of Object.entries(niv)) L.push(`| ${k} | ${n(v[0])} | ${v[1]} | ${v[2]} | ${v[3]} | ${v[4]} |`);
  L.push('| Choix | libre | libre | libre | libre | libre |', '', 'Avec `Choix`, ces cinq limites sont saisies à la main dans `niveau_de_jeu`. L\'indice d\'une compétence ne dépasse jamais 8.', '');
  L.push('### Attributs et métatypes', '', 'Clés de `attributs` : ' + keys.map(k => '`' + k + '`').join(', ') + '.', '', '| `metatype` | force | agilite | volonte | logique | charisme |', '|---|---|---|---|---|---|');
  for (const [k, v] of Object.entries(meta)) L.push(`| ${k} | ${v.join(' | ')} |`);
  L.push('', 'Maximum par attribut selon le métatype (un métatype hors de cette liste exige `attributs_max`).', '');
  L.push('### Compétences et spécialisations', '', 'Noms exacts (accents compris). Entre parenthèses : l\'attribut par défaut. Une compétence ou spécialisation hors de cette liste exige `"perso": true`.', '');
  for (const c of cat) L.push(`- **${c.nom}** (${c.attribut}) : ${c.specs.map(x => x.nom + (x.attribut !== c.attribut ? ' (' + x.attribut + ')' : '')).join(', ')}`);
  L.push('', '### Types d\'atouts (`atouts[].type`)', '', '| Type | `niveau_base` | `perte_essence` |', '|---|---|---|');
  for (const [t, b, e] of atypes) L.push(`| ${t} | ${b} | ${e} |`);
  L.push('', 'Un autre type exige `"type_perso": true` (alors `niveau_base` et `perte_essence` sont saisis). Ces deux valeurs sont fixées par l\'appli pour les types de la liste.', '');
  L.push('### Effets d\'atouts', '', 'Un effet a l\'une de ces trois formes : `{"pre": "<code>", "qte": 1}` (effet prédéfini), `{"bonus": {...}}` (bonus typé) ou `{"texte": "...", "niveau": 2}` (effet personnalisé, coût saisi). Le niveau des deux premières formes est calculé par l\'appli.', '');
  L.push('Effets prédéfinis (`pre`) :', '', '| Code | Effet | Niveaux par unité | `qte` max | Réservé aux types |', '|---|---|---|---|---|');
  for (const e of efp.filter(x => x.id)) L.push(`| \`${e.id}\` | ${e.t} | ${e.n} | ${e.max === undefined ? '1' : e.max === 'S' ? 'structure' : e.max} | ${e.only ? e.only.join(', ') : 'tous'} |`);
  const mapType = e => e.k === 'rra' ? 'rr_attribut' : e.k;
  L.push('', 'Bonus typés (`bonus.type`) et leur coût :', '');
  for (const e of efp.filter(x => x.k)) L.push(`- \`${mapType(e)}\`${e.k === 'rr' ? (e.spe ? ' avec `specialisation`' : ' sans `specialisation` (RR de compétence)') : ''} : ${e.l}`);
  L.push('', 'Champs des bonus : `rr` → `competence`, `specialisation` (ou `null`), `valeur` ; `rr_attribut` → `attribut`, `valeur` ; `vd` → `cible` (nom d\'une arme ou d\'une spécialisation), `valeur` ; `armure` → `portee` (`physique`, `mental` ou `tous`), `valeur` ; `case` → `gravite` (`legere`, `grave` ou `incap`), `valeur` ; `portee` → `cible`, `rang` (`Contact`, `Courte`, `Moyenne` ou `Longue`), `valeur`.', '');
  L.push('### Armes (`armes[].type_arme`, catégories `arme` et `arme_specialiste`)', '', 'Le type fixe la VD, les portées et la spécialisation : ne pas les écrire. Portées : `OK`, `Dés`, `-` (impossible), dans l\'ordre ≤ 2 m, 3-15 m, 16-60 m, > 60 m.', '', '| `type_arme` | Type | VD | Portées | Spécialisation |', '|---|---|---|---|---|');
  for (const t of wt) L.push(`| \`${t.id}\` | ${t.nom} | ${t.vd === '' ? 'toxine' : t.vd} | ${t.p.join(' / ')} | ${t.sp.join(', ')} |`);
  L.push('', 'Sans `type_arme`, l\'arme est entièrement libre : `vd` (nombre ou texte comme `"FOR+2"`) et `portees` (4 valeurs) sont alors obligatoires.', '');
  L.push('### Sorts et formes complexes', '', 'Catégorie `sort` : `type_sort` parmi ' + tsort.map(t => '`' + t + '`').join(', ') + ', plus `seuil`, `description`, `aire`, `taille`. Catégorie `forme_complexe` : `seuil`, `description`.', '');
  L.push('### Véhicules et drones (`atouts[].vehicule.modele`)', '', 'Atout de type `Véhicule` : ' + vmod.filter(v => v.k === 'Véhicule').map(v => '`' + v.id + '` (' + v.nom + ')').join(', ') + '.', '', 'Atout de type `Drone` : ' + vmod.filter(v => v.k === 'Drone').map(v => '`' + v.id + '` (' + v.nom + ')').join(', ') + '.', '', 'Structure, maniabilité et vitesse viennent du modèle ; les modifier passe par des effets. `"perso"` permet un modèle libre.');
  return L.join('\n');
}
const MARQ = ['<!-- debut:valeurs-permises (généré par npm run schema : ne pas modifier à la main) -->', '<!-- fin:valeurs-permises -->'];
function guideAJour(contenu) {
  const a = contenu.indexOf(MARQ[0]), b = contenu.indexOf(MARQ[1]);
  if (a < 0 || b < 0) throw new Error('marqueurs absents du guide');
  return contenu.slice(0, a) + MARQ[0] + '\n\n' + valeurs() + '\n\n' + contenu.slice(b);
}
module.exports = { genere, valeurs, guideAJour };
if (require.main === module) {
  const f = path.join(__dirname, '..', 'format_pj_v2.schema.json');
  fs.writeFileSync(f, JSON.stringify(genere(), null, 2) + '\n');
  console.log('écrit : ' + f);
  const g = path.join(__dirname, '..', 'generer_un_personnage.md');
  if (fs.existsSync(g)) { fs.writeFileSync(g, guideAJour(fs.readFileSync(g, 'utf8'))); console.log('mis à jour : ' + g); }
}
