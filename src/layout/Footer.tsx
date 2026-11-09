import { NAV } from "../lib/nav";
import { publicAsset, sitePath } from "../lib/paths";
import { site } from "../lib/site";
import { A } from "../router";

const legal = [
  { href: sitePath("/mentions-legales"), label: "Mentions légales" },
  { href: sitePath("/politique-de-confidentialite"), label: "Confidentialité" },
  { href: sitePath("/cgv"), label: "CGV" },
  { href: sitePath("/mediation"), label: "Médiation" },
  { href: sitePath("/carte"), label: "Carte de visite" },
];

export function Footer() {
  return (
    <footer className="site-footer" id="pied">
      <div className="container footer-grid">
        <div>
          <A className="brand" href={sitePath("/")}>
            <span className="brand-mark" aria-hidden="true">
              NB
            </span>
            <span className="brand-text">
              <span className="brand-name">{site.fullName}</span>
              <span className="brand-role">{site.jobTitle}</span>
            </span>
          </A>
          <p className="footer-lead">
            Exercice libéral. Consultations en visioconférence et en déplacement dans le secteur de {site.area}.
          </p>
        </div>
        <div>
          <p className="footer-label">Sur cette page</p>
          <ul>
            {NAV.map((item) => (
              <li key={item.id}>
                <A href={item.href}>{item.label}</A>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="footer-label">Informations</p>
          <ul>
            {legal.map((item) => (
              <li key={item.href}>
                <A href={item.href}>{item.label}</A>
              </li>
            ))}
            <li>
              {site.googleBusinessUrl ? (
                <a href={site.googleBusinessUrl} target="_blank" rel="noopener noreferrer">
                  Fiche Google
                </a>
              ) : (
                <span>[Fiche Google à compléter]</span>
              )}
            </li>
          </ul>
        </div>
        <div className="qr-block">
          <p className="footer-label">Carte de visite</p>
          <A href={sitePath("/carte")}>
            <img src={publicAsset("carte-qr.svg")} width="148" height="148" alt="QR code vers la carte de visite digitale de Nicolas Boyer" />
          </A>
          <p>À flasher pour ouvrir la carte : appel, e-mail, rendez-vous, contact.</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>
          Maquette de présentation. Les éléments entre crochets, les montants « {site.price} » et les liens Calendly sont
          à remplacer. Hébergement de la maquette : {site.host.name}.
        </p>
        <p>© 2026 {site.fullName}</p>
      </div>
    </footer>
  );
}
