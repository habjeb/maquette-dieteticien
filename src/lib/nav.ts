import { domains } from "../content/editorial";
import { sitePath } from "./paths";

const home = sitePath("/");

export type NavChild = { id: string; href: string; label: string };

export type NavItem = {
  id: string;
  href: string;
  label: string;
  children?: readonly NavChild[];
};

export const NAV: readonly NavItem[] = [
  { id: "accueil", href: `${home}#accueil`, label: "Accueil" },
  {
    id: "accompagnements",
    href: `${home}#accompagnements`,
    label: "Accompagnements",
    children: domains.map((domain) => ({
      id: domain.id,
      href: sitePath(domain.path),
      label: domain.title,
    })),
  },
  { id: "consultations", href: `${home}#consultations`, label: "Consultations" },
  { id: "a-propos", href: `${home}#a-propos`, label: "À propos" },
  { id: "faq", href: `${home}#faq`, label: "FAQ" },
  { id: "rendez-vous", href: `${home}#rendez-vous`, label: "Rendez-vous" },
  { id: "reperes", href: `${home}#reperes`, label: "Repères" },
];

export const SECTION_IDS = NAV.map((item) => item.id);
