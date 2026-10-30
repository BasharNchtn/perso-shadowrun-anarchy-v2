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

### Sauvegarde des personnages en JSON

Chaque personnage est représenté par **un unique fichier JSON**, qui constitue sa source de vérité.

L'application permet de :

- Créer un nouveau personnage ;
- Ouvrir un personnage existant depuis un fichier JSON ;
- Modifier un personnage ;
- Enregistrer le personnage dans un fichier JSON ;
- Générer sa fiche à partir des données enregistrées.

Ce fonctionnement présente plusieurs avantages :

- Les données restent sous le contrôle de l'utilisateur.
- Les personnages peuvent être sauvegardés, copiés ou archivés facilement.
- Aucun compte utilisateur n'est nécessaire.
- Les données peuvent être conservées indépendamment de l'application.
- Le format JSON facilite les traitements automatisés et les évolutions futures de l'outil.

Le navigateur conserve également une copie de travail locale afin de retrouver le dernier personnage utilisé. Cette copie ne remplace pas la sauvegarde du fichier JSON.

## Utilisation

### Prérequis

L'application fonctionne dans un navigateur Web moderne prenant en charge JavaScript.

Aucune installation de dépendance, aucun serveur applicatif et aucun compte utilisateur ne sont nécessaires pour l'utilisation courante.

Une connexion Internet peut être nécessaire pour charger certaines ressources externes, notamment la police de caractères utilisée par l'interface.

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

## Données et confidentialité

Les personnages sont gérés dans le navigateur et enregistrés dans des fichiers JSON que l'utilisateur conserve lui-même.

L'application ne nécessite ni compte, ni base de données distante, ni service applicatif hébergé pour fonctionner.

L'hébergement sur GitHub Pages sert à distribuer l'application : les fichiers des personnages restent locaux au client et ne sont pas enregistrés dans le dépôt GitHub.

Les fichiers JSON peuvent contenir toutes les informations relatives aux personnages. Il appartient à l'utilisateur de choisir où les conserver et avec qui les partager.

## Périmètre du projet

Cet outil est conçu pour **Shadowrun Anarchy v2**. Il vise à faciliter la création et l'utilisation des personnages, sans remplacer le livre de règles.

Les calculs et les contrôles automatisés sont destinés à assister le joueur. Il reste de la responsabilité du joueur et du meneur de vérifier la conformité du personnage aux règles et aux éventuelles règles particulières de la table.

Le projet est en cours de développement. Ses fonctionnalités et son interface sont susceptibles d'évoluer.

## Licence

Le code source de ce projet est distribué sous licence **MIT**. Il est librement accessible et peut être utilisé, copié, modifié et redistribué, y compris dans le cadre d'un projet commercial, sous réserve du respect des conditions de cette licence.

Voir le fichier [`LICENSE`](LICENSE) pour le texte complet de la licence.

**Important :** la licence MIT couvre le code du projet. Elle ne confère aucun droit supplémentaire sur les marques, les règles ou les autres éléments de propriété intellectuelle appartenant à des tiers.

## Mentions légales

Ce projet est un outil de fan (*fan-made*), non officiel. Il n'est ni publié, ni approuvé, ni soutenu officiellement par les détenteurs de la licence Shadowrun.

**Shadowrun** est une marque déposée de [Topps Company, Inc.](https://www.topps.com/) / [Catalyst Game Labs](https://www.catalystgamelabs.com/).

Aucun contenu protégé par le droit d'auteur (artworks, textes de règles) n'est inclus. Les mécaniques de jeu sont utilisées sous réserve des droits des détenteurs.

Ce projet est indépendant et n'est affilié à aucun des détenteurs de la licence Shadowrun.
