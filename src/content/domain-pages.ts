import type { DomainId } from "./editorial";

export type DomainFaq = {
  id: string;
  q: string;
  a: string;
  links?: readonly { href: string; label: string }[];
};

export type DomainBody = {
  forWhom: string;
  objectives: string;
  course: string;
  situations: readonly string[];
  medical: string | null;
  faq: readonly DomainFaq[];
};

export const domainBodies: Record<DomainId, DomainBody> = {
  equilibre: {
    forWhom:
      "Cet accompagnement s’adresse à toute personne qui souhaite faire le point sur son alimentation et trouver des repères adaptés à son quotidien. Si vous souhaitez parler de votre poids, nous pouvons aussi l’aborder en consultation.",
    objectives:
      "L’idée est de trouver des habitudes alimentaires qui vous conviennent au fil de la semaine, en tenant compte de vos horaires, de vos goûts, de votre budget et de votre vie familiale ou professionnelle.",
    course:
      "Lors du premier bilan, nous faisons le point sur vos habitudes et choisissons ensemble les premiers changements à essayer. Si vous souhaitez poursuivre, les rendez-vous de suivi permettent de faire le point sur ce qui vous a aidé et d’ajuster les conseils.",
    situations: [
      "Vos horaires changent et vous avez du mal à trouver le temps de manger dans la journée.",
      "Vous manquez d’idées pour les repas et aimeriez simplifier vos courses.",
      "Vous vous demandez comment composer des repas équilibrés avec les aliments que vous aimez.",
    ],
    medical: null,
    faq: [
      {
        id: "poids",
        q: "Faut-il avoir un objectif de poids pour consulter ?",
        a: "Non. Le poids peut être abordé si vous le souhaitez. Il peut aussi rester en dehors de l’accompagnement. Ce n’est ni un préalable, ni une promesse.",
      },
      {
        id: "programme",
        q: "Proposez-vous un programme alimentaire type ?",
        a: "Non. Il n’y a pas de schéma unique ni de menu standard. Les repères partent de vos habitudes, de vos contraintes et de ce que vous pouvez tenir.",
      },
      {
        id: "clarifier",
        q: "Peut-on commencer sans objectif déjà formulé ?",
        a: "Oui. Le bilan sert justement à clarifier la situation, les besoins et ce qui serait utile. Rien ne doit être décidé avant le rendez-vous.",
      },
    ],
  },
  pathologies: {
    forWhom:
      "Cet accompagnement s’adresse aux personnes qui souhaitent adapter leur alimentation en raison d’une pathologie, d’un traitement ou de symptômes qui compliquent les repas.",
    objectives:
      "Je vous aide à comprendre les recommandations nutritionnelles liées à votre situation et à les mettre en pratique. Selon vos besoins, nous pouvons travailler sur le choix des aliments, la composition des repas ou leur organisation dans la journée.",
    course:
      "Lors du premier bilan, nous faisons le point sur vos habitudes alimentaires, les difficultés que vous rencontrez et les recommandations que vous avez déjà reçues. Si vous le souhaitez, vous pouvez apporter les documents remis par votre médecin. L’accompagnement diététique s’inscrit en complément de votre suivi médical. Les rendez-vous de suivi permettent d’ajuster les conseils à ce que vous avez pu mettre en place.",
    situations: [
      "Votre traitement modifie votre appétit ou le goût des aliments.",
      "Votre médecin vous a conseillé d’adapter votre alimentation et vous vous demandez comment le faire au quotidien.",
      "Des symptômes compliquent vos repas et vous souhaitez faire le point sur votre alimentation.",
    ],
    medical: null,
    faq: [
      {
        id: "diagnostic",
        q: "Le diététicien pose-t-il un diagnostic ?",
        a: "Non. Le diagnostic et le traitement relèvent du médecin. La consultation de diététique propose des repères alimentaires adaptés à la situation, dans ce cadre.",
      },
      {
        id: "ordonnance",
        q: "Une ordonnance est-elle exigée ?",
        a: "Non. Vous pouvez prendre rendez-vous directement. Les documents déjà remis par un médecin peuvent aider à comprendre le contexte, sans conditionner l’accès à la consultation.",
      },
      {
        id: "ecrit",
        q: "Que faut-il éviter d’écrire en réservant ?",
        a: "N’indiquez pas de motif de santé, de symptôme ni de traitement. Ces éléments se voient en consultation. Le formulaire de rendez-vous se limite à l’organisation.",
      },
    ],
  },
  sport: {
    forWhom:
      "Cet accompagnement s’adresse aux personnes qui souhaitent adapter leur alimentation à leur pratique sportive, qu’elles s’entraînent pour le plaisir, pour progresser ou pour préparer une compétition.",
    objectives:
      "Je vous aide à organiser votre alimentation et votre hydratation pour répondre aux besoins de vos entraînements et soutenir votre récupération. Selon vos objectifs, nous pouvons également aborder la prise de masse musculaire ou l’évolution de votre composition corporelle.",
    course:
      "Lors du premier bilan, nous faisons le point sur votre pratique, votre rythme d’entraînement, vos habitudes alimentaires et vos objectifs. Nous définissons ensemble des ajustements compatibles avec votre quotidien. Le suivi permet de les faire évoluer selon vos sensations, vos contraintes et votre programme d’entraînement.",
    situations: [
      "Vous souhaitez savoir quoi manger avant, pendant ou après vos séances.",
      "Vos entraînements sont difficiles à concilier avec vos horaires de repas.",
      "Vous préparez une course, une compétition ou un stage sportif.",
      "Vous souhaitez adapter votre alimentation à un objectif de prise de masse musculaire ou de composition corporelle.",
    ],
    medical: null,
    faq: [
      {
        id: "performance",
        q: "Une alimentation adaptée suffit-elle à améliorer mes performances ?",
        a: "Non. Une alimentation adaptée peut soutenir vos entraînements, votre récupération et la préparation d’une compétition. Vos performances dépendent aussi d’autres facteurs, comme votre entraînement et votre sommeil.",
      },
      {
        id: "generaliste",
        q: "La nutrition sportive est-elle la seule activité du cabinet ?",
        a: "Non. Je propose aussi des consultations pour faire le point sur votre équilibre alimentaire ou adapter votre alimentation à une pathologie.",
        links: [
          { href: "/equilibre-alimentaire", label: "Équilibre alimentaire" },
          { href: "/pathologies-nutrition-therapeutique", label: "Pathologies et nutrition thérapeutique" },
        ],
      },
    ],
  },
};
