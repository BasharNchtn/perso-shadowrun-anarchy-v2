# Générer un fichier de personnage (JSON) : guide pour un programme ou une IA

Ce guide explique comment produire un fichier `.json` que l'application de création de personnages Shadowrun Anarchy 2.0 ouvre sans problème. Il vaut pour un PJ comme pour un PNJ : le format est le même.

## 1. Quoi lire, dans quel ordre

| Fichier | Rôle |
|---|---|
| ce guide | principes, exemple, valeurs permises, erreurs fréquentes |
| [`format_pj_v2.md`](format_pj_v2.md) | le détail de chaque champ |
| [`releve_regles_creation.md`](releve_regles_creation.md) | les règles de jeu : coûts en nuyens, limites, effets |
| [`tests/exemples/`](tests/exemples) | quatre personnages complets, un de chaque type d'atout |
| [`format_pj_v2.schema.json`](format_pj_v2.schema.json) | le même format, lisible par une machine (validation) |

Pour une IA sans accès aux fichiers : ce guide, `format_pj_v2.md`, `releve_regles_creation.md` et un exemple (`ex_adepte.json`) suffisent.

## 2. Principes

- **Seul `"format": "anarchy-pj"` est obligatoire.** L'application complète tout le reste : les 16 compétences officielles, les `id`, les niveaux de base et la perte d'Essence des atouts, le niveau des effets prédéfinis et des bonus.
- **Le fichier ne contient que des choix, jamais de valeur calculée** : pas de réserve de dés (RD), de seuil, de coût, de nuyens restants, d'Essence ni de seuils de blessures. Tout cela est recalculé à l'ouverture.
- UTF-8, accents exacts. Les valeurs de listes sont sensibles à la casse (`Dés`, `OK`, `Équipement`).
- Les nombres sont de vrais nombres (`3`, pas `"3"`).
- Les listes vides peuvent être omises. Un élément peut omettre `actif` (actif par défaut).

## 3. Exemples

Fichier minimal (un personnage vide, valide) :

```json
{ "format": "anarchy-pj" }
```

Personnage complet, de niveau Runner, sans aucune valeur calculée :

```json
{
  "format": "anarchy-pj",
  "identite": {
    "pseudo": "Corbeau",
    "metatype": "Humain",
    "train_de_vie": "Train de vie bas",
    "mots_cles": ["Rue", "Cambrioleur", "Ancien livreur"],
    "repliques": ["Je n'ai rien vu, rien pris."],
    "comportements": ["Méfiant avec les inconnus"]
  },
  "niveau_de_jeu": {
    "nom": "Runner", "nuyens": 375000, "nb_attributs_max": 1,
    "indice_max_competence": 5, "rr_max_competence": 1, "rr_max_specialisation": 2
  },
  "attributs": { "force": 2, "agilite": 4, "volonte": 3, "logique": 3, "charisme": 2 },
  "competences": [
    { "nom": "Furtivité", "indice": 4, "specialites": [{ "nom": "discrétion physique", "attribut": "agilite" }] },
    { "nom": "Armes à distance", "indice": 3, "specialites": [{ "nom": "pistolets", "attribut": "agilite" }] },
    { "nom": "Électronique", "indice": 3 },
    { "nom": "Perception", "indice": 3 },
    { "nom": "Athlétisme", "indice": 2 }
  ],
  "connaissances": [{ "nom": "Quartiers chauds" }],
  "contacts": [{ "nom": "Doc Mei", "type": "Médecin de rue", "description": "Soigne sans poser de questions." }],
  "atouts": [
    { "type": "Cyberware", "nom": "Yeux cybernétiques",
      "effets": [{ "pre": "nar", "qte": 1, "texte": "Vision thermographique et zoom" }] },
    { "type": "Trait", "nom": "Discret",
      "effets": [{ "bonus": { "type": "rr", "competence": "Furtivité", "specialisation": "discrétion physique", "valeur": 1 } }] },
    { "type": "Équipement", "ref": "arme1", "nom": "Pistolet léger",
      "effets": [{ "bonus": { "type": "vd", "cible": "Pistolet léger", "valeur": 1 } }] },
    { "type": "Contact", "nom": "Doc Mei" }
  ],
  "armes": [
    { "id": "arme1", "nom": "Pistolet léger", "categorie": "arme", "type_arme": "leger", "specialisation": "pistolets" }
  ],
  "armures": [{ "nom": "Veste doublée", "valeur": 1 }],
  "equipement": [{ "nom": "Commlink" }, { "nom": "Kit de crochetage" }]
}
```

## 4. Liens entre éléments (`id`)

Les `id` sont facultatifs, sauf pour relier deux éléments. Un atout de type `Équipement` améliore une arme, une armure ou un équipement : son `ref` contient l'`id` de cet élément et son nom suit le sien (voir l'exemple ci-dessus : `"ref": "arme1"`). De même, une arme montée sur un véhicule, un drone ou un cyberdeck porte `monte_ref` (l'`id` de l'atout porteur) et `monte_sur` (son nom).

```json
{ "id": "veh1", "type": "Véhicule", "nom": "Pick-up blindé", "vehicule": { "modele": "suv" } }
{ "nom": "Mitrailleuse du pick-up", "categorie": "arme", "type_arme": "mitrailleuse", "specialisation": "armes montées", "monte_ref": "veh1", "monte_sur": "Pick-up blindé" }
```

Un `id` est une chaîne quelconque, unique dans le fichier (l'application en crée d'aléatoires de 6 caractères).

## 5. Règles de jeu que l'application contrôle à l'ouverture

Ces contrôles ne font pas partie du format : un fichier peut être bien formé et pourtant dépasser les règles. L'application (et `outils/verifier.js`) les signalent :

1. **Budget** : le total des coûts ne dépasse pas les nuyens du niveau de jeu. Les coûts sont décrits dans `releve_regles_creation.md` (attributs, compétences, spécialisations, connaissances, atouts à 5 000 ¥ par niveau, armes, sorts, armures, équipement).
2. **Limites du niveau de jeu** : nombre d'attributs au maximum du métatype, indice maximal d'une compétence, RR maximaux.
3. **Attributs** dans le maximum du métatype.
4. **Essence** non négative (cyberware et bioware en consomment).
5. **Effets** : la `qte` d'un effet prédéfini ne dépasse pas son maximum, et certains effets sont réservés à des types d'atouts (voir la liste ci-dessous).

## 6. Valeurs permises

<!-- debut:valeurs-permises (généré par npm run schema : ne pas modifier à la main) -->

### Niveaux de jeu (`niveau_de_jeu.nom`)

| Niveau | `nuyens` | `nb_attributs_max` | `indice_max_competence` | `rr_max_competence` | `rr_max_specialisation` |
|---|---|---|---|---|---|
| Rue | 300 000 | 0 | 4 | 1 | 1 |
| Runner | 375 000 | 1 | 5 | 1 | 2 |
| Élite | 450 000 | 2 | 6 | 2 | 2 |
| Choix | libre | libre | libre | libre | libre |

Avec `Choix`, ces cinq limites sont saisies à la main dans `niveau_de_jeu`. L'indice d'une compétence ne dépasse jamais 8.

### Attributs et métatypes

Clés de `attributs` : `force`, `agilite`, `volonte`, `logique`, `charisme`.

| `metatype` | force | agilite | volonte | logique | charisme |
|---|---|---|---|---|---|
| Humain | 4 | 4 | 4 | 4 | 4 |
| Elfe | 4 | 4 | 4 | 4 | 5 |
| Nain | 4 | 4 | 5 | 4 | 4 |
| Ork | 5 | 4 | 4 | 4 | 4 |
| Troll | 6 | 4 | 4 | 4 | 4 |

Maximum par attribut selon le métatype (un métatype hors de cette liste exige `attributs_max`).

### Compétences et spécialisations

Noms exacts (accents compris). Entre parenthèses : l'attribut par défaut. Une compétence ou spécialisation hors de cette liste exige `"perso": true`.

- **Armes à distance** (agilite) : armes de jet, armes de trait, armes lourdes, armes montées, fusils, lance-grenades, mitraillettes, pistolets
- **Athlétisme** (force) : course, défense à distance (agilite), escalade, natation, parkour (agilite)
- **Combat rapproché** (agilite) : armes contondantes, combat astral (volonte), défense, lames, arme exotique, mains nues
- **Conjuration** (logique) : bannissement, esprits des aînés, esprits de l'air, esprits des bêtes, esprits de l'eau, esprits du feu, esprits des plantes, esprits de la terre
- **Électronique** (logique) : appareils personnels, protection matricielle, recherche matricielle
- **Enchantement** (volonte) : dissipation, s. de combat, s. de détection, s. d'illusion, s. de manipulation, s. de santé
- **Furtivité** (agilite) : crochetage, discrétion astrale, discrétion matricielle (logique), discrétion physique, escamotage
- **Influence** (charisme) : bluff, étiquette, imposture, intimidation, négociation
- **Ingénierie** (logique) : armes contrôlées à distance, C&R appareils électroniques, C&R drones, C&R engins mécaniques, C&R implants cybernétiques, C&R véhicules, explosifs, guerre électronique
- **Perception** (logique) : astrale, matricielle, physique, sociale
- **Pilotage** (agilite) : camions, drones aquatiques, drones terrestres, drones volants, motos, véhicules aquatiques, véhicules volants, voitures
- **Piratage** (logique) : backdoor, cybercombat (volonte), force brute
- **Réseau** (charisme) : corporatiste, criminel, la rue, gouvernemental, ingénierie, magique, matriciel, médiatique, médical, universitaire
- **Sorcellerie** (volonte) : contresort, sorts de combat, sorts de détection, sorts d'illusion, sorts de manipulation, sorts de santé
- **Survie** (logique) : dressage (charisme), orientation, milieu hostile, premiers soins, sang-froid (volonte)
- **Technomancie** (logique) : compilation, décompilation, formes complexes

### Types d'atouts (`atouts[].type`)

| Type | `niveau_base` | `perte_essence` |
|---|---|---|
| Éveil | 1 | 0 |
| Cyberware | 1 | 1 |
| Bioware | 2 | 0.5 |
| Pouvoir d'adepte | 1 | 0 |
| Équipement | 0 | 0 |
| Cyberdeck | 1 | 0 |
| Véhicule | 1 | 0 |
| Drone | 1 | 0 |
| Contact | 0 | 0 |
| Trait | 0 | 0 |
| Initiation (magie) | 3 | 0 |

Un autre type exige `"type_perso": true` (alors `niveau_base` et `perte_essence` sont saisis). Ces deux valeurs sont fixées par l'appli pour les types de la liste.

### Effets d'atouts

Un effet a l'une de ces trois formes : `{"pre": "<code>", "qte": 1}` (effet prédéfini), `{"bonus": {...}}` (bonus typé) ou `{"texte": "...", "niveau": 2}` (effet personnalisé, coût saisi). Le niveau des deux premières formes est calculé par l'appli.

Effets prédéfinis (`pre`) :

| Code | Effet | Niveaux par unité | `qte` max | Réservé aux types |
|---|---|---|---|---|
| `ip1` | Initiative physique +1 | 2 | 1 | tous |
| `ip2` | Initiative physique +2 | 5 | 1 | tous |
| `ip3` | Initiative physique +3 | 7 | 1 | tous |
| `ia1` | Initiative astrale/matricielle +1 | 1 | 1 | tous |
| `ia2` | Initiative astrale/matricielle +2 | 3 | 1 | tous |
| `ia3` | Initiative astrale/matricielle +3 | 4 | 1 | tous |
| `maint` | Sort maintenu supplémentaire | 2 | 2 | tous |
| `esp` | Esprit supplémentaire | 3 | 1 | tous |
| `foc` | Focus d’arme | 1 | 1 | tous |
| `cold` | RV Cold-sim | 1 | 1 | tous |
| `hot` | RV Cold-sim et Hot-sim | 3 | 1 | tous |
| `fw` | Firewall | 1 | 5 | Cyberdeck, Cyberware, Équipement |
| `att` | Attaque | 1 | 5 | Cyberdeck |
| `int` | Équipement intégré | 1 | 1 | tous |
| `nar` | Effet narratif | 1 | 1 | tous |
| `vap` | Autopilote | 1 | 6 | Véhicule, Drone |
| `vman` | Maniabilité | 1 | 3 | Véhicule, Drone |
| `vvit` | Vitesse | 1 | 3 | Véhicule, Drone |
| `vbl` | Blindage | 1 | structure | Véhicule, Drone |
| `vvol` | Volant | 1 | 1 | Véhicule, Drone |
| `drn` | Drone supplémentaire identique | 2 | 3 | Drone |
| `mnt` | Monture d’arme supplémentaire | 1 | 6 | Véhicule, Drone |
| `mam` | Amélioration de monture d’arme | 1 | 6 | Véhicule, Drone |

Effet narratif (`nar`) : le champ `texte` décrit l'effet (conservé tel quel). Le premier effet `nar` d'un atout de type Trait, Cyberware, Bioware, Pouvoir d'adepte est **inclus sans coût** (niveau 0) ; tout autre effet narratif coûte 1 niveau.

Bonus typés (`bonus.type`) et leur coût :

- `rr` avec `specialisation` : RR sur une spécialisation (2 par RR, max 3)
- `rr` sans `specialisation` (RR de compétence) : RR sur une compétence (5 par RR, max 1)
- `rr_attribut` : RR sur un attribut (10 par RR, max 1)
- `vd` : VD + (1 par +1, max 2)
- `armure` : Armure + (1 par +1, max 1 ; tous dommages 2)
- `case` : Case de blessure supplémentaire (légère 3, grave 6, max 1 chacune)
- `portee` : Portée d’une arme (2 par changement : – → Dés ou Dés → OK)

Champs des bonus : `rr` → `competence`, `specialisation` (ou `null`), `valeur` ; `rr_attribut` → `attribut`, `valeur` ; `vd` → `cible` (nom d'une arme ou d'une spécialisation), `valeur` ; `armure` → `portee` (`physique`, `mental` ou `tous`), `valeur` ; `case` → `gravite` (`legere`, `grave` ou `incap`), `valeur` ; `portee` → `cible`, `rang` (`Contact`, `Courte`, `Moyenne` ou `Longue`), `valeur`.

### Armes (`armes[].type_arme`, catégories `arme` et `arme_specialiste`)

Le type fixe la VD, les portées et la spécialisation : ne pas les écrire. Portées : `OK`, `Dés`, `-` (impossible), dans l'ordre ≤ 2 m, 3-15 m, 16-60 m, > 60 m.

| `type_arme` | Type | VD | Portées | Spécialisation |
|---|---|---|---|---|
| `nues` | Mains nues | FOR | OK / - / - / - | mains nues |
| `injecteur` | Injecteur | toxine | OK / - / - / - | mains nues |
| `courtes` | Armes courtes | FOR+1 | OK / - / - / - | lames, armes contondantes, mains nues |
| `longues` | Armes longues | FOR+2 | OK / - / - / - | lames, armes contondantes |
| `contact+` | Armes de contact avancées | 5 | OK / - / - / - | lames |
| `jet` | Armes de jet | FOR+1 | OK / OK / Dés / - | armes de jet |
| `arc` | Arcs | FOR+1 | OK / OK / OK / - | armes de trait |
| `arbalete` | Arbalètes | 4 | OK / OK / OK / - | armes de trait |
| `taser` | Tasers | 5 | OK / OK / - / - | pistolets |
| `poche` | Pistolets de poche | 3 | OK / OK / Dés / - | pistolets |
| `leger` | Pistolets légers | 4 | OK / OK / Dés / - | pistolets |
| `auto` | Pistolets automatiques | 4 | OK / OK / Dés / - | pistolets |
| `lourd` | Pistolets lourds | 5 | OK / OK / Dés / - | pistolets |
| `mitraillette` | Mitraillettes | 5 | Dés / OK / OK / - | mitraillettes |
| `assaut` | Fusils d’assaut | 7 | Dés / OK / OK / Dés | fusils |
| `shotgun` | Shotguns | 8 | Dés / OK / Dés / - | fusils |
| `precision` | Fusils de précision | 10 | - / Dés / Dés / OK | fusils |
| `mitrailleuse` | Mitrailleuses | 9 | - / OK / OK / OK | armes lourdes |
| `grenade` | Grenades | 7 | OK / OK / Dés / - | armes de jet |
| `gaz` | Grenades à gaz | toxine | OK / OK / Dés / - | armes de jet |
| `lgrenade` | Lance-grenades | 7 | - / Dés / OK / OK | lance-grenades |
| `roquette` | Lance-roquettes | 12 | - / - / Dés / OK | armes lourdes |

Sans `type_arme`, l'arme est entièrement libre : `vd` (nombre ou texte comme `"FOR+2"`) et `portees` (4 valeurs) sont alors obligatoires.

### Sorts et formes complexes

Catégorie `sort` : `type_sort` parmi `combat`, `détection`, `illusion`, `manipulation`, `santé`, plus `seuil`, `description`, `aire`, `taille`. Catégorie `forme_complexe` : `seuil`, `description`.

### Véhicules et drones (`atouts[].vehicule.modele`)

Atout de type `Véhicule` : `moto-course` (Moto de course), `moto-tt` (Moto tout-terrain), `chopper` (Chopper), `sport` (Voiture de sport), `berline` (Berline), `suv` (SUV / Pick-up), `van` (Van), `bus` (Bus / semi-remorque).

Atout de type `Drone` : `micro` (Microdrone), `mini` (Minidrone), `petit` (Petit drone), `moyen` (Drone moyen), `grand` (Grand drone).

Structure, maniabilité et vitesse viennent du modèle ; les modifier passe par des effets. `"perso"` permet un modèle libre.

<!-- fin:valeurs-permises -->

## 7. Erreurs fréquentes

- **Type d'atout mal orthographié** (« Cyberwear ») : l'application le traite comme un type personnalisé, sans le refuser. Elle le signale dans une bannière, mais le coût et l'Essence sont faux.
- **Compétence ou spécialisation hors catalogue** sans `"perso": true`.
- **Portées en minuscules** (`ok`) ou une liste de longueur différente de 4.
- **Nombre écrit en texte** (`"3"`).
- **Champ calculé stocké** (`rd`, `cout`, `essence`…) : champ inconnu, ignoré.
- **Lien rompu** : `ref` ou `monte_ref` qui ne correspond à aucun `id`.
- **Atout `Véhicule` ou `Drone` sans `vehicule`**, ou `vehicule` sur un autre type d'atout.
- **Effet réservé à un autre type d'atout** (Firewall sur un Trait, par exemple) ou `qte` au-delà du maximum.
- **VD et portées écrites sur une arme qui a un `type_arme`** : elles sont fixées par le type.
- **Oublier qu'un `Équipement` ne crée pas l'objet** : l'arme, l'armure ou l'équipement lié doit exister dans `armes`, `armures` ou `equipement`.

## 8. Valider un fichier

1. **`node outils/verifier.js mon_fichier.json`** (après `npm install`) : ouvre le fichier avec les vraies règles de l'application et affiche les anomalies, les limites dépassées, le budget dépensé et restant, et l'Essence. Code de sortie 0 si tout est valide, 1 s'il reste des points à corriger, 2 si le fichier est illisible. Option `--json` pour une sortie lisible par un programme ; `-` lit l'entrée standard.
2. **Le schéma** (forme et valeurs, mais pas le budget) : `npx ajv-cli validate --spec=draft2020 -s format_pj_v2.schema.json -d mon_fichier.json`.
3. **L'application elle-même** : une bannière orange liste les anomalies à l'ouverture, et le panneau de création affiche le budget et les limites.

## 9. Consigne type pour une IA

> Génère un personnage Shadowrun Anarchy 2.0 de niveau Runner : un decker elfe, discret, avec un drone. Réponds uniquement par un fichier JSON conforme à `format_pj_v2.md` et à `generer_un_personnage.md`. Ne mets que des choix (jamais de valeur calculée), utilise uniquement les valeurs de la section « Valeurs permises », respecte le budget de 375 000 nuyens et les limites du niveau Runner, puis vérifie le résultat avec `node outils/verifier.js` et corrige jusqu'à ce qu'il soit valide.
