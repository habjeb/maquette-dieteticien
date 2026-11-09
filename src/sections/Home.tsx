import { FaqList } from "../components/FaqList";
import { BookLink, Photo, PrivacyNote, QuoteLink, SectionHead } from "../components/ui";
import { domains, faq, heroText, photos, steps } from "../content/editorial";
import { sitePath } from "../lib/paths";
import { offers, site, tariffSentence } from "../lib/site";
import { A } from "../router";

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
                <h3>
                  <A href={sitePath(domain.path)}>{domain.title}</A>
                </h3>
                <p>{domain.summary}</p>
                <A className="more" href={sitePath(domain.path)}>
                  Voir l’accompagnement
                </A>
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

function Consultations() {
  return (
    <section className="section section-sage" id="consultations">
      <div className="container">
        <SectionHead
          index="05"
          title="Modalités de consultation"
          intro={`${tariffSentence} Les durées indiquées restent à préciser.`}
        />
        <div className="consult-grid" data-booking-visible>
          {offers.map((offer) => (
            <article className="consult-card" key={offer.id} id={offer.id}>
              <p className="kicker">{offer.group}</p>
              <h3>{offer.name}</h3>
              <p>{offer.description}</p>
              <dl>
                <div>
                  <dt>Durée indicative</dt>
                  <dd>{site.duration}</dd>
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
                <QuoteLink label={`Demander un devis : ${offer.group}, ${offer.name}`}>
                  Demander un devis
                </QuoteLink>
              </div>
            </article>
          ))}
        </div>
        <p className="consult-note">
          « Demander un devis » ouvre un message dans votre messagerie. Rien n’est enregistré sur ce site. Destinataire :{" "}
          {site.email}. Moyens de paiement : {site.paymentMethods}. Aucun paiement n’est encaissé ici.
        </p>
        <PrivacyNote />
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="section" id="faq">
      <div className="container faq-layout">
        <SectionHead
          index="06"
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
          Quatre liens, selon qu’il s’agit d’un bilan ou d’un suivi, en visio ou en déplacement. Ils ouvrent la page de
          réservation dans un nouvel onglet. {tariffSentence}
        </p>
        <div className="band-actions">
          {offers.map((offer) => (
            <BookLink key={offer.id} href={offer.href} label={offer.label} className="btn btn-light">
              {offer.group} — {offer.name}
            </BookLink>
          ))}
          <QuoteLink label="Demander un devis" className="btn btn-light">
            Demander un devis
          </QuoteLink>
        </div>
        <PrivacyNote />
      </div>
    </section>
  );
}
