import { FaqList } from "../components/FaqList";
import { BookLink, Photo, QuoteLink } from "../components/ui";
import { domainBodies } from "../content/domain-pages";
import { domains, type DomainId } from "../content/editorial";
import { sitePath } from "../lib/paths";
import { site, tariffSentence } from "../lib/site";
import { A } from "../router";
import { Crumbs } from "./Subpages";

export function DomainPage({ id }: { id: DomainId }) {
  const domain = domains.find((item) => item.id === id);
  const body = domainBodies[id];
  if (!domain) return null;
  const others = domains.filter((item) => item.id !== id);

  return (
    <article className="section domain-page">
      <div className="container">
        <Crumbs current={domain.title} />
        <div className="domain-hero">
          <div>
            <p className="kicker">Accompagnement</p>
            <h1>{domain.title}</h1>
            <p className="lede">{domain.summary}</p>
            <div className="hero-actions" data-booking-visible>
              <BookLink href={site.booking.general} label={`Prendre rendez-vous — ${domain.title}`}>
                Prendre rendez-vous
              </BookLink>
              <QuoteLink label={`Demander un devis — ${domain.title}`}>Demander un devis</QuoteLink>
            </div>
            <p className="privacy-note">
              {tariffSentence} Le message de devis s’ouvre dans votre messagerie et n’est pas enregistré sur ce site.
              Destinataire : {site.email}.
            </p>
          </div>
          <figure className="domain-hero-media">
            <Photo {...domain.photo} priority />
          </figure>
        </div>

        <div className="prose domain-copy">
          <h2>Pour qui</h2>
          <p>{body.forWhom}</p>
          <h2>Objectifs</h2>
          <p>{body.objectives}</p>
          <h2>Comment se déroule l’accompagnement</h2>
          <p>{body.course}</p>
          {body.medical ? <p className="callout">{body.medical}</p> : null}
          <h2>Situations possibles</h2>
          <p>Quelques exemples, dans le champ de compétence du diététicien. Ils n’annoncent pas un résultat.</p>
          <ul className="edit-list">
            {body.situations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="domain-faq">
          <h2>Questions sur cet accompagnement</h2>
          <FaqList items={body.faq} />
        </div>

        <div className="hero-actions">
          <BookLink href={site.booking.general} label={`Prendre rendez-vous — ${domain.title}`}>
            Prendre rendez-vous
          </BookLink>
          <QuoteLink label={`Demander un devis — ${domain.title}`}>Demander un devis</QuoteLink>
        </div>

        <nav className="related" aria-label="Autres accompagnements">
          <p className="footer-label">Autres accompagnements</p>
          <ul>
            {others.map((item) => (
              <li key={item.id}>
                <A href={sitePath(item.path)}>{item.title}</A>
              </li>
            ))}
            <li>
              <A href={sitePath("/#accompagnements")}>Retour aux accompagnements</A>
            </li>
          </ul>
        </nav>
      </div>
    </article>
  );
}
