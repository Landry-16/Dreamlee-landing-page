# Dreamlee — Proposition de landing page

> **Remplacée par la V2 « Le bureau éparpillé »**, validée puis développée : voir le [README du dépôt](../README.md) et la [maquette V2](https://www.figma.com/design/RS6659X85LNvrpUmDjgqrm?node-id=23-4). Ce document décrit la première proposition (V1) et reste pour mémoire.

Statut : **V1, remplacée**.

## Livrable Figma

- [Maquette desktop, 1440 px](https://www.figma.com/design/RS6659X85LNvrpUmDjgqrm?node-id=6-492)
- [Maquette mobile, 390 px](https://www.figma.com/design/RS6659X85LNvrpUmDjgqrm?node-id=6-740)
- [Fondations et composants](https://www.figma.com/design/RS6659X85LNvrpUmDjgqrm?node-id=4-2)
- [Parcours, états et intentions d’animation](https://www.figma.com/design/RS6659X85LNvrpUmDjgqrm?node-id=9-39)

Équipe choisie : Sandes Educationnal Team. Action principale choisie : rejoindre la bêta / liste d’attente. Langue : français.

Les exports PNG sont dans `exports/`. Les captures produit sont dans `assets/`.

## Intention produit

Dreamlee est un bureau d’écriture pour les auteurs individuels de romans, nouvelles et livres de non-fiction. La page doit faire comprendre ce que le produit permet, donner envie d’y écrire et convertir cette envie en inscription à la bêta.

Promesse : **Votre prochain livre commence ici.**

Sous-titre : « Vos idées, votre univers, votre manuscrit. Enfin réunis, pour aller au bout de votre histoire. »

L’argument central est la continuité du travail : rassembler ce qui est dispersé, préserver la concentration, retrouver le contexte de son univers et pouvoir récupérer son manuscrit.

## Parcours de la page

1. Promesse, CTA de bêta et aperçu réel du manuscrit.
2. Repères : hors ligne, sauvegarde automatique, compte facultatif, quatre formats d’export.
3. Problème de dispersion et réponse de Dreamlee.
4. Éditeur, scènes, concentration et historique.
5. Personnages, relations et cartes.
6. Objectifs personnels et export.
7. Stockage local et liberté de l’auteur.
8. FAQ.
9. Inscription à la bêta avec un champ e-mail.

Les liens du prototype mènent aux sections ; le bouton final affiche une confirmation de démonstration. Figma ne collecte aucune adresse. L’ouverture des accordéons et la validation réelle du formulaire sont spécifiées pour l’intégration.

## Identité visuelle

Les couleurs et polices viennent du produit existant, notamment `apps/desktop/src/shared/styles/tokens.css` dans le dépôt Dreamlee.

| Usage              | Valeur      |
| ------------------ | ----------- |
| Fond papier        | `#FAF8F3`   |
| Panneaux           | `#F1EDE4`   |
| Surface            | `#FFFDF9`   |
| Texte principal    | `#241F1A`   |
| Texte secondaire   | `#6B6255`   |
| Accent terracotta  | `#9E4D29`   |
| Accent doux        | `#F4E3D7`   |
| Titres             | Fraunces    |
| Interface et corps | Public Sans |
| Manuscrit          | Literata    |

Desktop : largeur 1440 px, contenu 1200 px. Mobile : largeur 390 px, marges 24 px. Les CTA mesurent 52 px de haut, avec un minimum de 44 px pour les contrôles compacts.

Contrastes vérifiés : texte principal sur papier 15,39:1 ; texte secondaire sur papier 5,65:1 ; blanc sur terracotta 5,92:1 ; terracotta sur fond doux 4,74:1. Le focus est visible et la couleur n’est pas le seul signal d’erreur.

## Mouvement prévu

- Fondu et translation maximale de 12 px à l’entrée, 300–450 ms.
- Révélation unique des sections au défilement, sans bloquer le scroll natif.
- Transitions des boutons à 140 ms et des accordéons à 180 ms.
- Suppression des translations et tracés avec `prefers-reduced-motion`.
- CSS et IntersectionObserver suffisent pour cette direction ; toute bibliothèque supplémentaire doit répondre à un effet validé.

Ces animations sont documentées, pas encore implémentées.

## Formulaire

Libellé : « Adresse e-mail ». CTA : « Rejoindre la bêta ».

États prévus : vide, focus, adresse invalide, envoi en cours, erreur réseau, succès, adresse déjà inscrite. Les boutons et champs correspondants figurent dans les fondations ; les exemples d’erreur et de succès sont dans le guide Figma.

Le formulaire doit conserver la saisie en cas d’échec et n’afficher un succès qu’après confirmation du service réel. L’implémentation devra préciser l’utilisation de l’adresse et fournir les informations de confidentialité avant publication.

## Sources et limites des promesses

Lecture du README, des deux cahiers des charges PDF, de l’architecture, des tokens, des modules fonctionnels et des parcours E2E du dépôt `/home/gemini/dev/perso/Dreamlee`.

Le code confirme : projets, chapitres/scènes, éditeur, concentration, notes, objectifs, sessions, statistiques, historique, exports PDF/DOCX/Markdown/TXT, fiches d’univers, relations, cartes.

La page ne promet pas de synchronisation cloud, de collaboration, d’application mobile, d’export EPUB, de chronologie ou de module de révision déjà disponibles. Aucun prix, témoignage, nombre d’utilisateurs ni date d’ouverture n’a été inventé.

Les captures sont issues du vrai frontend, avec le backend de démonstration existant. Le roman « Les Cendres d’Aube » et ses personnages sont des données fictives préparées pour la présentation. Le graphique de progression est une illustration, explicitement marqué « Exemple ».

## Éléments libres

- Fraunces, Public Sans et Literata : SIL Open Font License 1.1, vérifiée dans les dépendances du produit.
- Lucide : licence ISC, vérifiée dans la dépendance du produit.
- Logo et captures : éléments du projet Dreamlee.

Conserver les licences des dépendances lors de l’intégration et utiliser les fontes locales pour éviter les requêtes externes inutiles.

## Après validation

Implémenter dans `/home/gemini/dev/perso/Dreamlee-landing-page`, vérifier desktop/mobile, clavier, formulaire et performance, puis pousser sur `git@github.com:Landry-16/Dreamlee-landing-page.git`.

Le service d’inscription, le domaine de publication et les informations de confidentialité seront à raccorder ou préciser pendant l’intégration. Aucun code applicatif ni push n’a été effectué durant cette phase de conception.
