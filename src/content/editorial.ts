import { site } from "../lib/site";

export const heroTitle = "La nutrition au service de votre santé et de vos ambitions.";

export const heroText =
  "Diététicien-nutritionniste, je vous accompagne vers une alimentation adaptée à vos besoins, à votre santé et à vos objectifs, grâce à une approche personnalisée et fondée sur les connaissances scientifiques.";

export const photos = {
  hero: {
    src: "photos/hero.webp",
    width: 1500,
    height: 1000,
    alt: "Assiette de quinoa et de légumes, entourée de produits frais sur un plan de travail clair.",
  },
  equilibre: {
    src: "photos/equilibre.webp",
    width: 1200,
    height: 1800,
    alt: "Assiette de riz, de courgettes et d’œufs sur une vaisselle vert sauge, posée sur un linge rayé.",
  },
  consultation: {
    src: "photos/consultation.webp",
    width: 1600,
    height: 1066,
    alt: "Deux personnes en conversation, assises à une table claire près d’une grande fenêtre.",
  },
  sport: {
    src: "photos/sport.webp",
    width: 1100,
    height: 1650,
    alt: "Coureur en veste sombre, vu de loin, sur une route dégagée sous un ciel clair.",
  },
  portrait: {
    src: "photos/portrait.webp",
    srcSet: "photos/portrait-320.webp 316w, photos/portrait.webp 632w",
    sizes: "210px",
    width: 632,
    height: 634,
    alt: "Nicolas Boyer, diététicien-nutritionniste",
  },
  saone: {
    src: "photos/saone.webp",
    width: 1600,
    height: 1006,
    alt: "Quais de la Saône à Lyon : façades claires, colline boisée et ciel lumineux. Photo d’illustration, ce n’est pas le lieu de consultation.",
  },
} as const;

export const domains = [
  {
    id: "equilibre",
    path: "/equilibre-alimentaire",
    title: "Équilibre alimentaire",
    photo: photos.equilibre,
    summary:
      "Trouvez des repères pour équilibrer vos repas et les organiser selon votre rythme de vie. Si le poids fait partie de vos préoccupations, nous pouvons aussi en parler en consultation.",
  },
  {
    id: "pathologies",
    path: "/pathologies-nutrition-therapeutique",
    title: "Pathologies et nutrition thérapeutique",
    photo: photos.consultation,
    summary:
      "Adaptez votre alimentation à votre état de santé. Je vous aide à mettre en pratique les recommandations nutritionnelles liées à votre pathologie, en tenant compte de vos habitudes et de vos contraintes.",
  },
  {
    id: "sport",
    path: "/nutrition-sportive",
    title: "Nutrition sportive",
    photo: photos.sport,
    summary:
      "Adaptez vos repas et votre hydratation à vos entraînements pour mieux gérer votre énergie pendant l’effort et soutenir votre récupération, que vous pratiquiez pour le plaisir ou que vous prépariez une compétition.",
  },
] as const;

export type DomainId = (typeof domains)[number]["id"];

export const steps = [
  {
    title: "Bilan initial",
    text: "Nous faisons le point sur vos habitudes alimentaires, votre mode de vie et vos objectifs. Ce premier rendez-vous me permet de comprendre votre situation avant de vous proposer des conseils.",
  },
  {
    title: "Accompagnement personnalisé",
    text: "Nous définissons vos priorités et les traduisons en actions concrètes.",
  },
  {
    title: "Suivi et ajustements",
    text: "Lors des rendez-vous de suivi, nous revenons sur ce que vous avez essayé, ce qui vous a aidé et les difficultés rencontrées. Nous ajustons les conseils en fonction de votre expérience.",
  },
] as const;

export const faq = [
  {
    id: "deroulement",
    q: "Comment se déroule une première consultation ?",
    a: "La première consultation est un bilan. Elle permet d’échanger sur votre situation, vos habitudes alimentaires, votre mode de vie, vos besoins et vos objectifs. Des repères peuvent être proposés à la fin de cet échange, puis ajustés au fil du suivi. Le déroulé précis vous est indiqué au moment de la prise de rendez-vous. Aucune donnée de santé n’est demandée dans le formulaire de réservation.",
  },
  {
    id: "ordonnance",
    q: "Faut-il une ordonnance pour consulter ?",
    a: "Non. Une ordonnance n’est pas nécessaire pour consulter un diététicien-nutritionniste en exercice libéral. Vous pouvez prendre rendez-vous directement. Si un médecin vous suit, vous pouvez apporter les documents qu’il vous a remis : ils aident à comprendre le contexte, sans conditionner l’accès à la consultation.",
  },
  {
    id: "remboursement",
    q: "Les consultations sont-elles remboursées ?",
    a: "En règle générale, les consultations de diététique en exercice libéral ne sont pas remboursées par l’Assurance maladie. Certaines mutuelles prévoient une prise en charge, selon le contrat souscrit. Renseignez-vous auprès de votre complémentaire. Aucun montant de remboursement ne peut être indiqué ici.",
  },
  {
    id: "visio",
    q: "Proposez-vous des consultations en visio ?",
    a: `Oui. Les consultations en visioconférence sont proposées partout en France. Les déplacements concernent le secteur de ${site.area}. Le lien de connexion est envoyé après la réservation, avec le message de confirmation. L’outil utilisé sera précisé : ${site.videoTool}.`,
  },
  {
    id: "communes",
    q: "Dans quelles communes intervenez-vous ?",
    a: `Les déplacements concernent le secteur de ${site.area} : ${site.communes.join(", ")}. Hors de ce secteur, la consultation en visioconférence reste possible.`,
  },
  {
    id: "annulation",
    q: "Comment modifier ou annuler un rendez-vous ?",
    a: "Le message de confirmation contient un lien pour modifier ou annuler le créneau. Le délai d’annulation est de 24 h. Au-delà, prévenez par téléphone en cas d’urgence.",
  },
] as const;
