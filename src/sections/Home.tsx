import { useLayoutEffect } from "react";
import { FaqList } from "../components/FaqList";
import { BookLink, Photo, SectionHead } from "../components/ui";
import { domains, faq, heroText, photos, steps } from "../content/editorial";
import { openDomain, syncPillWindows } from "../fx/domainFlip";
import { sitePath } from "../lib/paths";
import { offers, site, tariffSentence } from "../lib/site";
import { A, useRoute } from "../router";

export function HomePage() {
  return (
    <>
      <Hero />
      <Domaines />
      <Presentation />
      <Lieu />
      <Methode />
      <Consultations />
      <Faq />
      <Reservation />
    </>
  );
}

function Hero() {
  return (
    <section className="hero" id="accueil">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="kicker">{site.jobTitle}</p>
          <h1>
            La nutrition au service de votre <em>santé</em> et de vos ambitions.
          </h1>
          <p className="lede">{heroText}</p>
          <div className="hero-actions" id="hero-ctas" data-booking-visible>
            <BookLink href={site.booking.general} label="Prendre rendez-vous">
              Prendre rendez-vous
            </BookLink>
            <A className="btn btn-secondary" href={`${sitePath("/")}#accompagnements`}>
              Découvrir les accompagnements
            </A>
          </div>
        </div>
        <figure className="hero-media">
          <Photo {...photos.hero} priority />
        </figure>
      </div>
    </section>
  );
}

function Domaines() {
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
    <section className="section" id="accompagnements">
      <div className="container">
        <SectionHead
          title="Domaines d’accompagnement"
          intro="Chaque accompagnement commence par un échange sur vos habitudes, vos besoins et vos objectifs. Ensemble, nous définissons des repères que vous pouvez appliquer au quotidien."
        />
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
                  <h3>{domain.title}</h3>
                </A>
                <p>{domain.summary}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Presentation() {
  return (
    <section className="section section-sage" id="a-propos">
      <div className="container about-grid">
        <figure className="portrait">
          <Photo {...photos.portrait} />
        </figure>
        <div>
          <SectionHead
            title="À propos"
            intro="Je suis diététicien-nutritionniste, en exercice libéral. Je reçois en visioconférence et je me déplace à domicile dans la région sud lyonnaise."
          />
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
          <p>
            <A href={sitePath("/carte")}>Ouvrir la carte de visite digitale</A>
          </p>
        </div>
      </div>
    </section>
  );
}

function Lieu() {
  return (
    <figure className="lieu">
      <Photo {...photos.saone} />
      <figcaption>
        Illustration — quais de la Saône, à Lyon. Les déplacements concernent le secteur de {site.area}, plus au sud
        le long du Rhône. Cette photo n’est pas le lieu de consultation.
      </figcaption>
    </figure>
  );
}

function Methode() {
  return (
    <section className="section" id="methode">
      <div className="container">
        <SectionHead
          title="Méthode d’accompagnement"
          intro="Du premier bilan aux rendez-vous de suivi, nous définissons ensemble les étapes qui vous conviennent."
        />
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
    </section>
  );
}

function Consultations() {
  return (
    <section className="section section-sage" id="consultations">
      <div className="container">
        <SectionHead title="Modalités de consultation" intro={tariffSentence} />
        <div className="consult-grid" data-booking-visible>
          {offers.map((offer) => (
            <article className="consult-card" key={offer.id} id={offer.id}>
              <p className="kicker">{offer.group}</p>
              <h3>{offer.name}</h3>
              <dl>
                <div>
                  <dt>Durée</dt>
                  <dd>{offer.duration}</dd>
                </div>
                <div>
                  <dt>Modalité</dt>
                  <dd>{offer.modality}</dd>
                </div>
              </dl>
              <div className="consult-actions">
                <BookLink href={offer.href} label={offer.label}>
                  Prendre rendez-vous
                </BookLink>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="section" id="faq">
      <div className="container faq-layout">
        <SectionHead
          title="Questions fréquentes"
          intro="Les réponses restent générales. Le détail d’une situation se voit en consultation, pas dans un formulaire."
        />
        <FaqList items={faq} />
      </div>
    </section>
  );
}

function Reservation() {
  return (
    <section className="band" id="rendez-vous" data-booking-visible>
      <div className="container band-inner">
        <p className="kicker kicker-light">Rendez-vous</p>
        <h2>Choisir un créneau</h2>
        <p>
          Quatre liens : bilan ou suivi, en visioconférence partout en France ou en déplacement dans le secteur de{" "}
          {site.area}. Ils ouvrent la page de réservation dans un nouvel onglet. {tariffSentence}
        </p>
        <div className="band-actions">
          {offers.map((offer) => (
            <BookLink key={offer.id} href={offer.href} label={offer.label} className="btn btn-light">
              {offer.group} — {offer.name}
            </BookLink>
          ))}
        </div>
      </div>
    </section>
  );
}
