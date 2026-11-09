/**
 * Identité, coordonnées et données factuelles.
 * Remplacez les valeurs entre crochets, les montants « XX € » et les URL Calendly.
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
  practice:
    "Consultations en visioconférence et en déplacement dans le secteur de Condrieu",

  phoneDisplay: "[Téléphone à compléter]",
  phoneTel: "",
  email: "[E-mail à compléter]",
  address: "[Adresse professionnelle à compléter]",
  siren: "[SIREN]",
  registration: "[Immatriculation à compléter]",
  rpps: "[RPPS]",
  professionalRecord: "[Enregistrement professionnel à compléter]",
  diploma: "[Diplôme à compléter]",
  experiences: "[Expériences à compléter]",
  sportBackground: "[Expérience sportive à compléter]",
  vat: "[Régime de TVA à compléter, si applicable]",
  communes: "[Communes desservies à compléter]",
  videoTool: "[Outil de visio à compléter]",
  cancelDelay: "[Délai d’annulation à compléter]",
  paymentMethods: "[Moyens de paiement à compléter]",
  price: "XX €",
  duration: "[Durée à compléter]",
  travelFee: "[Frais de déplacement à compléter]",
  otherFees: "[Autres frais éventuels à compléter]",
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
    "NOTE:Diététicien-nutritionniste. Consultations en visioconférence et en déplacement, secteur de Condrieu.",
  );
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export type Offer = {
  id: string;
  group: string;
  name: string;
  description: string;
  modality: string;
  extra: string;
  href: string;
  label: string;
};

export const offers: Offer[] = [
  {
    id: "bilan-visio",
    group: "Bilan initial",
    name: "Visioconférence",
    description:
      "Premier échange à distance : situation, habitudes, mode de vie, besoins et objectifs. Les repères proposés restent à ajuster ensuite.",
    modality: "Visioconférence",
    extra: "Pas de frais de déplacement.",
    href: site.booking.bilanVisio,
    label: "Prendre rendez-vous : bilan initial en visioconférence",
  },
  {
    id: "bilan-deplacement",
    group: "Bilan initial",
    name: "Déplacement",
    description:
      "Même bilan, au lieu convenu dans le secteur de Condrieu. Le périmètre exact et les frais de route sont annoncés avant la confirmation.",
    modality: "Déplacement",
    extra: `Frais de déplacement : ${site.travelFee}. Annoncés avant la confirmation.`,
    href: site.booking.bilanDeplacement,
    label: "Prendre rendez-vous : bilan initial en déplacement",
  },
  {
    id: "suivi-visio",
    group: "Consultation de suivi",
    name: "Visioconférence",
    description:
      "Point sur ce qui a pu être mis en place, et ajustement des repères. Le rythme du suivi se décide ensemble.",
    modality: "Visioconférence",
    extra: "Pas de frais de déplacement.",
    href: site.booking.suiviVisio,
    label: "Prendre rendez-vous : suivi en visioconférence",
  },
  {
    id: "suivi-deplacement",
    group: "Consultation de suivi",
    name: "Déplacement",
    description:
      "Suivi sur place, dans le secteur de Condrieu. Tout frais supplémentaire est indiqué avant le rendez-vous.",
    modality: "Déplacement",
    extra: `Frais de déplacement : ${site.travelFee}. ${site.otherFees}.`,
    href: site.booking.suiviDeplacement,
    label: "Prendre rendez-vous : suivi en déplacement",
  },
];
