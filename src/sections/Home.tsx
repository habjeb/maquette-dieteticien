import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { mountHomeMotion, resyncReveals } from "../fx/motion";
import { FaqList } from "../components/FaqList";
import { BookLink, Photo } from "../components/ui";
import { domains, faq, heroText, heroTitle, photos, steps } from "../content/editorial";
import { openDomain, syncPillWindows } from "../fx/domainFlip";
import { heroTitleFont } from "../lib/heroFont";
import { publicAsset, sitePath } from "../lib/paths";
import { offers, site, tariffSentence } from "../lib/site";
import { A, useRoute } from "../router";

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
      <Sectors />
      <Consultations />
      <About />
      <Faq />
      <CallBand />
      <Markers />
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
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wash, setWash] = useState(() => "gpu" in navigator && Boolean(navigator.gpu));

  useEffect(() => {
    if (!wash) return;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    void (async () => {
      try {
        const adapter = await navigator.gpu?.requestAdapter({ powerPreference: "low-power" });
        if (!adapter || cancelled) {
          if (!cancelled) setWash(false);
          return;
        }
        const mod = await import("../fx/heroWash");
        if (cancelled) return;
        stop = mod.startHeroWash(canvas, section, {
          onReady: () => canvas.classList.add("is-live"),
          onFallback: () => {
            if (!cancelled) setWash(false);
          },
        });
        if (cancelled) stop();
      } catch {
        if (!cancelled) setWash(false);
      }
    })();
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [wash]);

  return (
    <section className="home-hero" id="accueil" ref={sectionRef}>
      {wash ? <canvas ref={canvasRef} className="home-hero-wash" aria-hidden="true" /> : null}
      <div className="container home-hero-grid">
        <Reveal className="home-hero-copy">
          <h1 className={`home-hero-title is-${heroTitleFont}`} data-reveal="title" data-reveal-after="intro">
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
    </section>
  );
}

function Sectors() {
  const { navigate } = useRoute();
  const [active, setActive] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, y: 0, moved: false });

  useLayoutEffect(() => {
    const update = () => syncPillWindows();
    update();
    const row = scroller.current;
    const onRowScroll = () => {
      update();
      if (!row || window.innerWidth >= 900) return;
      const cards = [...row.querySelectorAll<HTMLElement>(".sector-card")];
      const center = row.scrollLeft + row.clientWidth / 2;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(cardCenter - center);
        if (dist < bestDist) {
          best = index;
          bestDist = dist;
        }
      });
      setActive((current) => (current === best ? current : best));
    };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    row?.addEventListener("scroll", onRowScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
      row?.removeEventListener("scroll", onRowScroll);
    };
  }, []);

  function showCard(index: number) {
    const row = scroller.current;
    const card = row?.querySelectorAll<HTMLElement>(".sector-card")[index];
    if (!row || !card) return;
    setActive(index);
    row.scrollTo({ left: card.offsetLeft - (row.clientWidth - card.offsetWidth) / 2, behavior: "smooth" });
  }

  return (
    <section className="sector-stage" id="accompagnements" aria-labelledby="secteurs-titre">
      <p className="section-kicker sector-kicker">
        <span>01</span> Accompagnements
      </p>
      <h2 id="secteurs-titre" className="sector-title">
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
        onPointerDown={(event) => {
          drag.current = { x: event.clientX, y: event.clientY, moved: false };
        }}
        onPointerMove={(event) => {
          if (event.buttons === 0) return;
          if (Math.hypot(event.clientX - drag.current.x, event.clientY - drag.current.y) > 12) {
            drag.current.moved = true;
          }
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          event.preventDefault();
          const next = event.key === "ArrowRight" ? (active + 1) % domains.length : (active + domains.length - 1) % domains.length;
          setActive(next);
          const card = scroller.current?.querySelectorAll<HTMLElement>(".sector-card")[next];
          card?.focus();
        }}
      >
        {domains.map((domain, index) => {
          const href = sitePath(domain.path);
          const opened = index === active;
          return (
            <A
              className={`sector-card${opened ? " is-active" : ""}`}
              key={domain.id}
              href={href}
              data-pill={domain.id}
              aria-label={`Découvrir ${domain.title}`}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={(event) => {
                if (drag.current.moved) {
                  event.preventDefault();
                  return;
                }
                const card = event.currentTarget;
                event.preventDefault();
                void openDomain({ id: domain.id, source: card, href, navigate });
              }}
            >
              <div className="sector-body">
                <h3>{domain.title}</h3>
                <p>{domain.summary}</p>
                <span className="sector-rule" aria-hidden="true" />
                <span className="sector-link">
                  <span>Découvrir</span>
                  <span className="sector-arrow" aria-hidden="true">
                    →
                  </span>
                </span>
              </div>
              <span className="pill-media sector-zoom">
                <Photo {...domain.photo} />
              </span>
            </A>
          );
        })}
      </div>
      <div className="sector-pager">
        <p className="sector-count" aria-live="polite">
          {active + 1} / {domains.length}
        </p>
        <div className="sector-dots">
          {domains.map((domain, index) => (
            <button
              key={domain.id}
              type="button"
              className={index === active ? "is-on" : ""}
              aria-label={domain.title}
              aria-current={index === active ? "true" : undefined}
              onClick={() => showCard(index)}
            />
          ))}
        </div>
        <p className="sector-hint">Glisser</p>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="home-section" id="a-propos">
      <div className="container">
        <header className="section-head">
          <p className="section-kicker">
            <span>03</span> À propos
          </p>
          <h2 data-reveal="title">À propos et méthode</h2>
        </header>
        <div className="about-layout">
          <figure className="portrait">
            <Photo {...photos.portrait} />
          </figure>
          <div className="about-main">
            <p>
              Je suis diététicien-nutritionniste, en exercice libéral. Je reçois en visioconférence et je me déplace à
              domicile dans la région sud lyonnaise.
            </p>
            <p>
              En consultation, je prends d’abord le temps de comprendre ce qui vous amène, ce qui vous convient déjà et
              ce que vous aimeriez faire évoluer. Je m’appuie sur les recommandations scientifiques pour vous expliquer
              les options qui s’offrent à vous, en tenant compte de vos goûts, de votre rythme de vie, de votre budget
              et, si nécessaire, de votre suivi médical. Ensemble, nous choisissons les premiers changements à essayer,
              à votre rythme.
            </p>
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
          </div>
          <aside className="about-card">
            <p className="section-kicker">Carte de visite</p>
            <img src={publicAsset("carte-qr.svg")} width="148" height="148" alt="QR code vers la carte de visite digitale de Nicolas Boyer" />
            <A className="btn btn-primary" href={sitePath("/carte")}>
              Ouvrir la carte
            </A>
          </aside>
        </div>
        <div className="home-approach">
          <h3 id="methode">Méthode</h3>
          <ol className="steps">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="step-index">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
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
    <section className="home-section home-section-sage home-offers" id="consultations">
      <div className="container">
        <header className="section-head">
          <p className="section-kicker">
            <span>02</span> Consultations
          </p>
          <h2 data-reveal="title">Modalités de consultation</h2>
          <p className="lede" data-reveal="lines">
            {tariffSentence}
          </p>
        </header>
        <div className="home-offers-grid" data-booking-visible>
          {groups.map((group) => (
            <Reveal key={group.id}>
              <article className="home-offer" id={group.id}>
                <h3>{group.name}</h3>
                <p className="home-offer-price">{group.id === "bilan" ? site.priceInitial : site.priceFollowUp}</p>
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
          <p className="section-kicker section-kicker-light">
            <span>05</span> Rendez-vous
          </p>
          <h2 data-reveal="title">Prendre rendez-vous</h2>
          <p data-reveal="lines">
            {site.practiceLine} {tariffSentence} {site.privacyNote}
          </p>
          <p className="home-contact">
            <a href={`tel:${site.phoneTel}`}>{site.phoneDisplay}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
          <BookLink href={site.booking.general} label="Prendre rendez-vous" className="btn btn-light">
            Prendre rendez-vous
          </BookLink>
        </Reveal>
        <Reveal className="home-call-photo">
          <Photo {...photos.portrait} />
        </Reveal>
      </div>
    </section>
  );
}

function Markers() {
  return (
    <section className="home-section home-markers" id="reperes" aria-labelledby="reperes-titre">
      <div className="container">
        <header className="section-head">
          <p className="section-kicker">
            <span>06</span> Repères
          </p>
          <h2 id="reperes-titre" data-reveal="title">
            Repères pratiques
          </h2>
        </header>
        <ul className="home-marker-grid">
          <li>
            <a href={`tel:${site.phoneTel}`}>{site.phoneDisplay}</a>
          </li>
          <li>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </li>
          <li>Diplôme : {site.diploma}</li>
          <li>Visioconférence partout en France</li>
          <li>Déplacement dans le secteur de {site.area}</li>
          <li>{site.communes.join(", ")}</li>
          <li>{site.experiences}</li>
          <li>{site.sportBackground}</li>
          <li>
            Bilan initial : {site.durationInitial}, {site.priceInitial}
          </li>
          <li>
            Consultation de suivi : {site.durationFollowUp}, {site.priceFollowUp}
          </li>
          <li>Annulation : {site.cancelDelay}</li>
          <li>Règlement : {site.paymentMethods}</li>
        </ul>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="home-section home-faq" id="faq">
      <div className="container faq-layout">
        <Reveal>
          <p className="section-kicker">
            <span>04</span> FAQ
          </p>
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
