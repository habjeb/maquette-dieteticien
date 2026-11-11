import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { mountHomeMotion, resyncReveals } from "../fx/motion";
import { FaqList } from "../components/FaqList";
import { BookLink, Photo } from "../components/ui";
import { domains, faq, heroText, heroTitle, photos, steps } from "../content/editorial";
import { openDomain, syncPillWindows } from "../fx/domainFlip";
import { publicAsset, sitePath } from "../lib/paths";
import { offers, site, tariffSentence } from "../lib/site";
import { A, useRoute } from "../router";

const markers = [
  "Visioconférence partout en France",
  `Déplacement dans le secteur de ${site.area}`,
  site.communes.join(", "),
  site.experiences,
  site.sportBackground,
  `Bilan initial : ${site.durationInitial}`,
  `Consultation de suivi : ${site.durationFollowUp}`,
  `Annulation : ${site.cancelDelay}`,
  `Règlement : ${site.paymentMethods}`,
] as const;

export function HomePage() {
  useLayoutEffect(() => {
    resyncReveals();
  });
  useEffect(() => {
    mountHomeMotion();
  }, []);
  return (
    <div className="home">
      <Hero />
      <Statement />
      <Sectors />
      <About />
      <Consultations />
      <CallBand />
      <Markers />
      <Faq />
    </div>
  );
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.classList.add("is-in");
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        node.classList.add("is-in");
        observer.disconnect();
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}

function Hero() {
  const { navigate } = useRoute();
  useLayoutEffect(() => {
    const update = () => syncPillWindows();
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    const row = document.querySelector(".pill-row");
    row?.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
      row?.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <section className="home-hero" id="accueil">
      <div className="container home-hero-grid">
        <Reveal>
          <h1 data-reveal="title" data-reveal-after="intro">
            {heroTitle}
          </h1>
          <p className="lede home-hero-lede" data-reveal="lines" data-reveal-after="intro">
            {heroText}
          </p>
        </Reveal>
        <Reveal className="home-hero-photo">
          <Photo {...photos.hero} priority />
        </Reveal>
      </div>
      <div className="container" id="accompagnements">
        <div className="pill-row">
          {domains.map((domain) => {
            const href = sitePath(domain.path);
            return (
              <article className="pill-card" key={domain.id}>
                <A
                  className="pill-hit"
                  href={href}
                  onClick={(event) => {
                    const media = event.currentTarget.querySelector(".pill-media");
                    if (!(media instanceof HTMLElement)) return;
                    event.preventDefault();
                    void openDomain({ id: domain.id, source: media, href, navigate });
                  }}
                >
                  <span className="pill-media" data-pill={domain.id}>
                    <Photo {...domain.photo} />
                  </span>
                  <span className="pill-copy">
                    <h3>{domain.title}</h3>
                    <p>{domain.summary}</p>
                  </span>
                </A>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Statement() {
  return (
    <section className="home-statement">
      <div className="container">
        <Reveal>
          <p data-reveal="lines">
            Du premier bilan aux rendez-vous de suivi, nous définissons ensemble les étapes qui vous conviennent.
          </p>
          <A className="btn btn-primary" href={`${sitePath("/")}#accompagnements`}>
            Découvrir les accompagnements
          </A>
        </Reveal>
      </div>
    </section>
  );
}

function Sectors() {
  const { navigate } = useRoute();
  const [active, setActive] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = scroller.current;
    if (!row) return;
    const update = () => syncPillWindows();
    row.addEventListener("scroll", update, { passive: true });
    return () => row.removeEventListener("scroll", update);
  }, []);

  return (
    <section className="sector-stage" aria-labelledby="secteurs-titre">
      <h2 id="secteurs-titre" className="sr-only">
        Domaines d’accompagnement
      </h2>
      <div className="sector-bgs" aria-hidden="true">
        {domains.map((domain, index) => (
          <img
            key={domain.id}
            className={index === active ? "is-on" : ""}
            src={publicAsset(domain.photo.src)}
            alt=""
          />
        ))}
      </div>
      <div
        className="sector-cards"
        ref={scroller}
        onKeyDown={(event) => {
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          event.preventDefault();
          const next = event.key === "ArrowRight" ? (active + 1) % domains.length : (active + domains.length - 1) % domains.length;
          setActive(next);
          const card = scroller.current?.querySelectorAll<HTMLElement>(".sector-card")[next];
          card?.querySelector<HTMLElement>("a")?.focus();
        }}
      >
        {domains.map((domain, index) => {
          const href = sitePath(domain.path);
          const opened = index === active;
          return (
            <article
              className={`sector-card${opened ? " is-active" : ""}`}
              key={domain.id}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
            >
              <div className="sector-body">
                <h3>{domain.title}</h3>
                <p>{domain.summary}</p>
                <span className="sector-rule" aria-hidden="true" />
                <A
                  className="sector-link pill-hit"
                  href={href}
                  aria-label={`Découvrir ${domain.title}`}
                  onClick={(event) => {
                    const media = event.currentTarget.closest(".sector-card")?.querySelector(".pill-media");
                    if (!(media instanceof HTMLElement)) return;
                    event.preventDefault();
                    void openDomain({ id: domain.id, source: media, href, navigate });
                  }}
                >
                  <span>Découvrir</span>
                  <span className="sector-arrow" aria-hidden="true">
                    →
                  </span>
                </A>
              </div>
              <span className="pill-media sector-zoom" data-pill={domain.id}>
                <Photo {...domain.photo} />
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="home-split" id="a-propos">
      <div className="container">
        <Reveal className="home-split-head">
          <h2 data-reveal="title">Un conseil alimentaire doit avoir sa place dans votre quotidien.</h2>
          <div>
            <p data-reveal="lines">
              Je suis diététicien-nutritionniste, en exercice libéral. Je reçois en visioconférence et je me déplace à
              domicile dans la région sud lyonnaise.
            </p>
            <A className="btn btn-primary" href={sitePath("/carte")}>
              Carte de visite
            </A>
          </div>
        </Reveal>
        <Reveal className="home-split-row">
          <h3>
            <span aria-hidden="true">• </span>À propos
          </h3>
          <div>
            <figure className="portrait">
              <Photo {...photos.portrait} />
            </figure>
            <dl className="facts">
              <div>
                <dt>Diplôme</dt>
                <dd>{site.diploma}</dd>
              </div>
              <div>
                <dt>Expérience</dt>
                <dd>
                  {site.experiences}
                  <br />
                  {site.sportBackground}
                </dd>
              </div>
            </dl>
            <p>
              Pour moi, un conseil alimentaire doit avoir sa place dans votre quotidien. En consultation, je prends
              d’abord le temps de comprendre ce qui vous amène, ce qui vous convient déjà et ce que vous aimeriez faire
              évoluer.
            </p>
            <p>
              Je m’appuie sur les recommandations scientifiques pour vous expliquer les options qui s’offrent à vous, en
              tenant compte de vos goûts, de votre rythme de vie, de votre budget et, si nécessaire, de votre suivi
              médical. Ensemble, nous choisissons les premiers changements à essayer, à votre rythme.
            </p>
          </div>
        </Reveal>
        <Reveal className="home-split-row" >
          <h3 id="methode">
            <span aria-hidden="true">• </span>Approche
          </h3>
          <ol className="steps">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="step-index">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

function Consultations() {
  const groups = [
    {
      id: "bilan",
      name: "Bilan initial",
      duration: site.durationInitial,
      items: offers.filter((offer) => offer.group === "Bilan initial"),
    },
    {
      id: "suivi",
      name: "Consultation de suivi",
      duration: site.durationFollowUp,
      items: offers.filter((offer) => offer.group === "Consultation de suivi"),
    },
  ];
  return (
    <section className="home-offers" id="consultations">
      <div className="container">
        <Reveal className="home-offers-head">
          <h2 data-reveal="title">Modalités de consultation</h2>
          <p data-reveal="lines">{tariffSentence}</p>
        </Reveal>
        <div className="home-offers-grid" data-booking-visible>
          {groups.map((group) => (
            <Reveal key={group.id}>
              <article className="home-offer" id={group.id}>
                <h3>{group.name}</h3>
                <p className="home-offer-duration">{group.duration}</p>
                <p>En visioconférence partout en France, ou en déplacement dans le secteur de {site.area}.</p>
                <div className="consult-actions">
                  {group.items.map((offer) => (
                    <BookLink key={offer.id} href={offer.href} label={offer.label}>
                      {offer.name}
                    </BookLink>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallBand() {
  return (
    <section className="home-call" id="rendez-vous" data-booking-visible>
      <div className="container home-call-grid">
        <Reveal>
          <p className="home-call-kicker">Rendez-vous</p>
          <h2 data-reveal="title">Prendre rendez-vous</h2>
          <p data-reveal="lines">
            {site.practiceLine} {tariffSentence} {site.privacyNote}
          </p>
          <BookLink href={site.booking.general} label="Prendre rendez-vous" className="btn btn-light">
            Prendre rendez-vous
          </BookLink>
        </Reveal>
        <Reveal className="home-call-photo">
          <Photo {...photos.portrait} />
        </Reveal>
      </div>
      <div className="home-call-line" aria-hidden="true">
        <span>Prendre rendez-vous</span>
        <span>Visio</span>
        <span>Déplacement</span>
        <span>Prendre rendez-vous</span>
        <span>Visio</span>
        <span>Déplacement</span>
      </div>
    </section>
  );
}

function Markers() {
  return (
    <section className="home-markers" aria-labelledby="reperes-titre">
      <div className="container">
        <Reveal className="home-split-head">
          <h2 id="reperes-titre" data-reveal="title">
            Repères de la pratique
          </h2>
          <p data-reveal="lines">
            Uniquement ce qui est déjà indiqué sur le site. Les diplômes, numéros et logos encore entre crochets ne
            sont pas présentés ici comme des certifications.
          </p>
        </Reveal>
        <ul className="home-marker-grid">
          {markers.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="home-faq" id="faq">
      <div className="container faq-layout">
        <Reveal>
          <h2 data-reveal="title">Questions fréquentes</h2>
          <p data-reveal="lines">
            Les réponses restent générales. Le détail d’une situation se voit en consultation, pas dans un formulaire.
          </p>
        </Reveal>
        <FaqList items={faq} />
      </div>
    </section>
  );
}
