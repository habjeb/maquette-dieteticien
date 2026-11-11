# Maquette — Nicolas Boyer, diététicien-nutritionniste

Site vitrine, prêt à présenter. Consultations en visioconférence partout en France et en déplacement dans le secteur de Condrieu. Application [Vite](https://vite.dev) + React + TypeScript. Les polices sont auto-hébergées via Fontsource (Big Shoulders Display pour les grands titres, DM Serif Display pour les titres secondaires, Manrope pour le texte) : aucun script tiers, pas de requête vers Google Fonts. Aucun tarif n’est publié.

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

Tout ce qui est factuel est dans `src/lib/site.ts` : nom, téléphone, e-mail, adresse, SIREN, RPPS, diplôme, durées, communes, liens Calendly, médiateur. Tant que le téléphone, l’e-mail ou l’adresse restent des placeholders, ils ne sont pas repris dans les données structurées. Le tarif n’a pas de champ : il est communiqué avant la consultation, lors de la prise de rendez-vous.

Les textes de la page d’accueil (domaines, méthode, FAQ) sont dans `src/content/editorial.ts`. Le contenu des trois pages d’accompagnement est dans `src/content/domain-pages.ts`. Les titres SEO sont dans `src/content/pages.ts`.

## Prise de rendez-vous

Les boutons « Prendre rendez-vous » sont des liens externes (`target="_blank"`, `rel="noopener noreferrer"`) vers les URL Calendly de `site.booking`. Aucun widget, aucun script et aucun traceur Calendly n’est chargé. La mention sur l’absence de donnée de santé figure dans la politique de confidentialité.

## Photos

Les visuels d’ambiance sont des fichiers Pexels, licence [Pexels](https://www.pexels.com/license/) (usage libre, y compris commercial, attribution non obligatoire). Ils sont dans `public/photos/`, en WebP, et restent à remplacer par des photos du cabinet. Le portrait est la photo fournie par Nicolas Boyer.

| Fichier | Sujet | Source |
| --- | --- | --- |
| `hero.webp` | Alimentation, plan de travail clair | [Pexels 1640777](https://www.pexels.com/photo/1640777/) |
| `equilibre.webp` | Repas composé, assiette sauge | [Pexels 1410235](https://www.pexels.com/photo/1410235/) |
| `consultation.webp` | Conversation près d’une fenêtre | [Pexels 1181715](https://www.pexels.com/photo/1181715/) |
| `sport.webp` | Course à pied, de loin | [Pexels 2803158](https://www.pexels.com/photo/2803158/) |
| `portrait.webp` | Nicolas Boyer | Photo fournie par le client (selfie, 632×634, sans recadrage). `portrait-320.webp` est la même image à 316 px, servie sur les écrans 1×. |
| `saone.webp` | Quais de la Saône, à Lyon | [Pexels 12884339](https://www.pexels.com/photo/buildings-along-the-river-in-quais-de-saone-lyon-france-12884339/) |

La recherche Pexels « Lyon hôpital » a servi de point de départ pour le cadre santé. Les premiers résultats mêlent la gare de Lyon et des scènes cliniques (blouses, couloirs, matériel). Elles ont été écartées : le rendu demandé est lumineux, sans blouse stéréotypée ni image anxiogène. La carte « Pathologies » utilise donc une conversation dans une pièce claire. La photo des quais est une illustration de la vallée, pas le lieu de consultation, et ne signifie pas que le cabinet est à Lyon.

## Carte de visite

`/carte/` affiche le nom, le titre et les actions appeler, e-mail, rendez-vous et enregistrement du contact (fichier `.vcf` généré dans le navigateur). Le QR code `public/carte-qr.svg` pointe vers `https://habjeb.github.io/maquette-dieteticien/carte/`. Il est visible dans le pied de page.

## Pages

- `/` — accueil (ancres : Accueil, Accompagnements, À propos, Méthode, Consultations, FAQ, rendez-vous)
- `/equilibre-alimentaire/`
- `/pathologies-nutrition-therapeutique/`
- `/nutrition-sportive/`

Depuis l’accueil, les trois accompagnements sont des gélules. Le clic agrandit la photo jusqu’au hero de la page (FLIP, environ 0,8 s). Une ondulation WebGL discrète est chargée à la demande et détruite à la fin. `prefers-reduced-motion`, un appareil très limité ou l’absence de WebGL se replient sur un fondu, ou sur l’API View Transitions quand elle est disponible.
- `/mentions-legales/`
- `/politique-de-confidentialite/`
- `/cgv/`
- `/mediation/`
- `/carte/`

`sitemap.xml` et `robots.txt` sont dans `public/`.
