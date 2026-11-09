import type { DomainId } from "./editorial";

export type DomainBody = {
  forWhom: string;
  objectives: string;
  course: string;
  situations: readonly string[];
  medical: string | null;
  faq: readonly { id: string; q: string; a: string }[];
};

export const domainBodies: Record<DomainId, DomainBody> = {
  equilibre: {
    forWhom:
      "Cet accompagnement s’adresse aux personnes qui veulent revoir leurs habitudes alimentaires, simplifier les courses ou les repas, ou parler du poids si cela fait partie de leur demande. Le poids n’est ni une condition pour consulter, ni le seul sujet possible.",
    objectives:
      "L’objectif est un rythme tenable dans votre semaine : horaires, goûts, budget, vie de famille ou de travail. Les repères sont proposés, puis ajustés avec vous. Aucun modèle n’est imposé, et aucun résultat n’est promis.",
    course:
      "Le cadre est celui des autres consultations : un bilan pour comprendre la situation, des repères individualisés, puis un suivi pour les ajuster. Le déroulé du premier échange est précisé au moment du rendez-vous. Rien de tout cela n’est demandé dans le formulaire de réservation.",
    situations: [
      "Des repas sautés, très irréguliers, ou difficiles à organiser dans la journée.",
      "Des courses et une cuisine que vous aimeriez rendre plus simples.",
      "L’envie de composer l’assiette autrement, sans régime figé.",
      "Le souhait d’évoquer le poids, à votre initiative seulement.",
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
      "Cette page concerne les personnes pour qui une maladie, un traitement ou des symptômes amènent à adapter l’alimentation, et qui cherchent des repères concrets. Le médecin reste le référent du diagnostic et du traitement.",
    objectives:
      "Il s’agit de traduire une situation de santé en habitudes compréhensibles, compatibles avec ce qui est déjà en place : traitements, rendez-vous, vie quotidienne. L’accompagnement ne promet pas d’évolution clinique.",
    course:
      "Le premier échange permet de comprendre le contexte. Vous pouvez apporter les documents remis par votre médecin, sans que ce soit une condition. Aucune information de santé n’est demandée sur ce site, ni dans le formulaire de réservation.",
    situations: [
      "Un traitement qui modifie l’appétit, le goût ou les horaires des repas.",
      "Une recommandation médicale déjà donnée, à rendre praticable au quotidien.",
      "Des symptômes qui conduisent à revoir la composition ou le rythme des repas.",
      "Un suivi au long cours, en lien avec l’équipe soignante déjà en place.",
    ],
    medical:
      "L’accompagnement nutritionnel est complémentaire du suivi médical. Il ne pose pas de diagnostic, ne remplace pas une consultation de médecin et ne se substitue pas à un traitement prescrit.",
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
      "Cet accompagnement s’adresse aux personnes qui s’entraînent, en loisir ou de façon plus structurée, et qui veulent relier leurs repas à leurs séances. Il n’est pas réservé aux compétiteurs, et il ne résume pas une pratique qui reste généraliste.",
    objectives:
      "Les repères portent sur le moment des repas, la récupération et, seulement si cela a un sens pour vous, la composition corporelle. Elle n’est pas une fin en soi. La performance n’est pas un résultat promis.",
    course:
      "Le bilan revient sur la pratique, les horaires et les contraintes du quotidien. Les ajustements viennent ensuite, au rythme convenu. En cas de blessure, de symptôme ou de suivi médical, le médecin reste le référent.",
    situations: [
      "Des séances qui tombent loin des repas habituels.",
      "La préparation d’une échéance : course, compétition amateur, stage.",
      "Une récupération difficile à organiser entre les entraînements.",
      "Une question de composition corporelle, uniquement si elle est pertinente pour vous.",
    ],
    medical: null,
    faq: [
      {
        id: "licence",
        q: "Faut-il être licencié ou compétiteur ?",
        a: "Non. La pratique de loisir entre dans ce cadre au même titre qu’un entraînement plus structuré. Le niveau n’est pas une condition.",
      },
      {
        id: "performance",
        q: "La performance est-elle un objectif garanti ?",
        a: "Non. L’alimentation peut accompagner l’entraînement, la récupération et une échéance. Aucun résultat sportif n’est promis.",
      },
      {
        id: "generaliste",
        q: "La nutrition sportive est-elle la seule activité du cabinet ?",
        a: "Non. C’est un domaine d’intérêt, à côté de l’équilibre alimentaire et de la nutrition thérapeutique. La pratique reste généraliste.",
      },
    ],
  },
};
