import { sitePath } from "./paths";

const home = sitePath("/");

export const NAV = [
  { id: "accueil", href: `${home}#accueil`, label: "Accueil" },
  { id: "accompagnements", href: `${home}#accompagnements`, label: "Accompagnements" },
  { id: "a-propos", href: `${home}#a-propos`, label: "À propos" },
  { id: "methode", href: `${home}#methode`, label: "Méthode" },
  { id: "tarifs", href: `${home}#tarifs`, label: "Tarifs" },
  { id: "faq", href: `${home}#faq`, label: "FAQ" },
] as const;

export const SECTION_IDS = NAV.map((item) => item.id);
