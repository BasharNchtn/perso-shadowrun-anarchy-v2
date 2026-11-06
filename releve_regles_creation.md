# Règles de création — Shadowrun Anarchy v2

Les règles sont reprises telles qu'écrites dans Shadowrun Anarchy v2.

---

## 1. Coûts en nuyens

| Poste | Règle |
|---|---|
| **Attribut** (valeur v, maximum m du métatype) | si v < m : `v × 10 000` ; si v = m : `10 000 + v × 10 000` (10 000 par point, le dernier point au maximum coûte 20 000) |
| **Compétence** (indice i, maximum absolu 8) | si i ≤ 5 : `i × 2 500` ; si i ≥ 6 : `12 500 + (i − 5) × 5 000` (2 500 par point jusqu'à 5, 5 000 par point à partir de 6) |
| **Spécialisation possédée** | 2 500, quel que soit l'indice |
| **Connaissance** | 2 500 par ligne remplie |
| **Atout** | 5 000 par niveau |
| **Arme** | 2 500 ; **arme de spécialiste** 5 000 |
| **Sort** ou **forme complexe** | 5 000 |
| **Armure** | 2 500 par point (la première armure a 3 points par défaut = 7 500 ¥) ; on peut posséder plusieurs armures |
| **Équipement** | 2 500 par ligne remplie (le commlink et le faux SIN de la ligne offerte sont gratuits) |

Total dépensé = somme des postes.
Nuyens disponibles = **base du niveau de jeu + gains** (voir section 3).

---

## 2. Niveau de jeu : limitations à la création

| | Rue | Runner | Élite | Choix (personnalisé) |
|---|---|---|---|---|
| Nuyens disponibles | 300 000 | 375 000 | 450 000 | 400 000 (saisi) |
| Nb max d'attributs à l'indice max | 0 | 1 | 2 | = Runner |
| Indice max des compétences | 4 | 5 | 6 | = Runner |
| RR max sur une compétence | 1 | 1 | 2 | = Élite |
| RR max sur une spécialisation | 1 | 2 | 2 | = Élite |

Chaque limite du niveau « Choix » peut être modifiée dans l'appli. Une limite non respectée s'affiche en rouge.
Une case « Appliquer les limites du niveau de jeu » permet de les désactiver quand le personnage évolue après la création : le tableau des limites affiche alors seulement les valeurs actuelles (nombre d'attributs au maximum, indice max, RR max), sans contrôle. Les nuyens et les maximums de métatype restent contrôlés.
Un attribut est « maximisé » quand sa valeur atteint le maximum de son métatype.

**Plafond général des RR** : en cumulant tous les atouts (RR d'attribut + RR de compétence + RR de spécialisation), un RR ne dépasse jamais 3. Au-delà, il est ramené à 3 sur la fiche.

---

## 3. Valeurs dérivées

| Valeur | Règle |
|---|---|
| Points d'Anarchy | 4 pour un Humain, 3 pour tout autre métatype |
| Essence | `6 − somme des pertes d'Essence` des atouts |
| Gains | somme globale saisie à la main (ajoutée aux nuyens du niveau) |
| Nuyens disponibles | `base du niveau de jeu + gains` |
| Reste | `disponibles − dépensés` |

### Moniteurs de blessures et seuils

Les seuils se lisent dans l'ordre : blessure légère, grave, incapacitante. Chaque moniteur a 2 cases de blessure légère, 1 de grave et 1 d'incapacitante, plus celles qu'ajoutent des atouts (personnage).

| Moniteur | Légère | Grave | Incapacitante |
|---|---|---|---|
| Personnage, sans armure | Force | Force + 3 | Force + 6 |
| Personnage, avec une armure portée (une ligne par armure possédée) | Force + armure | Force + armure + 3 | Force + armure + 6 |
| Personnage, mental | Volonté | Volonté + 3 | Volonté + 6 |
| Véhicule ou drone (blindage toujours inclus) | Structure + Blindage | 2 × Structure + Blindage | 3 × Structure + Blindage |
| Cyberdeck (moniteur matriciel) | Firewall | Firewall + 3 | Firewall + 6 |

Précisions :
- Un véhicule ou drone ne peut pas retirer son blindage : un seul moniteur, qui l'inclut.
- Le moniteur matriciel d'un cyberdeck a le même nombre de cases (2 / 1 / 1) que les autres moniteurs.

L'attribut associé à une compétence ou une spécialisation est celui du tableau de la section 6. Il est modifiable (pour la Conjuration, selon la tradition du magicien).

---

## 4. Listes

### Métatypes : maximum par attribut

| | FOR | AGI | VOL | LOG | CHA |
|---|---|---|---|---|---|
| Humain | 4 | 4 | 4 | 4 | 4 |
| Elfe | 4 | 4 | 4 | 4 | 5 |
| Nain | 4 | 4 | 5 | 4 | 4 |
| Ork | 5 | 4 | 4 | 4 | 4 |
| Troll | 6 | 4 | 4 | 4 | 4 |

Un métatype « Personnalisé » permet de saisir les maximums à la main.

### Autres listes
- **Train de vie** : squatter, bas (par défaut), moyen, élevé.
- **Catégories** : armes (avec la case « arme de spécialiste »), sorts, formes complexes.

### Types d'atouts (niveau de base et perte d'Essence)

| Type | Niveau de base | Perte d'Essence |
|---|---|---|
| Éveil | 1 ou plus (libre) | |
| Cyberware | 1 | −1 |
| Bioware | 2 | −0,5 |
| Pouvoir d'adepte | 1 | |
| Équipement | 0 (l'équipement s'achète en plus) | |
| Cyberdeck | 1 | |
| Véhicule ou drone | 1 | |
| Contact | 0 | |
| Trait | 0 pour le premier, 3 pour les suivants | |
| Initiation (magie) | 3 | |

Précisions :
- « Équipement » est le terme générique : il peut s'agir d'une arme (de spécialiste ou non), d'une armure ou d'un appareil. L'équipement s'achète en plus de l'atout, car l'atout représente seulement les bonus rachetés. Un atout de type équipement se compte donc deux fois : en niveaux d'atout et en coût d'achat dans la section Équipement.
- Trait : le premier trait coûte 0 niveau, les suivants 3 niveaux.

### Effets d'atouts (coût en niveaux)

Tous les maximums « max » ci-dessous valent **par atout**. Le coût de ces effets est calculé automatiquement par l'appli. Seul un effet personnalisé a un coût saisi à la main.

| Effet | Niveaux | Maximum (par atout) |
|---|---|---|
| RR sur spécialisation | 2 par RR | 3 |
| RR sur compétence | 5 par RR | 1 |
| RR sur attribut | 10 par RR | 1 |
| Initiative physique niv. 1 (+1 point d'Anarchy par scène d'action, actions supplémentaires illimitées en échange de points d'Anarchy) | 2 | |
| Initiative physique niv. 2 (niv. 1 + 1 action par narration) | 5 | |
| Initiative physique niv. 3 (niv. 2 + gain de 1 point d'Anarchy par scène d'action) | 7 | |
| Initiative astrale ou matricielle niv. 1 | 1 | |
| Initiative astrale ou matricielle niv. 2 | 3 | |
| Initiative astrale ou matricielle niv. 3 | 4 | |
| VD +1 | 1 par point | 2 |
| Armure +1 (physique ou mentale) | 1 par point | 1 |
| Armure +1 contre tous dommages (physique et mentale) | 2 par point | 1 |
| Portée d'une arme : un changement de portée (de – à Dés, ou de Dés à OK) | 2 par changement | 2 par portée |
| Case de blessure légère supplémentaire | 3 | 1 |
| Case de blessure grave supplémentaire | 6 | 1 |
| Sort maintenu supplémentaire | 2 par sort | 2 |
| Esprit invoqué supplémentaire | 3 | 1 |
| Focus d'arme (effet narratif) | 1 | |
| RV Cold-sim | 1 | |
| RV Cold-sim et Hot-sim | 3 | |
| Firewall +1 | 1 par point | 5 |
| Attaque +1 | 1 par point | 5 |
| Effet narratif | 1 | |
| Équipement intégré | 1 (+ coût de l'équipement) | |
| Effet personnalisé | coût saisi | |

Restrictions : Firewall ne concerne que les cyberdecks, le cyberware et les équipements de type appareil. Attaque ne concerne que les cyberdecks.

**Cyberdeck** : un cyberdeck a de base Firewall 1 et Attaque 0 (valeurs fixes). On les augmente avec les effets « Firewall +1 » et « Attaque +1 » (1 niveau par point, maximum 5 pour chacun).

### Effets réservés aux véhicules et drones

La **structure ne s'améliore pas** : elle reste à sa valeur de base.

| Effet | Niveaux | Maximum |
|---|---|---|
| Autopilote +1 | 1 par point | +6 (soit 12 au total) |
| Vitesse +1 | 1 par point | +3 |
| Maniabilité +1 | 1 par point | +3 |
| Blindage +1 | 1 par point | la structure |
| Volant (vitesse de base doublée) | 1 | 1 |
| Drone supplémentaire identique | 2 | 3 drones |
| Monture d'arme supplémentaire | 1 | |
| Amélioration de monture d'arme (tourelle, dissimulée, etc.) | 1 par amélioration | |

### Types de véhicules et de drones (valeurs de base)

Le niveau initial correspond à un véhicule ou drone avec : Autopilote 6, Structure + Maniabilité + Vitesse = 12 (10 pour les microdrones, pour compenser leur avantage en Furtivité), Blindage 0, une monture d'arme vers l'avant (sauf exception). Les vitesses en vol sont doublées (le microdrone, à vitesse 0, vole à 1). Le choix du type fixe ces valeurs de base ; elles ne se modifient pas à la main.

| Type | Autopilote | Structure | Maniabilité | Vitesse (volant) | Blindage | Monture d'arme |
|---|---|---|---|---|---|---|
| Microdrone | 6 | 0 | 10 | 0 (1) | 0 | aucune ; avantage en Furtivité (discrétion physique) |
| Minidrone | 6 | 1 | 10 | 1 (2) | 0 | pistolet de petit calibre au maximum |
| Petit drone | 6 | 1 | 9 | 2 (4) | 0 | mitraillette au maximum |
| Drone moyen | 6 | 2 | 7 | 3 (6) | 0 | fusil d'assaut au maximum |
| Grand drone | 6 | 4 | 4 | 4 (8) | 0 | une monture |
| Moto de course | 6 | 4 | 2 | 6 | 0 | fusil d'assaut au maximum |
| Moto tout-terrain | 6 | 4 | 3 | 5 | 0 | fusil d'assaut au maximum |
| Chopper | 6 | 5 | 2 | 5 | 0 | fusil d'assaut au maximum |
| Voiture de sport | 6 | 5 | 2 | 5 | 0 | une monture |
| Berline | 6 | 6 | 2 | 4 | 0 | une monture |
| SUV / Pick-up | 6 | 7 | 1 | 4 | 0 | une monture |
| Van | 6 | 8 | 1 | 3 | 0 | une monture |
| Bus / semi-remorque | 6 | 10 | 0 | 2 | 0 | une monture |

Dans l'appli : un atout de type « Drone » ne propose que les types de drones, un atout « Véhicule » que les types de véhicules. Après le choix du type, les caractéristiques de base et le niveau de base s'affichent sans pouvoir être modifiés. Les améliorations (autopilote, maniabilité, vitesse, blindage, avec les maximums ci-dessus) et le fait d'être volant sont des effets de l'atout, à ajouter seulement si on les prend ; ils mettent à jour le niveau courant.

**Type personnalisé** : pour un véhicule ou drone qui n'entre dans aucun type, on choisit « Personnalisé » et on saisit toutes les valeurs de base, en respectant la règle du niveau initial : structure + maniabilité + vitesse = 12 (10 pour un microdrone), autopilote 6, blindage 0.

La monture d'arme permet de monter une arme, mais l'arme s'achète à part. Pour des drones supplémentaires, il faut acheter autant d'armes que nécessaire pour les monter.

---

### Types d'armes (valeurs de base)

Le type d'arme **fixe** la VD et les portées (Contact / Courte / Moyenne / Longue ; « Dés. » = désavantage, « – » = impossible). Les armes de spécialiste (**) coûtent 5 000 ¥ au lieu de 2 500 ¥ (case « arme de spécialiste »).

**Spécialisation** : elle se choisit dans la famille de l'arme. Une arme de mêlée utilise une spécialisation de mêlée (mains nues, lames, armes contondantes, ou une arme exotique prise par le personnage), une arme à feu une spécialisation d'arme à feu (pistolets, mitraillettes, fusils, armes lourdes, lance-grenades), une arme de jet ou de trait une spécialisation de jet ou de trait (armes de jet, armes de trait). Le tableau indique la spécialisation proposée par défaut. Pour une arme montée sur un véhicule ou un drone, la spécialisation est « armes montées » : on choisit alors le véhicule ou drone porteur.

**Arme exotique** : une arme exotique n'est proposée comme spécialisation de l'arme que si le personnage l'a prise dans ses compétences (Combat rapproché). On peut en prendre plusieurs, en précisant le nom de chacune (fouet, tronçonneuse…), à 2 500 ¥ la spécialisation. L'effet « VD + sur arme exotique » s'applique à toutes les armes exotiques.

**Toxine** : pour les armes à feu, les armes de jet et de trait (grenades comprises), la VD peut être remplacée par une toxine, décrite par un texte (effet, durée, résistance…) ; la VD n'est alors plus affichée. Les grenades à gaz et les injecteurs ont toujours une toxine, jamais de VD.

**Modifier la base** : pour changer la VD ou les portées, il faut associer à l'arme un atout (de type Équipement, portant le nom de l'arme) avec les effets « VD +1 » (1 niveau par point, maximum 2) et « Portée » (2 niveaux par changement de portée). Les autres effets (narratif, VD +1 d'une autre nature…) se prennent dans cet atout, avec un effet personnalisé.

| Type | VD | Contact | Courte | Moyenne | Longue | Spécialisation par défaut |
|---|---|---|---|---|---|---|
| Mains nues | FOR | OK | – | – | – | mains nues |
| Armes courtes | FOR+1 | OK | – | – | – | lames |
| Injecteur | toxine | OK | – | – | – | mains nues |
| Armes longues | FOR+2 | OK | – | – | – | lames |
| Armes de contact avancées | 5 | OK | – | – | – | lames |
| Armes de jet | FOR+1 | OK | OK | Dés. | – | armes de jet |
| Arcs | FOR+1 | OK | OK | OK | – | armes de trait |
| Arbalètes | 4 | OK | OK | OK | – | armes de trait |
| Tasers | 5 | OK | OK | – | – | pistolets |
| Pistolets de poche | 3 | OK | OK | Dés. | – | pistolets |
| Pistolets légers | 4 | OK | OK | Dés. | – | pistolets |
| Pistolets automatiques | 4 | OK | OK | Dés. | – | pistolets |
| Pistolets lourds | 5 | OK | OK | Dés. | – | pistolets |
| Mitraillettes | 5 | Dés. | OK | OK | – | mitraillettes |
| Fusils d'assaut | 7 | Dés. | OK | OK | Dés. | fusils |
| Shotguns | 8 | Dés. | OK | Dés. | – | fusils |
| Fusils de précision** | 10 | – | Dés. | Dés. | OK | fusils |
| Mitrailleuses** | 9 | – | OK | OK | OK | armes lourdes |
| Grenades | 7 | OK | OK | Dés. | – | armes de jet |
| Grenades à gaz* | toxine | OK | OK | Dés. | – | armes de jet |
| Lance-grenades** | 7 | – | Dés. | OK | OK | lance-grenades |
| Lance-roquettes** | 12 (anti-véhicules 16) | – | – | Dés. | OK | armes lourdes |

### Sorts et formes complexes

- Les sorts ne sont proposés que si le personnage a la compétence Sorcellerie, les formes complexes que s'il a Technomancie. Un sort ou une forme complexe coûte 5 000 ¥.
- Un sort a un **type**, qui correspond aux spécialisations de Sorcellerie : combat, détection, illusion, manipulation, santé.
- Un sort a un **seuil** (texte libre) et une description sur plusieurs lignes.
- Case **aire d'effet** : le seuil dépend de l'aire. Il se complète par un seuil pour l'aire : 0 pour affecter une personne, puis +1 succès par tranche de 3 mètres de diamètre.
- Case **selon taille** : le seuil dépend de la taille de la cible. Il se complète par un seuil pour la taille : 0 pour une cible de la taille d'un métahumain, 1 pour celle d'une voiture, 2 pour celle d'un bus, etc.
- Sur la fiche, une case cochée ajoute un exposant « a » (aire d'effet) ou « t » (taille) au seuil, et la règle correspondante est rappelée sous les sorts.
- **Illusion** : les témoins d'un sort d'illusion peuvent tenter de le percer à jour s'ils ont des raisons de douter, avec un test de Perception + Logique (avec avantage si c'est évident) contre les succès nets du sort. Les sorts d'illusion, à l'inverse des autres, sont discrets même dans l'espace astral : pour les repérer, il faut réussir un test de Perception (astrale) + Logique contre les succès nets du sort. Ce rappel figure sur la fiche dès qu'un sort d'illusion est pris.

## 5. Règles de saisie dans l'appli

- Une spécialisation possédée coûte 2 500 et vaut l'indice de la compétence + 2.
- Les compétences « spécifiques » (Conjuration, Sorcellerie, Enchantement, Technomancie) se cochent librement. Leur accès dépend de l'Éveil ou de la technomancie du personnage : c'est à la table de le vérifier à la main.
- La spécialisation « arme exotique » se prend plusieurs fois, en précisant le nom de chaque arme exotique (fouet, tronçonneuse…), à 2 500 ¥ chacune.
- Un atout de type Équipement se choisit parmi les armes, les armures et les équipements déjà présents ; « nouvel équipement » crée une ligne « équipement sans nom » dans la liste d'équipement. Le nom de l'atout suit celui de l'élément lié.
- Les niveaux d'atout sont toujours des nombres entiers.
- Armures et équipements sont deux catégories distinctes : une armure se saisit avec son nom et son niveau, et chaque armure active ajoute une ligne de seuils de blessure sur la fiche.
- Un équipement peut avoir une description facultative (effet d'une toxine, usage d'un stim patch…), affichée sur la fiche sur la même ligne que son nom.
- Sur la fiche, les compétences générales apparaissent même à 0 ; les compétences spécifiques (Conjuration, Sorcellerie, Enchantement, Technomancie) n'apparaissent que si elles sont cochées.
- Le niveau d'un atout est la somme de son niveau de base et du niveau de ses effets. Il détermine le coût (5 000 par niveau). Il est recalculé automatiquement, sauf pour les effets personnalisés.
- Une ligne par arme, par sort et par forme complexe, chacun dans sa section.
- Les RR d'un atout s'appliquent à la compétence ou spécialisation choisie dans l'effet.

---

## 6. Compétences (attribut par défaut entre crochets)

### Compétences génériques (toujours présentes, à 0 si non spécifié)
- **Armes à distance** [AGI] : armes de jet, armes de trait, armes lourdes, armes montées, fusils, lance-grenades, mitraillettes, pistolets (tous AGI).
- **Athlétisme** [FOR] : course [FOR], défense à distance [AGI], escalade [FOR], natation [FOR], parkour [AGI].
- **Combat rapproché** [AGI] : armes contondantes, défense, lames, mains nues, arme exotique (à préciser) (tous AGI) ; combat astral [VOL].
- **Électronique** [LOG] : appareils personnels, protection matricielle, recherche matricielle (tous LOG).
- **Furtivité** [AGI] : crochetage, discrétion astrale, discrétion physique, escamotage (AGI) ; discrétion matricielle [LOG].
- **Influence** [CHA] : bluff, étiquette, imposture, intimidation, négociation.
- **Ingénierie** [LOG] : armes contrôlées à distance, C&R appareils électroniques, C&R drones, C&R engins mécaniques, C&R implants cybernétiques, C&R véhicules, explosifs, guerre électronique.
- **Perception** [LOG] : astrale, matricielle, physique, sociale.
- **Pilotage** [AGI] : camions, drones aquatiques, drones terrestres, drones volants, motos, véhicules aquatiques, véhicules volants, voitures.
- **Piratage** [LOG] : backdoor, force brute (LOG) ; cybercombat [VOL].
- **Réseau** [CHA] : corporatiste, criminel, la rue, gouvernemental, ingénierie, magique, matriciel, médiatique, médical, universitaire.
- **Survie** [LOG] : orientation, milieu hostile, premiers soins (LOG) ; dressage [CHA] ; sang-froid [VOL].

### Compétences spécifiques (liées à l'Éveil ou à la technomancie, gérées à la main)
- **Conjuration** [LOG] : bannissement, esprits des aînés, de l'air, des bêtes, de l'eau, du feu, des plantes, de la terre (tous LOG ; attribut modifiable selon la tradition).
- **Sorcellerie** [VOL] : contresort, sorts de combat, de détection, d'illusion, de manipulation, de santé.
- **Enchantement** [VOL] : dissipation, sorts de combat, de détection, d'illusion, de manipulation, de santé.
- **Technomancie** [LOG] : compilation, décompilation, formes complexes.
