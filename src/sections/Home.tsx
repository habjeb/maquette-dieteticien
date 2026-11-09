import { useId, useState } from "react";
import { BookLink, Photo, PrivacyNote, SectionHead } from "../components/ui";
import { domains, faq, heroText, photos, steps } from "../content/editorial";
import { sitePath } from "../lib/paths";
import { offers, site } from "../lib/site";
import { A } from "../router";

export function HomePage() {
  return (
    <>
      <Hero />
      <Domaines />
      <Presentation />
      <Lieu />
      <Methode />
      <Tarifs />
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
          <p className="kicker">01 — {site.jobTitle}</p>
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
          <PrivacyNote />
        </div>
        <figure className="hero-media">
          <Photo {...photos.hero} priority />
        </figure>
      </div>
    </section>
  );
}

function Domaines() {
  return (
    <section className="section" id="accompagnements">
      <div className="container">
        <SectionHead
          index="02"
          title="Domaines d’accompagnement"
          intro="Trois entrées, une même façon de travailler : écouter la situation, puis proposer des repères tenables. Rien n’est un programme standard."
        />
        <div className="domain-list">
          {domains.map((domain, index) => (
            <article className="domain" id={`detail-${domain.id}`} key={domain.id}>
              <figure className="domain-media">
                <Photo {...domain.photo} />
              </figure>
              <div className="domain-body">
                <p className="kicker">0{index + 1}</p>
                <h3>{domain.title}</h3>
                <p>{domain.summary}</p>
                <details className="detail">
                  <summary>
                    <span className="when-closed">Lire le détail</span>
                    <span className="when-open">Replier le détail</span>
                  </summary>
                  <p>{domain.detail}</p>
                  <ul className="edit-list">
                    {domain.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </details>
              </div>
            </article>
          ))}
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
          <figcaption>Photo d’illustration — sera remplacée par le portrait de Nicolas Boyer.</figcaption>
        </figure>
        <div>
          <SectionHead
            index="03"
            title="À propos"
            intro="Je suis diététicien-nutritionniste, en exercice libéral. Je reçois en visioconférence et je me déplace dans le secteur de Condrieu."
          />
          <dl className="facts">
            <div>
              <dt>Diplôme</dt>
              <dd>{site.diploma}</dd>
            </div>
            <div>
              <dt>Expériences</dt>
              <dd>{site.experiences}</dd>
            </div>
            <div>
              <dt>Milieu sportif</dt>
              <dd>{site.sportBackground}</dd>
            </div>
          </dl>
          <p>
            L’accompagnement s’appuie sur les recommandations scientifiques et sur ce qui est réaliste pour vous :
            horaires, goûts, budget, activité, éventuels soins déjà en cours. Je ne propose pas de schéma unique, ni de
            promesse de résultat.
          </p>
          <p>
            La nutrition sportive est un domaine d’intérêt. Elle concerne l’alimentation autour de l’entraînement, de la
            récupération et des échéances. Elle ne résume pas la pratique, qui reste généraliste.
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
          index="04"
          title="Méthode d’accompagnement"
          intro="Trois temps, pour avancer à un rythme tenable. Le déroulé se précise ensemble lors du premier échange. Cette présentation reste indicative."
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

function Tarifs() {
  return (
    <section className="section section-sage" id="tarifs">
      <div className="container">
        <SectionHead
          index="05"
          title="Consultations et tarifs"
          intro={`Les montants affichés (${site.price}) et les durées sont des emplacements à compléter. Tout frais supplémentaire est annoncé avant la confirmation du rendez-vous.`}
        />
        <div className="price-grid" data-booking-visible>
          {offers.map((offer) => (
            <article className="price-card" key={offer.id} id={offer.id}>
              <p className="kicker">{offer.group}</p>
              <h3>{offer.name}</h3>
              <p>{offer.description}</p>
              <dl>
                <div>
                  <dt>Durée</dt>
                  <dd>{site.duration}</dd>
                </div>
                <div>
                  <dt>Tarif</dt>
                  <dd className="price-amount">{site.price}</dd>
                </div>
                <div>
                  <dt>Modalité</dt>
                  <dd>{offer.modality}</dd>
                </div>
                <div>
                  <dt>Frais supplémentaires</dt>
                  <dd>{offer.extra}</dd>
                </div>
              </dl>
              <BookLink href={offer.href} label={offer.label}>
                Prendre rendez-vous
              </BookLink>
            </article>
          ))}
        </div>
        <p className="price-note">
          Moyens de paiement : {site.paymentMethods}. Aucun paiement n’est encaissé sur ce site.
        </p>
        <PrivacyNote />
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<string | null>(null);
  const baseId = useId();
  return (
    <section className="section" id="faq">
      <div className="container faq-layout">
        <SectionHead
          index="06"
          title="Questions fréquentes"
          intro="Les réponses restent générales. Le détail d’une situation se voit en consultation, pas dans un formulaire."
        />
        <div className="faq-list">
          {faq.map((item) => {
            const expanded = open === item.id;
            const panelId = `${baseId}-${item.id}`;
            const buttonId = `${panelId}-button`;
            return (
              <article className={`faq-item${expanded ? " is-open" : ""}`} key={item.id}>
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpen(expanded ? null : item.id)}
                  >
                    <span>{item.q}</span>
                    <span className="faq-symbol" aria-hidden="true">
                      {expanded ? "–" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  className="faq-panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  inert={expanded ? undefined : true}
                >
                  <div className="faq-panel-inner">
                    <p>{item.a}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
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
          Quatre liens, selon qu’il s’agit d’un bilan ou d’un suivi, en visio ou en déplacement. Ils ouvrent la page de
          réservation dans un nouvel onglet. Aucun widget n’est chargé sur ce site.
        </p>
        <div className="band-actions">
          {offers.map((offer) => (
            <BookLink key={offer.id} href={offer.href} label={offer.label} className="btn btn-light">
              {offer.group} — {offer.name}
            </BookLink>
          ))}
        </div>
        <PrivacyNote />
      </div>
    </section>
  );
}
