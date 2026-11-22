// Fichiers « générés par un autre programme » et erreurs typiques, partagés par tests/schema.js et tests/anomalies.js :
// le schéma doit rejeter chaque erreur, et l'application doit la signaler à l'ouverture (ou refuser le fichier).
const niveau = { nom: 'Runner', nuyens: 375000, nb_attributs_max: 1, indice_max_competence: 5, rr_max_competence: 1, rr_max_specialisation: 2 };
const attributs = { force: 2, agilite: 3, volonte: 3, logique: 3, charisme: 2 };
const minimal = { format: 'anarchy-pj' };
const generique = {
  format: 'anarchy-pj', identite: { pseudo: 'Généré' }, niveau_de_jeu: niveau, attributs,
  competences: [{ nom: 'Piratage', indice: 3, specialites: [{ nom: 'cybercombat', attribut: 'volonte' }] }, { nom: 'Pilotage perso', perso: true, attribut: 'agilite', indice: 1 }],
  atouts: [
    { type: 'Cyberware', nom: 'Datajack', effets: [{ pre: 'ia1', qte: 1 }] },
    { type: 'Trait', nom: 'Doué', effets: [{ bonus: { type: 'rr', competence: 'Piratage', specialisation: 'cybercombat', valeur: 1 } }] },
    { type: 'Équipement', ref: 'a1', nom: 'Katana', effets: [{ bonus: { type: 'vd', cible: 'Katana', valeur: 1 } }] },
    { type: 'Drone', nom: 'Rat', vehicule: { modele: 'mini' } },
    { type: 'Véhicule', nom: 'Fourgon', vehicule: { modele: 'van' } },
    { type: 'Cyberdeck', nom: 'Deck', programmes: ['Marteau'] },
    { type: 'Bioware', nom: 'Muscles', effets: [{ bonus: { type: 'case', gravite: 'legere', valeur: 1 } }] },
    { type: 'Mutation', type_perso: true, nom: 'Tatouage', niveau_base: 1, perte_essence: 0, effets: [{ texte: 'Narratif', niveau: 1 }] }],
  armes: [{ id: 'a1', nom: 'Katana', categorie: 'arme', type_arme: 'contact+', specialisation: 'lames' },
    { nom: 'Arme maison', categorie: 'arme', vd: 'FOR+2', portees: ['OK', '-', '-', '-'] },
    { nom: 'Éclair', categorie: 'sort', type_sort: 'combat', seuil: '2' }, { nom: 'Mimétisme', categorie: 'forme_complexe', seuil: '3' }],
  armures: [{ nom: 'Veste', valeur: 2 }], equipement: [{ nom: 'Lampe' }], connaissances: [{ nom: 'Matrice' }], contacts: [{ nom: 'Fixeur' }]
};
// [nom, base, modification, mot attendu dans le message de l'appli, refus total par l'appli ?]
const erreurs = [
  ['format incorrect', 'minimal', d => { d.format = 'anarchy'; }, null, true],
  ['version supérieure', 'minimal', d => { d.version = 3; }, null, true],
  ['champ inconnu à la racine', 'minimal', d => { d.foo = 1; }, 'foo'],
  ['faute de frappe dans identite', 'minimal', d => { d.identite = { pseudonyme: 'X' }; }, 'pseudonyme'],
  ['attribut écrit en texte', 'minimal', d => { d.attributs = { force: '3' }; }, 'texte'],
  ['niveau de jeu inconnu', 'minimal', d => { d.niveau_de_jeu = { nom: 'Légende' }; }, 'Légende'],
  ['type d’atout mal orthographié', 'generique', d => { d.atouts[0].type = 'Cyberwear'; }, 'Cyberwear'],
  ['code d’effet inconnu', 'generique', d => { d.atouts[0].effets[0].pre = 'zzz'; }, 'zzz'],
  ['type de bonus inconnu', 'generique', d => { d.atouts[1].effets[0].bonus.type = 'vitesse'; }, 'vitesse'],
  ['bonus de RR sans compétence', 'generique', d => { delete d.atouts[1].effets[0].bonus.competence; }, 'competence'],
  ['effet personnalisé sans niveau', 'generique', d => { delete d.atouts[7].effets[0].niveau; }, 'personnalisé'],
  ['type d’arme inconnu', 'generique', d => { d.armes[0].type_arme = 'bazooka'; }, 'bazooka'],
  ['portée en minuscules', 'generique', d => { d.armes[1].portees = ['ok', '-', '-', '-']; }, 'portees'],
  ['arme sans type ni VD', 'generique', d => { delete d.armes[1].vd; }, 'obligatoires'],
  ['type de sort inconnu', 'generique', d => { d.armes[2].type_sort = 'feu'; }, 'feu'],
  ['compétence inconnue non marquée perso', 'generique', d => { d.competences[1].perso = false; }, 'inconnu'],
  ['spécialisation hors catalogue', 'generique', d => { d.competences[0].specialites[0].nom = 'fusils'; }, 'catalogue'],
  ['atout Véhicule sans véhicule', 'generique', d => { delete d.atouts[4].vehicule; }, 'obligatoire'],
  ['véhicule sur un atout Cyberware', 'generique', d => { d.atouts[0].vehicule = { modele: 'van' }; }, 'vehicule'],
  ['modèle de drone pour un véhicule', 'generique', d => { d.atouts[4].vehicule.modele = 'micro'; }, 'micro'],
  ['modèle de véhicule pour un drone', 'generique', d => { d.atouts[3].vehicule.modele = 'berline'; }, 'berline'],
  ['programmes sur un atout hors Cyberdeck', 'generique', d => { d.atouts[0].programmes = ['X']; }, 'programmes'],
  ['ref sur un atout hors Équipement', 'generique', d => { d.atouts[0].ref = 'a1'; }, 'ref'],
  ['champ de sort sur une arme', 'generique', d => { d.armes[0].seuil = '2'; }, 'seuil'],
  ['effet réservé à un autre type d’atout', 'generique', d => { d.atouts[1].effets.push({ pre: 'fw', qte: 1 }); }, 'réservé']
];
// Erreurs que le schéma rejette et que l'appli signale autrement (limites et budget : voir outils/verifier.js)
const erreursSchemaSeul = [
  ['quantité d’effet au-delà du maximum', 'generique', d => { d.atouts[0].effets[0] = { pre: 'maint', qte: 5 }; }]
];
const copie = o => JSON.parse(JSON.stringify(o));
const bases = { minimal, generique };
module.exports = { minimal, generique, erreurs, erreursSchemaSeul, bases, copie };
