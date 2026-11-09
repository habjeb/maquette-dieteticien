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
    width: 1100,
    height: 940,
    alt: "Portrait d’illustration d’un homme au regard calme. À remplacer par la photo de Nicolas Boyer.",
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
    title: "Équilibre alimentaire",
    photo: photos.equilibre,
    summary:
      "Améliorer les habitudes alimentaires, organiser les repas et, si cela fait partie de votre demande, parler du poids. L’objectif est un rythme tenable, pas un modèle imposé.",
    detail:
      "Il peut s’agir de repas plus réguliers, de courses plus simples, ou d’une autre façon de composer l’assiette. La gestion du poids, lorsqu’elle est souhaitée, se discute à partir de votre situation : elle n’est ni un préalable, ni une promesse.",
    points: [
      "Habitudes alimentaires",
      "Organisation des repas",
      "Gestion du poids, seulement si vous le souhaitez",
      "Une alimentation que l’on peut tenir dans la durée",
    ],
  },
  {
    id: "pathologies",
    title: "Pathologies et nutrition thérapeutique",
    photo: photos.consultation,
    summary:
      "Prise en charge nutritionnelle individualisée, adaptée à la situation et aux recommandations applicables. Le diététicien ne pose pas de diagnostic et ne remplace pas le médecin.",
    detail:
      "Vous pouvez consulter lorsqu’une maladie, un traitement ou un symptôme appelle des adaptations alimentaires, dans le champ de compétence du diététicien. Rien de tout cela n’est demandé sur ce site : l’échange a lieu pendant la consultation.",
    points: [
      "Situation personnelle, sans schéma unique",
      "Repères compatibles avec un suivi médical déjà en cours",
      "Recommandations expliquées, pas imposées",
      "Aucun dossier patient conservé sur ce site",
    ],
  },
  {
    id: "sport",
    title: "Nutrition sportive",
    photo: photos.sport,
    summary:
      "Alimentation autour de l’entraînement, de la récupération et des échéances, que la pratique soit de loisir ou plus structurée. La performance n’est pas un résultat promis.",
    detail:
      "La composition corporelle peut être un repère parmi d’autres. Elle n’est pas une fin en soi. La nutrition sportive est un domaine d’intérêt ; elle ne résume pas une pratique qui reste généraliste.",
    points: [
      "Repas autour des séances",
      "Récupération",
      "Préparation d’une échéance",
      "Composition corporelle, si elle est pertinente pour vous",
    ],
  },
] as const;

export const steps = [
  {
    title: "Bilan initial",
    text: "Nous faisons le point sur votre situation, vos habitudes, votre mode de vie, vos besoins et vos objectifs. Ce premier échange sert à comprendre le contexte avant toute recommandation.",
  },
  {
    title: "Accompagnement personnalisé",
    text: "Les objectifs sont précisés avec vous. Les recommandations sont adaptées, réalistes et individualisées : elles tiennent compte de ce que vous pouvez mettre en place.",
  },
  {
    title: "Suivi et ajustements",
    text: "Le suivi permet de regarder ce qui évolue, d’ajuster les repères et de poursuivre l’accompagnement dans la durée, au rythme convenu ensemble.",
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
    a: `Oui. Des consultations en visioconférence sont proposées, ainsi que des rendez-vous en déplacement dans le secteur de ${site.area}. Le lien de connexion est envoyé après la réservation, avec le message de confirmation. L’outil utilisé sera précisé : ${site.videoTool}.`,
  },
  {
    id: "communes",
    q: "Dans quelles communes intervenez-vous ?",
    a: `Les déplacements concernent le secteur de ${site.area}. La liste des communes sera publiée ici : ${site.communes}. Hors de ce secteur, la consultation en visioconférence reste possible.`,
  },
  {
    id: "annulation",
    q: "Comment modifier ou annuler un rendez-vous ?",
    a: `Le message de confirmation contient un lien pour modifier ou annuler le créneau. Le délai à respecter sera indiqué lors de la réservation : ${site.cancelDelay}. Au-delà, les conditions décrites dans les conditions générales de vente s’appliquent.`,
  },
  {
    id: "paiement",
    q: "Quels moyens de paiement acceptez-vous ?",
    a: `Les moyens de paiement seront indiqués ici : ${site.paymentMethods}. Le règlement ne s’effectue pas sur ce site. Les modalités vous sont précisées avant le rendez-vous.`,
  },
] as const;
