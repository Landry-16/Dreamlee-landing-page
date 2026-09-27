# Dreamlee — landing page

La page d’accueil de [Dreamlee](https://github.com/Landry-16/Dreamlee), le bureau d’écriture tout-en-un.

Direction « **le bureau éparpillé** » : en haut de page, le bureau d’un auteur en désordre (fiche, post-it, carte, manuscrit). À mesure qu’on défile, tout se range, jusqu’à la feuille blanche de l’inscription à la bêta. Chaque section est une surface du bureau et fait essayer une vraie fonction du produit.

- Maquette Figma : [desktop](https://www.figma.com/design/RS6659X85LNvrpUmDjgqrm?node-id=23-4), [mobile](https://www.figma.com/design/RS6659X85LNvrpUmDjgqrm?node-id=39-2), [storyboard et animations](https://www.figma.com/design/RS6659X85LNvrpUmDjgqrm?node-id=43-2)
- Première proposition (V1, remplacée) : [`design/`](design/README.md)

## Modifier les textes

**Tous les mots de la page sont dans [`src/content/textes.json`](src/content/textes.json).** On le modifie, puis on relance `pnpm build` (ou `pnpm dev` pour voir le résultat tout de suite).

- Écrivez avec des espaces et des apostrophes ordinaires (`l'idée ?`). La typographie française est appliquée à l’affichage : apostrophe courbe, espace fine insécable avant `? ! ;`, espace insécable avant `:` et dans les guillemets `« »`.
- `{email}`, `{count}`, `{query}` et `{year}` sont remplacés par la bonne valeur. Gardez-les tels quels.
- Les listes (liens, fiches, questions, formats…) peuvent s’allonger ou raccourcir. Deux exceptions :
  - `universe.entries` : ajouter une fiche demande aussi de lui donner une place dans `src/components/sections/Universe.astro`.
  - `progress.chart.days` : il faut exactement 30 valeurs.
- Les lettres majuscules des étiquettes (« CHAPITRE 3 », « PERSONNAGE ») viennent du style. Écrivez-les en minuscules dans le fichier.

## Lancer le projet

Il faut Node 22 et pnpm 10.

```sh
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # site statique dans dist/
pnpm preview      # sert dist/
```

### Inscription à la bêta

Le formulaire envoie `POST { "email": "…" }` en JSON à l’adresse indiquée par la variable d’environnement `PUBLIC_BETA_ENDPOINT`, lue au moment du build :

| Réponse du service     | Message affiché                         |
| ---------------------- | --------------------------------------- |
| `2xx`                  | Inscription confirmée                   |
| `409`                  | Adresse déjà inscrite                   |
| autre, ou réseau coupé | Erreur ; l’adresse saisie est conservée |

Tant que la variable est vide, le formulaire vérifie l’adresse puis annonce que les inscriptions ouvrent bientôt. Il n’affiche jamais un faux succès.

```sh
PUBLIC_BETA_ENDPOINT=https://exemple.fr/api/beta pnpm build
```

## Vérifier

```sh
pnpm lint         # ESLint
pnpm check        # types (astro check)
pnpm test         # tests unitaires (Vitest)
pnpm test:e2e     # parcours complets et accessibilité (Playwright + axe), desktop et mobile
```

Si Chromium est déjà installé ailleurs, indiquez-le avec `PLAYWRIGHT_CHROMIUM_PATH=/chemin/vers/chromium pnpm test:e2e`.

## Organisation

```
src/
  content/textes.json     les textes de la page
  components/sections/    une section = un composant (.astro), dans l’ordre de la page
  scripts/                comportements : navigation, animations (motion.ts), démos (demos/)
  lib/                    logique pure, testée : recherche, e-mail, typographie, générateur de cartes
  styles/                 jetons (couleurs, polices) et règles communes
scripts/render-map.ts     régénère l’image « Le Continent » (pnpm dlx tsx scripts/render-map.ts)
tests/                    unit/ (Vitest) et e2e/ (Playwright)
```

- **Mise en page.** À partir de 1200 px, chaque section reprend son cadre Figma : les objets sont placés sur un canevas de 1440 px, réduit d’un bloc sur les écrans un peu plus étroits. En dessous, la section devient une colonne lisible.
- **Carte.** Le générateur est un portage du moteur de l’application (`dreamlee-core/src/terrain`). Il est vérifié par des valeurs de référence : une même graine donne la même carte ici et dans l’app.
- **Mouvement.** Il est désactivé avec `prefers-reduced-motion`. Les objets sont alors déjà rangés et toutes les démos restent utilisables.
- **Confidentialité.** Ni cookie ni mesure d’audience. Les polices sont hébergées avec le site.

## Crédits et licences

| Élément                                                                        | Licence                                                                                  |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Fraunces, Public Sans, Literata, Special Elite, Reenie Beanie (via Fontsource) | SIL Open Font License 1.1                                                                |
| [GSAP](https://gsap.com) et ScrollTrigger                                      | licence standard GSAP, gratuite y compris pour un usage commercial, mais pas open source |
| [Lenis](https://github.com/darkroomengineering/lenis)                          | MIT                                                                                      |
| [Astro](https://astro.build)                                                   | MIT                                                                                      |
| Logo, captures d’écran et générateur de cartes                                 | projet Dreamlee                                                                          |

Les personnages, lieux et le roman « La Lanterne d’Ysmer » de Camille Arnaud sont fictifs : ils servent aux démonstrations.
