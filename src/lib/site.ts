/**
 * Identité, coordonnées et données factuelles.
 * Remplacez les valeurs entre crochets et les URL Calendly.
 * Aucun tarif n’est publié : le montant est communiqué avant la consultation, lors de la prise de rendez-vous.
 * Ne pas y inscrire de donnée inventée : tant qu’une valeur est un placeholder,
 * elle n’est pas publiée dans les données structurées (téléphone, e-mail, adresse).
 */
export const site = {
  firstName: "Nicolas",
  lastName: "Boyer",
  fullName: "Nicolas Boyer",
  legalName: "Nicolas Boyer EI",
  jobTitle: "Diététicien-nutritionniste",
  area: "Condrieu",
  practiceLine:
    "Exercice libéral. Consultations en visioconférence partout en France et en déplacement dans le secteur de Condrieu.",

  phoneDisplay: "[Téléphone à compléter]",
  phoneTel: "",
  email: "[E-mail à compléter]",
  address: "[Adresse professionnelle à compléter]",
  siren: "[SIREN]",
  registration: "[Immatriculation à compléter]",
  rpps: "[RPPS]",
  professionalRecord: "[Enregistrement professionnel à compléter]",
  diploma: "[Diplôme à compléter]",
  experiences:
    "Milieu hospitalier — Expérience en diabétologie, en pédiatrie et en médecine générale.",
  sportBackground: "Milieu sportif — Accompagnement nutritionnel de pratiquants de MMA.",
  vat: "[Régime de TVA à compléter, si applicable]",
  communes: ["Condrieu", "Vienne", "Saint-Clair-du-Rhône", "Ampuis"],
  videoTool: "[Outil de visio à compléter]",
  cancelDelay: "24 h",
  paymentMethods: "virement et espèces",
  durationInitial: "60 minutes",
  durationFollowUp: "30 à 45 minutes",
  googleBusinessUrl: "",

  mediatorName: "[Nom du médiateur de la consommation à compléter]",
  mediatorUrl: "",
  mediatorAddress: "[Adresse du médiateur à compléter]",

  host: {
    name: "GitHub Pages",
    company: "GitHub, Inc.",
    address: "88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis",
    url: "https://pages.github.com/",
    contact: "https://support.github.com/",
  },

  url: "https://habjeb.github.io/maquette-dieteticien/",

  booking: {
    general: "https://calendly.com/placeholder-nicolas-boyer/rendez-vous",
    bilanVisio: "https://calendly.com/placeholder-nicolas-boyer/bilan-visio",
    bilanDeplacement: "https://calendly.com/placeholder-nicolas-boyer/bilan-deplacement",
    suiviVisio: "https://calendly.com/placeholder-nicolas-boyer/suivi-visio",
    suiviDeplacement: "https://calendly.com/placeholder-nicolas-boyer/suivi-deplacement",
  },

  privacyNote:
    "Aucune donnée de santé n’est demandée lors de la prise de rendez-vous.",
} as const;

export const tariffSentence =
  "Le tarif est communiqué avant la consultation, lors de la prise de rendez-vous.";

export function isRealPhone(value: string) {
  return /^\+[1-9]\d{8,14}$/.test(value);
}

export function isRealEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function buildVCard() {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Boyer;Nicolas;;;",
    "FN:Nicolas Boyer",
    `TITLE:${site.jobTitle}`,
    `URL:${site.url}carte/`,
  ];
  if (isRealPhone(site.phoneTel)) lines.push(`TEL;TYPE=CELL:${site.phoneTel}`);
  if (isRealEmail(site.email)) lines.push(`EMAIL;TYPE=INTERNET:${site.email}`);
  lines.push(
    `NOTE:${site.practiceLine}`,
  );
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export type Offer = {
  id: string;
  group: string;
  name: string;
  modality: string;
  duration: string;
  href: string;
  label: string;
};

export const offers: Offer[] = [
  {
    id: "bilan-visio",
    group: "Bilan initial",
    name: "Visioconférence",
    modality: "Visioconférence",
    duration: site.durationInitial,
    href: site.booking.bilanVisio,
    label: "Prendre rendez-vous : bilan initial en visioconférence",
  },
  {
    id: "bilan-deplacement",
    group: "Bilan initial",
    name: "Déplacement",
    modality: "Déplacement",
    duration: site.durationInitial,
    href: site.booking.bilanDeplacement,
    label: "Prendre rendez-vous : bilan initial en déplacement",
  },
  {
    id: "suivi-visio",
    group: "Consultation de suivi",
    name: "Visioconférence",
    modality: "Visioconférence",
    duration: site.durationFollowUp,
    href: site.booking.suiviVisio,
    label: "Prendre rendez-vous : suivi en visioconférence",
  },
  {
    id: "suivi-deplacement",
    group: "Consultation de suivi",
    name: "Déplacement",
    modality: "Déplacement",
    duration: site.durationFollowUp,
    href: site.booking.suiviDeplacement,
    label: "Prendre rendez-vous : suivi en déplacement",
  },
];
