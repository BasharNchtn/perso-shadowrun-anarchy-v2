# Format JSON `anarchy-pj` v2

Source de vérité d'un personnage pour l'application autonome `index.html` (onglets Création et Fiche). Les règles et les coûts sont décrits dans `releve_regles_creation.md`.

Principes :
- Le JSON contient **ce qui est saisi**, jamais ce qui se calcule (réserves de dés, seuils, RR cumulés, coûts, Essence, nuyens restants). Aucun champ calculé n'est enregistré.
- Chaque élément ajoutable a un champ **`actif`** : à `false`, il est grisé dans la création, n'est pas compté dans les coûts et n'apparaît pas sur la fiche, mais ses valeurs sont conservées.
- Les nombres sont de vrais nombres JSON. Les niveaux d'atout sont des entiers.
- Les armes, armures, équipements et atouts ont un **`id`** (texte court généré par l'application). Il sert à les relier entre eux : renommer un élément ne casse pas les liens.

---

## Racine

| Clé | Type | Contenu |
|---|---|---|
| `format`, `version` | texte, entier | `"anarchy-pj"`, `2` : version du format. L'application refuse une version supérieure à la sienne ; une version absente est lue comme la version actuelle |
| `identite` | objet | voir ci-dessous |
| `niveau_de_jeu` | objet | voir ci-dessous |
| `gains` | nombre | somme globale des gains, en nuyens, saisie à la main |
| `attributs` | objet | `force`, `agilite`, `volonte`, `logique`, `charisme` |
| `attributs_max` | objet ou `null` | `null` : maximums du métatype ; sinon un maximum par attribut (métatype personnalisé) |
| `competences` | liste | voir « Compétences » |
| `connaissances` | liste | `{ nom, actif }` |
| `atouts` | liste | voir « Atouts » (inclut véhicules, drones, cyberdecks, contacts) |
| `armes` | liste | armes, sorts et formes complexes (voir « Armes, sorts, formes complexes ») |
| `armures` | liste | `{ id, nom, valeur, actif }` : `valeur` = points d'armure |
| `equipement` | liste | `{ id, nom, actif, offert, description? }` |
| `contacts` | liste | `{ nom, type, description, actif }` |

### `identite`
`pseudo`, `nom`, `metatype` (Humain, Elfe, Nain, Ork, Troll ou texte libre), `train_de_vie`, `mots_cles` (liste de textes), `repliques` (liste), `comportements` (liste), `naissance`, `taille`, `poids`, `particularites`.
Portrait : `portrait` (image JPEG en data URL, format 3:4), `portrait_x` et `portrait_y` (cadrage en %, 0 à 100, défaut 50), `portrait_zoom` (100 à 300, défaut 100), `portrait_ratio` (largeur / hauteur de l'image, sert à griser le décalage inutile).
Les points d'Anarchy ne sont pas stockés : 4 pour un Humain, 3 sinon.

### `niveau_de_jeu`
`nom` (`Rue`, `Runner`, `Élite` ou `Choix`), `limites_actives` (booléen, `true` par défaut : à `false`, le tableau des limites affiche seulement les valeurs actuelles), `nuyens` (nuyens de départ), `nb_attributs_max`, `indice_max_competence`, `rr_max_competence`, `rr_max_specialisation`.

---

## Compétences

```json
{ "nom": "Combat rapproché", "actif": true, "attribut": "agilite", "indice": 5,
  "specialites": [ { "nom": "arme exotique", "detail": "fouet", "actif": true, "attribut": "agilite" } ] }
```

- Les 16 compétences officielles sont toujours présentes. Sur la fiche, les générales apparaissent même à 0 ; les quatre spécifiques (Conjuration, Sorcellerie, Enchantement, Technomancie) seulement si `actif`.
- `perso: true` (compétence ou spécialisation) : nom saisi librement, absent de la liste officielle.
- Une spécialisation n'a pas d'indice : elle vaut l'indice de la compétence + 2, avec son propre attribut.
- `detail` : réservé à la spécialisation « arme exotique », qu'on peut prendre plusieurs fois (un `detail` différent par ligne : fouet, tronçonneuse…). Son nom complet est `arme exotique (fouet)`.
- Le RR n'est pas stocké : il vient des effets d'atouts.

---

## Atouts

```json
{ "id": "a1b2c3", "type": "Trait", "nom": "indomptable", "actif": true, "niveau_base": 3,
  "effets": [ { "texte": "Armure mentale +1", "niveau": 1,
                "bonus": { "type": "armure", "portee": "mental", "valeur": 1 } } ] }
```

- `type` : Éveil, Cyberware, Bioware, Pouvoir d'adepte, Équipement, Cyberdeck, Véhicule, Drone, Contact, Trait, Initiation (magie), ou texte libre (`type_perso: true`).
- `niveau_base` et `perte_essence` sont fixés par le type (voir les règles), sauf pour Éveil, Trait et les types personnalisés.
- **Niveau de l'atout** = `niveau_base` + somme des `niveau` de ses effets. Coût : 5 000 ¥ par niveau.
- **Atout de type Équipement** : `ref` = `id` de l'arme, de l'armure ou de l'équipement auquel il se rattache ; `nom` suit alors le nom de cet élément. Un bonus de VD ou de portée n'agit alors que sur l'arme liée (le champ `cible` est ignoré).
- **Atout de type Contact** : rattaché au contact de même nom (RR et effets affichés sur le contact).
- **Cyberdeck** : `programmes` (liste de textes, 5 lignes minimum sur la fiche). Base : Firewall 1, Attaque 0 ; les points en plus viennent des effets `fw` et `att`.
- **Véhicule, drone** : objet `vehicule` (voir plus bas).

### Effets (`effets`)

Un effet est de l'un des trois types suivants.

1. **Bonus typé** : `{ texte, niveau, bonus }`. Le `niveau` est calculé par l'application à partir du bonus.

| `bonus.type` | Champs | Effet | Niveaux |
|---|---|---|---|
| `rr` | `competence`, `specialisation` (ou `null`), `valeur`, `perso_comp?`, `perso_spec?` | RR sur une compétence ou une spécialisation (même non possédée : ligne « sans +2 » sous la compétence) | 5 par RR (compétence), 2 par RR (spécialisation) |
| `rr_attribut` | `attribut`, `valeur` | RR sur toutes les compétences et spécialisations de cet attribut | 10 par RR |
| `vd` | `cible` (nom d'arme ou spécialisation), `valeur` | +VD | 1 par point |
| `armure` | `portee` (`physique`, `mental`, `tous`), `valeur` | s'ajoute aux seuils de blessure | 1 par point (2 pour `tous`) |
| `case` | `gravite` (`legere`, `grave`, `incap`), `valeur` | case de blessure en plus | 3 (légère), 6 (grave) |
| `portee` | `cible` (arme), `rang` (`Contact`, `Courte`, `Moyenne`, `Longue`), `valeur` | améliore une portée d'un cran (– → Dés ou Dés → OK) | 2 par changement |

2. **Effet prédéfini** : `{ pre, qte, texte, niveau }`. `qte` (1 par défaut) multiplie le coût unitaire.

| `pre` | Effet | Niveaux | Maximum par atout |
|---|---|---|---|
| `ip1`, `ip2`, `ip3` | Initiative physique niveaux 1, 2, 3 | 2, 5, 7 | |
| `ia1`, `ia2`, `ia3` | Initiative astrale ou matricielle niveaux 1, 2, 3 | 1, 3, 4 | |
| `maint` | Sort maintenu supplémentaire | 2 par sort | 2 |
| `esp` | Esprit invoqué supplémentaire | 3 | 1 |
| `foc` | Focus d'arme (narratif) | 1 | |
| `cold`, `hot` | RV Cold-sim, RV Cold-sim et Hot-sim | 1, 3 | |
| `fw` | Firewall +1 (cyberdeck, cyberware, équipement) | 1 par point | 5 |
| `att` | Attaque +1 (cyberdeck) | 1 par point | 5 |
| `int` | Équipement intégré | 1 (+ coût de l'équipement) | |
| `nar` | Effet narratif | 1 | |
| `vap`, `vman`, `vvit`, `vbl` | Autopilote, maniabilité, vitesse, blindage +1 (véhicule, drone) | 1 par point | +6, +3, +3, structure |
| `vvol` | Volant (véhicule, drone) | 1 | 1 |
| `drn` | Drone supplémentaire identique (drone) | 2 | 3 |
| `mnt` | Monture d'arme supplémentaire (véhicule, drone) | 1 | |
| `mam` | Amélioration de monture d'arme (véhicule, drone) | 1 par amélioration | |

3. **Effet personnalisé** : `{ texte, niveau }`, sans `bonus` ni `pre`. Le niveau est saisi à la main (négatif possible). C'est le seul effet dont le coût est libre.

Plafonds : VD +2, armure +1, RR sur attribut 1, RR sur compétence 1, RR sur spécialisation 3, case de blessure 1 de chaque gravité, portée : 2 changements par portée. Un dépassement est signalé dans le panneau Limites. Sur la fiche, un RR cumulé (attribut + compétence + spécialisation) ne dépasse jamais 3.

### `vehicule` (atouts Véhicule et Drone)

```json
{ "modele": "chopper", "micro": false, "base": { "structure": 5, "maniabilite": 2, "vitesse": 5 } }
```

- `modele` : `micro`, `mini`, `petit`, `moyen`, `grand` (drones) ; `moto-course`, `moto-tt`, `chopper`, `sport`, `berline`, `suv`, `van`, `bus` (véhicules) ; `perso` (valeurs de base saisies, structure + maniabilité + vitesse = 12, ou 10 si `micro`). Un atout Drone ne propose que les types de drones, un atout Véhicule que les types de véhicules.
- Pour un type officiel, `base` et `micro` sont imposés par le type.
- Indices finaux : autopilote 6 + effets `vap` ; maniabilité et vitesse = base + effets `vman` et `vvit` ; blindage = effets `vbl` ; la structure ne s'améliore pas. Avec l'effet `vvol`, la vitesse de base est doublée (microdrone à vitesse 0 : 1).
- Moniteur : Structure + Blindage, 2 × Structure + Blindage, 3 × Structure + Blindage.

---

## Armes, sorts, formes complexes

Tous : `id`, `nom`, `actif`, `categorie` (`arme`, `arme_specialiste`, `sort`, `forme_complexe`).

**Armes** (`arme`, `arme_specialiste`) :

```json
{ "id": "k9x2ab", "nom": "AK 97", "actif": true, "categorie": "arme", "type_arme": "assaut",
  "vd": 7, "portees": ["Dés", "OK", "OK", "Dés"], "specialisation": "armes montées",
  "monte_ref": "p4q7zz", "monte_sur": "MCT roto-drone" }
```

- `type_arme` : `nues`, `injecteur`, `courtes`, `longues`, `contact+`, `jet`, `arc`, `arbalete`, `taser`, `poche`, `leger`, `auto`, `lourd`, `mitraillette`, `assaut`, `shotgun`, `precision`, `mitrailleuse`, `grenade`, `gaz`, `lgrenade`, `roquette`. Le type fixe `vd`, `portees` et la spécialisation par défaut. Sans `type_arme`, ces champs sont saisis à la main.
- `vd` : un nombre ou une expression (`"FOR+2"`). Les portées sont Contact, Courte, Moyenne, Longue : `OK`, `Dés` ou `-`.
- `specialisation` : dans la famille de l'arme (mêlée, arme à feu, jet et trait), ou `arme exotique (fouet)` si cette spécialisation est prise, ou `armes montées`.
- `toxine` (booléen, armes à feu, jet, trait ; toujours vrai pour `gaz` et `injecteur`) : la VD est remplacée par une toxine décrite dans `description` (texte sur plusieurs lignes).
- `monte_ref` (`id` de l'atout Véhicule, Drone ou Cyberdeck porteur) et `monte_sur` (son nom, recopié) : présents seulement si la spécialisation est `armes montées`.
- Les bonus de VD et de portée viennent d'un atout Équipement lié à l'arme.
- La ligne « Mains nues » est ajoutée par l'application (VD = Force, portées `OK/-/-/-`).

**Sorts** (`sort`) : `type_sort` (`combat`, `détection`, `illusion`, `manipulation`, `santé`), `seuil` (texte libre), `description` (plusieurs lignes), `aire` et `taille` (booléens : le seuil dépend de l'aire ou de la taille ; la fiche ajoute un exposant « a » ou « t » et la règle correspondante).

**Formes complexes** (`forme_complexe`) : `seuil`, `description`.

---

## Valeurs calculées (jamais stockées)

| Valeur | Règle (détail dans `releve_regles_creation.md`) |
|---|---|
| Coûts | attribut, compétence, spécialisation, connaissance, atout (5 000 par niveau), arme, sort, armure (2 500 par point), équipement (2 500 par ligne, sauf `offert`) |
| Disponible | `niveau_de_jeu.nuyens + gains` |
| Réserve de dés | indice + attribut ; spécialisation possédée : indice + 2 + son attribut |
| Seuils de blessure | légère, grave, incapacitante = base, +3, +6 (Force, Force + armure, Volonté ; véhicules et cyberdecks : voir les règles) |
| Essence | 6 − pertes d'Essence des atouts |
