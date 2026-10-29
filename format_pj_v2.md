# Format JSON `anarchy-pj` v2

Source de vérité d'un personnage, pour l'application autonome (onglets Création et Fiche).
Produit pour l'instant par `ExportPJ.gs` à partir de la feuille FicheSRA2. Exemple : `pj_Marsy.json`.

Principes :
- Le JSON contient **ce qui est saisi**, jamais ce qui se calcule (réserves de dés, seuils de blessure, RR totaux, coûts, essence, nuyens restants).
- Chaque élément ajoutable a un champ **`actif`** : s'il est `false`, l'élément est grisé dans la création, **n'est pas compté** dans les coûts et **n'apparaît pas** sur la fiche, mais ses valeurs restent conservées.
- Les nombres sont de vrais nombres JSON.

---

## Racine

| Clé | Type | Contenu |
|---|---|---|
| `format`, `version` | string, int | `"anarchy-pj"`, `2` |
| `identite` | objet | voir ci-dessous |
| `niveau_de_jeu` | objet | limites choisies par le MJ : `nom`, `nuyens`, `nb_attributs_max`, `indice_max_competence`, `rr_max_competence`, `rr_max_specialisation` |
| `gains` | nombre | somme globale des gains, en nuyens, mise à jour à la main (pas de karma séparé) |
| `attributs` | objet | `force`, `agilite`, `volonte`, `logique`, `charisme` |
| `attributs_max` | objet ou `null` | `null` = maximums du métatype ; sinon valeurs personnalisées pour chaque attribut |
| `competences` | liste | voir ci-dessous |
| `connaissances` | liste | `{ nom, actif }` : texte libre |
| `atouts` | liste | voir ci-dessous (inclut véhicules, drones, cyberdecks) |
| `armes` | liste | armes, sorts et formes complexes |
| `armure` | objet | `{ nom, valeur, actif }` |
| `equipement` | liste | `{ nom, actif, offert }` |

### `identite`
`pseudo`, `nom`, `metatype` (Humain, Elfe, Nain, Ork, Troll, ou personnalisé), `train_de_vie`, `mots_cles` (liste de textes libres : statut social, origine, rôle… au choix ; le métatype et le train de vie sont aussi des mots-clés), `repliques` (liste de textes), `comportements` (liste de textes).
Facultatifs, à compléter : `naissance` (date de naissance), `taille`, `poids`, `particularites`, `portrait`.
Les points d'Anarchy ne sont pas stockés : 4 pour un Humain, 3 sinon.

---

## Compétences

```json
{ "nom": "Athlétisme", "actif": true, "attribut": "force", "indice": 3,
  "specialites": [ { "nom": "défense à distance", "actif": true, "attribut": "agilite" } ] }
```

- `perso: true` (compétence ou spécialisation) : nom absent de la liste officielle, saisi librement.
- Une spécialisation n'a pas d'indice : elle vaut **indice de la compétence + 2**, avec son propre attribut.
- Le RR n'est pas stocké : il vient des effets d'atouts (`bonus.type = "rr"`).

---

## Atouts, véhicules, drones, cyberdecks

```json
{ "type": "Trait", "nom": "indomptable", "actif": true, "niveau_base": 3,
  "effets": [ { "texte": "Armure mentale +1", "niveau": 1,
                "bonus": { "type": "armure", "portee": "mental", "valeur": 1 } } ] }
```

- **Niveau de l'atout** = `niveau_base` + somme des `niveau` de ses effets. Un niveau peut être négatif (malus) ou fractionnaire (0,5). Coût : 5 000 par niveau.
- `type` : Éveil, Cyberware, Bioware, Pouvoir d'adepte, Équipement, Cyberdeck, Véhicule, Drone, Contact, Trait, Initiation (magie), ou texte libre.
- `perte_essence` (sur l'atout ou un effet, facultatif) : retirée des 6 points d'Essence.
- `stats` (véhicule, drone, cyberdeck) : `autopilote`, `structure`, `maniabilite`, `vitesse`, `blindage` ; `firewall`, `attaque`. Les effets qui portent ces valeurs ont `"stat": true`. Elles ne s'affichent pas en notes.
- Un effet sans `bonus` est un texte libre (effet narratif).

### Bonus typés

| `type` | Champs | Effet |
|---|---|---|
| `rr` | `competence`, `specialisation` (ou `null`), `valeur` | ajoute des points de RR à la compétence, ou à la spécialisation (même non possédée : ligne « sans +2 », indice de la compétence) |
| `vd` | `cible` (nom d'arme, ou spécialisation comme « mains nues »), `valeur` | +VD aux armes concernées |
| `armure` | `portee` (`physique`, `mental`, `tous`), `valeur` | s'ajoute aux seuils de blessure |
| `case` | `gravite` (`legere`, `grave`, `incap`), `valeur` | case de blessure supplémentaire |

---

## Armes, sorts, formes complexes

```json
{ "nom": "AK 97", "actif": true, "categorie": "arme", "vd": 7,
  "portees": ["Dés", "OK", "OK", "Dés"], "monte_sur": "moto Harley Davidson Scorpion" }
```

- `categorie` : `arme` (2 500), `arme_specialiste` (5 000), `sort` (5 000), `forme_complexe` (5 000).
- `vd` : un nombre (`7`) ou une expression avec attributs (`"FOR+2"`).
- `portees` : Contact, Courte, Moyenne, Longue ; valeurs `OK`, `Dés`, `-`.
- `specialisation` (facultatif) : spécialisation liée, pour recevoir les bonus de VD (« mains nues », « lames »).
- `monte_sur` (facultatif) : `nom` du véhicule, drone ou cyberdeck qui porte l'arme.
- La ligne « Mains nues » est ajoutée par l'application (VD = Force, portées `OK/-/-/-`).

---

## Règles de calcul (rappel : voir `releve_regles_creation.md`)

| Valeur | Règle |
|---|---|
| Attribut | `v × 10 000`, ou `20 000 + (v − 1) × 10 000` s'il atteint le maximum |
| Compétence | `i × 2 500` jusqu'à 5, puis `12 500 + (i − 5) × 5 000` ; spécialisation 2 500 |
| Connaissance | 2 500 |
| Atout | 5 000 par niveau |
| Armure | 2 500 par point |
| Équipement | 2 500 par ligne, sauf `offert` |
| Disponible | `niveau_de_jeu.nuyens + gains` |

Sur la fiche de Marsy, ce format redonne exactement les montants de la feuille (410 000 dépensés, 0 restant).

---

## Migration depuis la feuille (ce que fait `ExportPJ.gs`)

- Chaque atout : le texte de la 1re ligne donne `type` et `nom` (préfixe `Type : Nom`, ou détection Drone, Véhicule, Cyberdeck, Éveil) ; son sous-niveau devient `niveau_base` ; les lignes suivantes deviennent des `effets` avec leur sous-niveau.
- Les lignes `RRn …`, `VD +n …`, `Armure +n …` et `Case … supplémentaire` deviennent des `bonus` typés. Une ligne non reconnue reste un effet en texte libre, avec un avertissement affiché à l'export.
- Les armes : la VD, les portées, la spécialisation entre parenthèses et la monture `(sur X)` deviennent des champs.
- Le niveau de chaque atout est contrôlé contre la colonne M de la feuille. La colonne RR de la feuille n'est pas exportée (avertissement si elle est remplie).
- Le karma de la feuille est converti : `karma × 500` est ajouté aux gains (pour Marsy : 5 × 500 + 7 500 = 10 000), ce qui conserve le même total de nuyens disponibles.
- Toutes les compétences présentes dans la feuille sont `actif: true`. Les autres compétences du catalogue seront ajoutées (désactivées) par l'application.
