export type PageId =
  | "home"
  | "mentions"
  | "privacy"
  | "cgv"
  | "mediation"
  | "carte"
  | "equilibre"
  | "pathologies"
  | "sport"
  | "not-found";

export type PageMeta = {
  id: PageId;
  path: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

export const pages: PageMeta[] = [
  {
    id: "home",
    path: "/",
    title: "Nicolas Boyer, diététicien-nutritionniste libéral à Condrieu",
    description:
      "Exercice libéral : visio partout en France, déplacement dans le secteur de Condrieu. Habitudes alimentaires, nutrition et sport, avec Nicolas Boyer.",
    image: "photos/hero.webp",
    imageAlt:
      "Assiette de quinoa et de légumes, entourée de produits frais sur un plan de travail clair.",
  },
  {
    id: "mentions",
    path: "/mentions-legales",
    title: "Mentions légales | Nicolas Boyer, diététicien à Condrieu",
    description:
      "Éditeur, hébergeur GitHub Pages, titre de diététicien et informations légales du site de Nicolas Boyer. Les champs entre crochets sont à compléter.",
    image: "photos/hero.webp",
    imageAlt:
      "Assiette de quinoa et de légumes, entourée de produits frais sur un plan de travail clair.",
  },
  {
    id: "privacy",
    path: "/politique-de-confidentialite",
    title: "Politique de confidentialité | Nicolas Boyer, diététicien",
    description:
      "Données, rendez-vous et droits sur le site de Nicolas Boyer, diététicien-nutritionniste à Condrieu. Aucune donnée de santé n’est demandée en ligne.",
    image: "photos/hero.webp",
    imageAlt:
      "Assiette de quinoa et de légumes, entourée de produits frais sur un plan de travail clair.",
  },
  {
    id: "cgv",
    path: "/cgv",
    title: "Conditions générales de vente | Nicolas Boyer, diététicien",
    description:
      "Conditions des consultations de Nicolas Boyer : visio en France, déplacement à Condrieu. Réservation, annulation sous 24 h, tarif communiqué avant la prestation.",
    image: "photos/hero.webp",
    imageAlt:
      "Assiette de quinoa et de légumes, entourée de produits frais sur un plan de travail clair.",
  },
  {
    id: "mediation",
    path: "/mediation",
    title: "Médiation de la consommation | Nicolas Boyer, diététicien",
    description:
      "Médiation de la consommation pour les consultations de Nicolas Boyer, diététicien-nutritionniste. Coordonnées du médiateur à compléter avant mise en ligne.",
    image: "photos/hero.webp",
    imageAlt:
      "Assiette de quinoa et de légumes, entourée de produits frais sur un plan de travail clair.",
  },
  {
    id: "carte",
    path: "/carte",
    title: "Carte de visite | Nicolas Boyer, diététicien-nutritionniste",
    description:
      "Carte de visite de Nicolas Boyer, diététicien-nutritionniste. Visio partout en France et déplacement dans le secteur de Condrieu, rendez-vous en ligne.",
    image: "photos/portrait.webp",
    imageAlt: "Nicolas Boyer, diététicien-nutritionniste",
  },
  {
    id: "equilibre",
    path: "/equilibre-alimentaire",
    title: "Équilibre alimentaire | Nicolas Boyer, diététicien",
    description:
      "Repères pour équilibrer et organiser les repas selon votre rythme, avec Nicolas Boyer. Visio partout en France, déplacement dans le secteur de Condrieu.",
    image: "photos/equilibre.webp",
    imageAlt: "Assiette de riz, de courgettes et d’œufs sur une vaisselle vert sauge, posée sur un linge rayé.",
  },
  {
    id: "pathologies",
    path: "/pathologies-nutrition-therapeutique",
    title: "Nutrition thérapeutique | Nicolas Boyer, diététicien",
    description:
      "Nutrition thérapeutique avec Nicolas Boyer : adapter l’alimentation à votre état de santé. Visio partout en France, déplacement dans le secteur de Condrieu.",
    image: "photos/consultation.webp",
    imageAlt: "Deux personnes en conversation, assises à une table claire près d’une grande fenêtre.",
  },
  {
    id: "sport",
    path: "/nutrition-sportive",
    title: "Nutrition sportive | Nicolas Boyer, diététicien libéral",
    description:
      "Repas et hydratation autour de l’entraînement, avec Nicolas Boyer. Visio partout en France, déplacement dans le secteur de Condrieu, sans promesse de résultat.",
    image: "photos/sport.webp",
    imageAlt: "Coureur en veste sombre, vu de loin, sur une route dégagée sous un ciel clair.",
  },
  {
    id: "not-found",
    path: "/404",
    title: "Page introuvable | Nicolas Boyer, diététicien-nutritionniste",
    description:
      "Cette page n’existe pas sur le site de Nicolas Boyer, diététicien-nutritionniste à Condrieu. Revenez à l’accueil afin de prendre rendez-vous.",
    image: "photos/hero.webp",
    imageAlt:
      "Assiette de quinoa et de légumes, entourée de produits frais sur un plan de travail clair.",
  },
];

export function pageById(id: PageId) {
  const page = pages.find((item) => item.id === id);
  if (!page) throw new Error(`Page inconnue : ${id}`);
  return page;
}

export function pageByPath(path: string): PageMeta {
  const normalized = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  return pages.find((item) => item.path === normalized && item.id !== "not-found") ?? pageById("not-found");
}
