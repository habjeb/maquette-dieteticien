# Maquette — Nicolas Boyer, diététicien-nutritionniste

Site vitrine one-page, prêt à présenter. Consultations en visioconférence et en déplacement dans le secteur de Condrieu. Application [Vite](https://vite.dev) + React + TypeScript. Les polices (DM Serif Display, Manrope) sont auto-hébergées via Fontsource : aucun script tiers.

## Site en ligne

**https://habjeb.github.io/maquette-dieteticien/**

Le workflow `.github/workflows/pages.yml` lance `npm ci` puis `npm run build`. La base Vite est `/maquette-dieteticien/`.

GitHub Pages doit être activé sur le dépôt, source **GitHub Actions**. Un dépôt privé exige un forfait qui inclut Pages.

## Reconstruire

```bash
npm ci
npm run dev
npm run lint
npm run build
```

Le serveur de développement sert l’application sous [http://127.0.0.1:5173/maquette-dieteticien/](http://127.0.0.1:5173/maquette-dieteticien/). `npm run build` écrit `dist/`, les pages légales, la carte de visite et `dist/404.html`.

## Personnaliser

Tout ce qui est factuel est dans `src/lib/site.ts` : nom, téléphone, e-mail, adresse, SIREN, RPPS, diplôme, tarifs, liens Calendly, médiateur. Tant que le téléphone, l’e-mail ou l’adresse restent des placeholders, ils ne sont pas repris dans les données structurées.

Les textes de la page d’accueil (domaines, méthode, FAQ) sont dans `src/content/editorial.ts`. Les titres SEO sont dans `src/content/pages.ts`.

## Prise de rendez-vous

Les boutons « Prendre rendez-vous » sont des liens externes (`target="_blank"`, `rel="noopener noreferrer"`) vers les URL Calendly de `site.booking`. Aucun widget, aucun script et aucun traceur Calendly n’est chargé sur le site. Une mention indique qu’aucune donnée de santé n’est demandée à cette étape.

## Photos

Il n’y a pas encore de photos du client. Les visuels sont des fichiers Pexels, licence [Pexels](https://www.pexels.com/license/) (usage libre, y compris commercial, attribution non obligatoire). Ils sont dans `public/photos/`, en WebP, et **doivent être remplacés**.

| Fichier | Sujet | Source |
| --- | --- | --- |
| `hero.webp` | Alimentation, plan de travail clair | [Pexels 1640777](https://www.pexels.com/photo/1640777/) |
| `equilibre.webp` | Repas composé, assiette sauge | [Pexels 1410235](https://www.pexels.com/photo/1410235/) |
| `consultation.webp` | Conversation près d’une fenêtre | [Pexels 1181715](https://www.pexels.com/photo/1181715/) |
| `sport.webp` | Course à pied, de loin | [Pexels 2803158](https://www.pexels.com/photo/2803158/) |
| `portrait.webp` | Portrait d’illustration | [Pexels 614810](https://www.pexels.com/photo/614810/) |
| `saone.webp` | Quais de la Saône, à Lyon | [Pexels 12884339](https://www.pexels.com/photo/buildings-along-the-river-in-quais-de-saone-lyon-france-12884339/) |

La recherche Pexels « Lyon hôpital » a servi de point de départ pour le cadre santé. Les premiers résultats mêlent la gare de Lyon et des scènes cliniques (blouses, couloirs, matériel). Elles ont été écartées : le rendu demandé est lumineux, sans blouse stéréotypée ni image anxiogène. La carte « Pathologies » utilise donc une conversation dans une pièce claire. La photo des quais est une illustration de la vallée, pas le lieu de consultation, et ne signifie pas que le cabinet est à Lyon.

## Carte de visite

`/carte/` affiche le nom, le titre et les actions appeler, e-mail, rendez-vous et enregistrement du contact (fichier `.vcf` généré dans le navigateur). Le QR code `public/carte-qr.svg` pointe vers `https://habjeb.github.io/maquette-dieteticien/carte/`. Il est visible dans le pied de page.

## Pages

- `/` — accueil (ancres : Accueil, Accompagnements, À propos, Méthode, Tarifs, FAQ, rendez-vous)
- `/mentions-legales/`
- `/politique-de-confidentialite/`
- `/cgv/`
- `/mediation/`
- `/carte/`

`sitemap.xml` et `robots.txt` sont dans `public/`.
