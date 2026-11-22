# Shadowrun Anarchy v2 — Créateur de fiches de personnage

Un outil pour créer, gérer et éditer des fiches de personnage pour **Shadowrun Anarchy v2**.

L'objectif est de simplifier la création des personnages en proposant une interface interactive qui permet de maîtriser les coûts de création, à la manière d'un tableur, puis de produire une fiche pratique pour les parties sur table.

**Projet de fan, indépendant et non officiel.**

## Utiliser l'application

**[Accéder à l'application en ligne](https://basharnchtn.github.io/perso-shadowrun-anarchy-v2/)**

L'application est hébergée gratuitement sur GitHub Pages. Elle peut être utilisée directement depuis un navigateur Web, sans installation ni création de compte.

Il est également possible de récupérer le code source depuis ce dépôt et d'exécuter l'application localement.

## Fonctionnalités

### Création de personnage

L'interface de création permet de construire progressivement un personnage tout en gardant une vision d'ensemble de ses caractéristiques et de ses dépenses.

Elle propose notamment :

- **Attributs** : répartition et contrôle des caractéristiques du personnage.
- **Compétences et spécialisations** : sélection et progression des compétences.
- **Atouts** : gestion des éléments nécessaires à la création du personnage.
- **Équipement** : gestion des équipements disponibles.
- **Ressources** : suivi des ressources et des coûts associés à la création.
- **Contrôle des coûts** : calcul des dépenses et suivi des limites applicables au personnage.

Les différents éléments sont regroupés dans une interface interactive. Les coûts et les indicateurs sont actualisés au fur et à mesure des modifications, ce qui permet d'expérimenter différentes configurations sans avoir à recalculer manuellement chaque dépense.

L'outil propose plusieurs niveaux de création : Rue, Runner et Élite.

### Fiche de personnage

Une fois le personnage créé, l'onglet **Fiche** permet de consulter une version destinée à être utilisée pendant les parties.

La fiche est accessible directement dans le navigateur et peut être exportée en PDF pour être imprimée ou conservée sous forme numérique.

### Plusieurs personnages en même temps

- **Ouvrir** accepte plusieurs fichiers JSON à la fois ; **Dossier** ouvre d'un coup tous les personnages d'un dossier (les autres fichiers sont ignorés) ; **Nouveau** ajoute un personnage sans fermer les autres.
- Une puce par personnage apparaît au-dessus des onglets : cliquer dessus change de personnage, **×** le ferme, et un « ● » signale les modifications non enregistrées.
- Quand plusieurs personnages ouverts portent le même nom (par exemple deux versions d'un même personnage), les suivants sont numérotés dans l'ordre d'ouverture : « Lame », « Lame (2) »… Dans Comparer, l'en-tête de chaque colonne indique aussi le nom du fichier.
- Chaque personnage garde son propre fichier : **Enregistrer** réécrit le bon fichier (voir ci-dessous), et **Tout enregistrer** enregistre d'un coup tous les personnages modifiés. Survoler une puce affiche le nom de son fichier.
- Sur Chrome et Edge, les fichiers sont retrouvés après un rechargement de la page (le navigateur redemande alors l'accès à l'enregistrement). Ailleurs, l'enregistrement se fait par téléchargement.
- L'onglet **Comparer** présente un tableau de synthèse, une colonne par personnage coché (une case par personnage ouvert permet de choisir lesquels comparer ; le tableau se met à jour quand on ouvre ou ferme un personnage) : essence et nuyens, attributs, compétences (indice, RD, RR, spécialisations), atouts, véhicules, armes et sorts. Trois modes de surlignage au choix : **les différences** (ce qui diffère de la première colonne ; un élément absent d'une colonne y apparaît barré, un élément ajouté est surligné), **la meilleure valeur** d'une ligne numérique, ou rien. Le mode « différences » est choisi d'office quand on compare des versions d'un même personnage (même nom), le mode « meilleure valeur » sinon. Les connaissances sont aussi comparées.
- **Imprimer tous** (onglet Fiche) imprime toutes les fiches ouvertes à la suite, 2 pages A4 chacune.
- Le navigateur conserve une copie de travail de tous les personnages ouverts.

### Fiches de PNJ

Un PNJ se crée exactement comme un PJ : même création, même fichier JSON. Sur l'onglet **Fiche**, le choix **PJ (complète)**, **PNJ en RD** ou **PNJ en seuils fixes** change le rendu (ce choix n'est pas enregistré dans le JSON).

- La fiche PNJ est une **planche de blocs compacts**, en général 6 à 8 PNJ sur deux pages A4. Chaque bloc contient les attributs, les compétences et spécialisations actives, les atouts en une ligne, les armes avec leurs portées, les sorts, les véhicules et drones, et les seuils de blessures avec leurs cases.
- En **RD**, chaque compétence et spécialisation affiche sa réserve de dés (et son RR).
- En **seuils fixes**, elle affiche à la place un seuil `s = RD ÷ 3 + RR + 1`, arrondi au plus proche, calculé avec le RD et le RR de la ligne (par exemple RD 9 et RR 1 donnent 5).
- La planche reprend tous les personnages ouverts ; des cases à cocher permettent de choisir lesquels imprimer. **Imprimer / PDF** imprime la planche.

### Sauvegarde des personnages en JSON

Chaque personnage est représenté par **un unique fichier JSON**, qui constitue sa source de vérité.

L'application permet de :

- Créer un nouveau personnage ;
- Ouvrir un personnage existant depuis un fichier JSON ;
- Modifier un personnage ;
- Enregistrer le personnage dans un fichier JSON : sur Chrome et Edge, **Enregistrer** réécrit directement le fichier ouvert (et **Enregistrer sous** en crée un autre) ; sur les autres navigateurs, le fichier est téléchargé à chaque enregistrement ;
- Générer sa fiche à partir des données enregistrées.

Ce fonctionnement présente plusieurs avantages :

- Les données restent sous le contrôle de l'utilisateur.
- Les personnages peuvent être sauvegardés, copiés ou archivés facilement.
- Aucun compte utilisateur n'est nécessaire.
- Les données peuvent être conservées indépendamment de l'application.
- Le format JSON facilite les traitements automatisés et les évolutions futures de l'outil.

Le navigateur conserve également une copie de travail locale afin de retrouver le dernier personnage utilisé. Cette copie ne remplace pas la sauvegarde du fichier JSON.

Le fichier porte un numéro de version de format (`version`). L'application refuse d'ouvrir un fichier créé avec une version plus récente et convertit automatiquement les versions plus anciennes. Le détail du format est décrit dans [`format_pj_v2.md`](format_pj_v2.md).


## Utilisation

### Prérequis

L'application fonctionne dans un navigateur Web moderne prenant en charge JavaScript.

Aucune installation de dépendance, aucun serveur applicatif et aucun compte utilisateur ne sont nécessaires pour l'utilisation courante.

Aucune ressource externe n'est chargée : la police de caractères est embarquée dans `index.html`, et l'application fonctionne aussi hors ligne une fois la page enregistrée.

### Lancer l'application

**Depuis le site hébergé :**

1. Ouvrir [l'application en ligne](https://basharnchtn.github.io/perso-shadowrun-anarchy-v2/).
2. Utiliser l'onglet **Création** pour construire un personnage.
3. Enregistrer le personnage dans un fichier JSON.
4. Utiliser l'onglet **Fiche** pour consulter le personnage et exporter sa fiche en PDF.

**En local :**

1. Récupérer le dépôt GitHub ou télécharger ses fichiers.
2. Ouvrir le fichier `index.html` dans un navigateur Web.
3. Procéder comme pour la version en ligne.

### Reprendre un personnage existant

1. Ouvrir l'application.
2. Cliquer sur **Ouvrir**.
3. Sélectionner le fichier JSON du personnage.
4. Modifier le personnage si nécessaire.
5. Enregistrer le fichier JSON mis à jour.

**Attention :** le stockage local du navigateur n'est pas un système de sauvegarde. Pour conserver durablement un personnage ou le transférer sur un autre ordinateur, il faut conserver son fichier JSON.

## Documentation

- [`generer_un_personnage.md`](generer_un_personnage.md) : guide pour générer un fichier JSON depuis un autre programme ou une IA.
- [`format_pj_v2.md`](format_pj_v2.md) : description du format JSON d'un personnage.
- [`releve_regles_creation.md`](releve_regles_creation.md) : règles de création utilisées (coûts, limites, effets, types d'armes et de véhicules).

## Générer des fichiers depuis un autre programme ou une IA

Point d'entrée : **[`generer_un_personnage.md`](generer_un_personnage.md)**, un guide pour un programme ou une IA (principes, exemples, valeurs permises, erreurs fréquentes, validation). Il s'appuie sur la description du format [`format_pj_v2.md`](format_pj_v2.md) et sur les règles [`releve_regles_creation.md`](releve_regles_creation.md).

**Valider un fichier avec les vraies règles de l'application** : `node outils/verifier.js mon_fichier.json` (après `npm install`) affiche les anomalies, les limites dépassées, le budget dépensé et restant, et l'Essence ; code de sortie 0 si tout est valide ; option `--json` pour une sortie lisible par un programme.

Le format est aussi décrit par un **schéma JSON** lisible par une machine est fourni : [`format_pj_v2.schema.json`](format_pj_v2.schema.json) (JSON Schema 2020-12). Il vérifie les noms de champs, les types, et les valeurs imposées : compétences et spécialisations officielles, types d'atouts, codes d'effets, types d'armes, de sorts et de véhicules, etc. Seul `format` est obligatoire : l'application complète le reste (compétences officielles, `id`, niveaux de base des atouts, niveaux des effets prédéfinis).

L'application, elle, est tolérante : elle ouvre toujours le fichier (un type d'atout mal orthographié devient par exemple un type personnalisé), mais elle **signale à l'ouverture** tout ce qu'elle ne reconnaît pas : une bannière orange liste les anomalies (champ inconnu, valeur hors liste, lien rompu, nombre écrit en texte…) et la puce du personnage porte un ⚠. Ce rapport couvre les mêmes erreurs que le schéma. Pour valider un fichier hors de l'application : `npx ajv-cli validate --spec=draft2020 -s format_pj_v2.schema.json -d mon_fichier.json`.

Le schéma et la section « Valeurs permises » du guide sont **générés** à partir des données de `index.html` (`npm run schema`) et un test vérifie qu'ils sont à jour : ils ne doivent pas être modifiés à la main.

## Tests

Les tests vérifient quatre personnages fictifs (`tests/exemples/` : un samouraï, une mage, un decker, un adepte), qui utilisent ensemble tous les types d'atouts : aucun avertissement, nuyens restants attendus, enregistrement du fichier, gestion de la version du format, gestion de plusieurs personnages (ouverture, changement, fermeture, comparaison, copie locale), fichiers liés (mémorisation après rechargement, tout enregistrer, ouverture d'un dossier), fiches de PNJ (formule du seuil fixe, valeurs affichées, sélection), schéma JSON (à jour, fichiers valides acceptés, erreurs typiques rejetées), rapport d'anomalies à l'ouverture, commande de vérification et guide de génération et impression en 2 pages A4 par fiche, y compris l'impression groupée.

```
npm install
npm test                  # logique, enregistrement, version du format, plusieurs personnages, PNJ, schéma, anomalies, vérificateur, guide
npm run test:impression   # impression (nécessite pdfinfo, du paquet poppler-utils)
```

Pour tester aussi tes propres personnages sans les publier, copie leurs fichiers JSON dans `tests/prives/` : ce dossier est ignoré par git, et les mêmes contrôles (avertissements, limites, impression en 2 pages) s'y appliquent.

## Données et confidentialité

Les personnages sont gérés dans le navigateur et enregistrés dans des fichiers JSON que l'utilisateur conserve lui-même.

L'application ne nécessite ni compte, ni base de données distante, ni service applicatif hébergé pour fonctionner.

L'hébergement sur GitHub Pages sert à distribuer l'application : les fichiers des personnages restent locaux au client et ne sont pas enregistrés dans le dépôt GitHub.

Les fichiers JSON peuvent contenir toutes les informations relatives aux personnages. Il appartient à l'utilisateur de choisir où les conserver et avec qui les partager.

## Périmètre du projet

Cet outil est conçu pour **Shadowrun Anarchy v2**. Il s'appuie sur les règles de **Shadowrun Anarchy v2** et vise à faciliter la création et l'utilisation des personnages, sans remplacer le livre de règles.

Les calculs et les contrôles automatisés sont destinés à assister le joueur. Il reste de la responsabilité du joueur et du meneur de vérifier la conformité du personnage aux règles et aux éventuelles règles particulières de la table.

Le projet est en cours de développement. Ses fonctionnalités et son interface sont susceptibles d'évoluer.

## Sources, inspirations et remerciements

Ce projet s'appuie sur plusieurs ressources et travaux qui ont contribué à sa conception :

- **Liste des atouts et équipements de Daegann** — [consulter le document PDF](https://daegann.fr/wp-content/uploads/aides/Liste_des_atouts_et_equipements.pdf). Cette compilation a été une ressource particulièrement utile pour le regroupement et la consultation des atouts et équipements. C'est une mine d'informations qui mérite d'être connue des joueurs de Shadowrun Anarchy.
- **Fichier de création de personnage d'Eldar** — [consulter le tableur](https://docs.google.com/spreadsheets/d/10mrLjo72sCeGLPuJFLkJ_2f_TXZB8scV/edit?gid=1820517714#gid=1820517714). Ce tableur a constitué une inspiration initiale pour l'approche de création du personnage, ainsi qu'un premier travail de regroupement des règles. L'application actuelle s'en est ensuite éloignée sur de nombreux points.
- **Fiche Anarchy 2.0 de Devine-1** — [consulter le projet sur GitHub](https://github.com/Devine-1/Fiche-Anarchy-2.0). Le principe d'une fiche de personnage décrite en JSON et transformée en page web a inspiré le concept général de cet outil. Il s'agit d'une inspiration de conception : aucun code de ce projet n'a été repris.
- **Police Oswald** — sous-ensemble latin (graisses 500 et 700) embarqué dans `index.html`, sous licence [SIL Open Font License 1.1](https://openfontlicense.org/).

### Développement assisté par IA

Le développement de ce projet a été réalisé avec l'aide d'outils d'intelligence artificielle générative :

- **Claude (Anthropic)** a réalisé l'ensemble du code de l'application, ainsi que son intégration. Le rôle de l'auteur du projet a consisté à définir les besoins, proposer les fonctionnalités et guider les choix de conception et de présentation, sans intervenir directement dans l'écriture du code.
- **ChatGPT (OpenAI)** a notamment contribué à la rédaction et à la mise en forme de ce README.

Ces outils ont servi d'assistants de réalisation ; les orientations fonctionnelles et les choix du projet ont été définis par son auteur.

Merci aux auteurs des ressources citées ci-dessus pour leur travail et pour leur contribution à la communauté Shadowrun.

## Licence

Le code source de ce projet est distribué sous licence **MIT**. Il est librement accessible et peut être utilisé, copié, modifié et redistribué, y compris dans le cadre d'un projet commercial, sous réserve du respect des conditions de cette licence.

Voir le fichier [`LICENSE`](LICENSE) pour le texte complet de la licence.

**Important :** la licence MIT couvre le code du projet. Elle ne confère aucun droit supplémentaire sur les marques, les règles ou les autres éléments de propriété intellectuelle appartenant à des tiers.

## Mentions légales

Ce projet est un outil de fan (*fan-made*), non officiel. Il n'est ni publié, ni approuvé, ni soutenu officiellement par les détenteurs de la licence Shadowrun.

**Shadowrun** est une marque déposée de [Topps Company, Inc.](https://www.topps.com/) / [Catalyst Game Labs](https://www.catalystgamelabs.com/).

Aucun contenu protégé par le droit d'auteur (artworks, textes de règles) n'est inclus. Les mécaniques de jeu sont utilisées sous réserve des droits des détenteurs.

Ce projet est indépendant et n'est affilié à aucun des détenteurs de la licence Shadowrun.
