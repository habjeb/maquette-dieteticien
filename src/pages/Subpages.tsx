import { useState } from "react";
import { BookLink } from "../components/ui";
import { sitePath } from "../lib/paths";
import { buildVCard, isRealEmail, isRealPhone, site } from "../lib/site";
import { A } from "../router";
import type { PageId } from "../content/pages";

export function Crumbs({ current }: { current: string }) {
  return (
    <nav className="crumbs" aria-label="Fil d’Ariane">
      <ol>
        <li>
          <A href={sitePath("/")}>Accueil</A>
        </li>
        <li aria-current="page">{current}</li>
      </ol>
    </nav>
  );
}

export function LegalPage({ id }: { id: Exclude<PageId, "home" | "carte" | "not-found"> }) {
  const page = pages[id];
  return (
    <article className="section legal">
      <div className="container prose">
        <Crumbs current={page.crumb} />
        <h1>{page.title}</h1>
        <p className="lede">{page.intro}</p>
        {page.body}
      </div>
    </article>
  );
}

const pages = {
  mentions: {
    crumb: "Mentions légales",
    title: "Mentions légales",
    intro: "Informations prévues pour l’éditeur du site. Les champs entre crochets sont à compléter avant une mise en ligne définitive.",
    body: (
      <>
        <h2>Éditeur</h2>
        <p>
          {site.legalName}
          <br />
          {site.jobTitle}
          <br />
          Adresse professionnelle : {site.address}
          <br />
          Téléphone : {site.phoneDisplay}
          <br />
          E-mail : {site.email}
          <br />
          SIREN : {site.siren}
          <br />
          Immatriculation : {site.registration}
          <br />
          Numéro RPPS : {site.rpps}
          <br />
          TVA : {site.vat}
        </p>
        <h2>Directeur de la publication</h2>
        <p>{site.fullName}</p>
        <h2>Hébergeur de la maquette</h2>
        <p>
          {site.host.name}
          <br />
          {site.host.company}
          <br />
          {site.host.address}
          <br />
          <a href={site.host.url}>Site de l’hébergeur</a>
          <br />
          <a href={site.host.contact}>Contact de l’hébergeur</a>
        </p>
        <h2>Titre professionnel</h2>
        <p>
          Le titre de diététicien est protégé. Son usage est réservé aux personnes qui remplissent les conditions des
          articles L. 4371-1 et suivants du code de la santé publique, et des dispositions réglementaires associées
          (articles R. 4371-1 et suivants).
        </p>
        <p>
          Diplôme : {site.diploma}
          <br />
          Enregistrement professionnel : {site.professionalRecord}
        </p>
        <h2>Propriété intellectuelle</h2>
        <p>
          Les textes de présentation sont destinés à ce site. Les photographies sont des illustrations libres de droits,
          temporairement utilisées pour la maquette, et seront remplacées. Toute reproduction non autorisée des contenus
          propres à l’éditeur peut être interdite dès lors que le site n’est plus une maquette.
        </p>
        <p>Cette page est un texte de maquette. Elle doit être relue avant publication définitive.</p>
      </>
    ),
  },
  privacy: {
    crumb: "Politique de confidentialité",
    title: "Politique de confidentialité",
    intro: "Ce site vitrine n’héberge pas de dossier patient et ne demande pas de donnée de santé.",
    body: (
      <>
        <h2>Responsable</h2>
        <p>
          {site.legalName}, {site.jobTitle}. Contact : {site.email}. Adresse : {site.address}.
        </p>
        <h2>Ce que le site collecte</h2>
        <p>
          Le site ne comporte pas de formulaire. Il ne demande ni motif de consultation, ni information de santé, ni
          pièce d’identité. Aucun dossier patient n’y est stocké.
        </p>
        <h2>Prise de rendez-vous</h2>
        <p>
          Les boutons « Prendre rendez-vous » sont de simples liens vers un service externe de prise de rendez-vous.
          Aucun module de ce service n’est chargé tant que vous n’ouvrez pas le lien. Les données alors demandées doivent
          rester limitées à l’identité, aux coordonnées, au type de rendez-vous et au créneau. La politique du service
          s’applique à partir de cette page :{" "}
          <a href="https://calendly.com/privacy">politique de confidentialité de Calendly</a>.
        </p>
        <h2>Cookies et traceurs</h2>
        <p>
          Cette maquette ne dépose pas de cookie de mesure d’audience et n’intègre aucun traceur publicitaire. Tant que
          cela reste le cas, un bandeau de consentement n’est pas nécessaire. L’hébergeur peut tenir des journaux
          techniques de connexion, en dehors de ce site.
        </p>
        <h2>Base, durée, destinataires</h2>
        <p>
          S’il n’y a pas de formulaire, le site lui-même ne constitue pas un fichier de patients. Les échanges qui
          naissent après un rendez-vous (messages, notes de consultation) relèvent du suivi professionnel, pas de cet
          hébergement. Leur durée de conservation sera précisée par le professionnel : [Durée de conservation à
          compléter].
        </p>
        <h2>Vos droits</h2>
        <p>
          Vous pouvez demander l’accès, la rectification, l’effacement, la limitation ou l’opposition, et, lorsque la
          loi le prévoit, la portabilité. Écrivez à {site.email}. Vous pouvez aussi saisir la CNIL (
          <a href="https://www.cnil.fr">www.cnil.fr</a>).
        </p>
        <p>Texte de maquette, à faire relire avant mise en ligne.</p>
      </>
    ),
  },
  cgv: {
    crumb: "Conditions générales de vente",
    title: "Conditions générales de vente",
    intro: "Cadre d’information pour les consultations. Les montants, délais et modalités marqués entre crochets sont à compléter.",
    body: (
      <>
        <h2>Prestations</h2>
        <p>
          {site.fullName} propose des consultations de diététique et de nutrition, en bilan initial ou en suivi, en
          visioconférence ou en déplacement dans le secteur de {site.area}. Il s’agit d’un accompagnement
          individualisé, sans promesse de résultat et sans se substituer à un suivi médical.
        </p>
        <h2>Tarifs</h2>
        <p>
          Les tarifs affichés sur la page d’accueil sont ceux de la maquette ({site.price}) et seront remplacés par les
          montants réels. TVA : {site.vat}. Tout frais supplémentaire, notamment {site.travelFee}, est annoncé avant la
          confirmation.
        </p>
        <h2>Réservation</h2>
        <p>
          Le rendez-vous est demandé via le lien de réservation. Le créneau n’est tenu pour confirmé qu’après le message
          de confirmation. Aucune donnée de santé n’est demandée à cette étape.
        </p>
        <h2>Annulation et report</h2>
        <p>
          Le message de confirmation contient un lien pour modifier ou annuler. Délai : {site.cancelDelay}. Les
          conséquences d’une annulation tardive seront précisées ici : [Retenue éventuelle à compléter].
        </p>
        <h2>Paiement</h2>
        <p>
          Moyens acceptés : {site.paymentMethods}. Le règlement ne passe pas par ce site. Il est précisé avant le
          rendez-vous.
        </p>
        <h2>Droit de rétractation</h2>
        <p>
          Pour un contrat conclu à distance, un délai de rétractation de 14 jours peut s’appliquer, sauf exception
          légale. Si vous demandez que la consultation ait lieu avant la fin de ce délai, il pourra vous être demandé
          d’y renoncer expressément. [Formulation à valider avec le conseil du professionnel.]
        </p>
        <h2>Médiation et droit applicable</h2>
        <p>
          En cas de différend, une solution amiable est recherchée d’abord. Le médiateur de la consommation est indiqué
          sur la page <A href={sitePath("/mediation")}>Médiation</A>. Le droit français s’applique.
        </p>
        <p>Texte de maquette, à faire relire avant mise en ligne.</p>
      </>
    ),
  },
  mediation: {
    crumb: "Médiation de la consommation",
    title: "Médiation de la consommation",
    intro: "Le professionnel doit indiquer le médiateur compétent pour les litiges de consommation. Cette coordonnée n’est pas encore renseignée.",
    body: (
      <>
        <p>
          Conformément aux articles L. 612-1 et suivants du code de la consommation, le consommateur peut recourir
          gratuitement à un médiateur en vue de la résolution amiable d’un litige.
        </p>
        <p>
          Médiateur : {site.mediatorName}
          <br />
          Adresse : {site.mediatorAddress}
          <br />
          {site.mediatorUrl ? (
            <a href={site.mediatorUrl}>Site du médiateur</a>
          ) : (
            <span>[Site du médiateur à compléter]</span>
          )}
        </p>
        <p>
          Il est demandé de contacter d’abord {site.fullName} ({site.email}) et de laisser le temps d’une réponse,
          avant de saisir le médiateur.
        </p>
        <p>
          Voir aussi les <A href={sitePath("/cgv")}>conditions générales de vente</A>.
        </p>
      </>
    ),
  },
} as const;

export function CartePage() {
  const [saved, setSaved] = useState(false);
  const phoneOk = isRealPhone(site.phoneTel);
  const emailOk = isRealEmail(site.email);

  const saveContact = () => {
    const blob = new Blob([buildVCard()], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nicolas-boyer.vcf";
    link.click();
    URL.revokeObjectURL(url);
    setSaved(true);
  };

  return (
    <article className="section">
      <div className="container carte">
        <Crumbs current="Carte de visite" />
        <div className="carte-card">
          <p className="brand-mark" aria-hidden="true">
            NB
          </p>
          <h1>{site.fullName}</h1>
          <p className="carte-role">{site.jobTitle}</p>
          <p>Visio et déplacement · secteur de {site.area}</p>
          <div className="carte-actions" data-booking-visible>
            {phoneOk ? (
              <a className="btn btn-primary btn-block" href={`tel:${site.phoneTel}`}>
                Appeler
              </a>
            ) : (
              <button type="button" className="btn btn-secondary btn-block" disabled>
                Appeler · {site.phoneDisplay}
              </button>
            )}
            {emailOk ? (
              <a className="btn btn-secondary btn-block" href={`mailto:${site.email}`}>
                Écrire un e-mail
              </a>
            ) : (
              <button type="button" className="btn btn-secondary btn-block" disabled>
                E-mail · {site.email}
              </button>
            )}
            <BookLink href={site.booking.general} label="Prendre rendez-vous" className="btn btn-primary btn-block">
              Prendre rendez-vous
            </BookLink>
            <button type="button" className="btn btn-secondary btn-block" onClick={saveContact}>
              Enregistrer le contact
            </button>
          </div>
          <p className="privacy-note" role="status">
            {saved
              ? "Le fichier contact a été préparé. Le téléphone et l’e-mail y seront ajoutés lorsqu’ils seront renseignés."
              : "Le fichier .vcf contient le nom, le titre et le lien de cette page. Téléphone et e-mail y figureront une fois renseignés."}
          </p>
          <PrivacyLine />
        </div>
      </div>
    </article>
  );
}

function PrivacyLine() {
  return <p className="privacy-note">{site.privacyNote}</p>;
}

export function NotFoundPage() {
  return (
    <article className="section">
      <div className="container prose">
        <h1>Page introuvable</h1>
        <p className="lede">Cette adresse ne correspond à aucune page de la maquette.</p>
        <p>
          <A className="btn btn-primary" href={sitePath("/")}>
            Revenir à l’accueil
          </A>
        </p>
      </div>
    </article>
  );
}
