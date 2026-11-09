import { faq, heroText, heroTitle } from "../content/editorial";
import { pageById, pages, type PageMeta } from "../content/pages";
import { site } from "../lib/site";

export type HeadPage = PageMeta & {
  url: string;
  jsonld: unknown;
  noscript: string;
};

function absolute(path: string) {
  if (path === "/" || path === "") return site.url;
  return `${site.url}${path.replace(/^\//, "")}/`;
}

function imageUrl(file: string) {
  return `${site.url}${file.replace(/^\//, "")}`;
}

function website() {
  return {
    "@type": "WebSite",
    "@id": `${site.url}#site`,
    name: site.fullName,
    url: site.url,
    inLanguage: "fr-FR",
  };
}

function dietitian(description: string) {
  return {
    "@type": "Dietitian",
    "@id": `${site.url}#praticien`,
    name: site.fullName,
    description,
    url: site.url,
    image: imageUrl("photos/hero.webp"),
    areaServed: { "@type": "City", name: site.area },
    availableLanguage: "fr",
    knowsAbout: ["Diététique", "Nutrition", "Nutrition sportive"],
  };
}

function faqPage() {
  return {
    "@type": "FAQPage",
    "@id": `${site.url}#faq`,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

function person() {
  return {
    "@type": "Person",
    name: site.fullName,
    jobTitle: site.jobTitle,
    image: imageUrl("photos/portrait.webp"),
    url: absolute("/carte"),
    workLocation: { "@type": "City", name: site.area },
  };
}

function breadcrumb(page: PageMeta) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: site.url },
      { "@type": "ListItem", position: 2, name: page.title.split("|")[0]?.trim() || page.title, item: absolute(page.path) },
    ],
  };
}

function graphFor(page: PageMeta) {
  const home = pageById("home");
  if (page.id === "home") {
    return {
      "@context": "https://schema.org",
      "@graph": [website(), dietitian(home.description), faqPage()],
    };
  }
  if (page.id === "carte") {
    return {
      "@context": "https://schema.org",
      "@graph": [website(), person(), breadcrumb(page)],
    };
  }
  return {
    "@context": "https://schema.org",
    "@graph": [
      website(),
      {
        "@type": "WebPage",
        name: page.title,
        description: page.description,
        url: absolute(page.path === "/404" ? "/" : page.path),
        isPartOf: { "@id": `${site.url}#site` },
        inLanguage: "fr-FR",
      },
      ...(page.id === "not-found" ? [] : [breadcrumb(page)]),
    ],
  };
}

function noscriptFor(page: PageMeta) {
  if (page.id === "home") {
    return `<main><h1>${heroTitle}</h1><p>${heroText}</p><p>Secteur de ${site.area}. Consultations en visioconférence et en déplacement.</p><p><a href="${site.booking.general}">Prendre rendez-vous</a></p></main>`;
  }
  const heading = page.title.split("|")[0]?.trim() ?? page.title;
  return `<main><h1>${heading}</h1><p>${page.description}</p><p><a href="${site.url}">Retour à l’accueil</a></p></main>`;
}

export const manifest: { pages: HeadPage[] } = {
  pages: pages.map((page) => ({
    ...page,
    url: page.id === "not-found" ? site.url : absolute(page.path),
    jsonld: graphFor(page),
    noscript: noscriptFor(page),
  })),
};
