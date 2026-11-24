import Link from "next/link";
import type { ReactNode } from "react";
import { FaWhatsapp } from "@/components/icons";
import {
  getBdeContactHref,
  getBdeWhatsappNumber,
} from "@/features/contact/queries";

type Question = { question: string; answer: ReactNode };

const LINK_CLASS =
  "text-text-secondary decoration-background-accent font-semibold underline decoration-2 underline-offset-[0.3em] transition-colors hover:text-background-accent";

/** Questions validees par le porteur du produit, de la plus importante a la moins importante. */
function questions(contactHref: string): Question[] {
  const contact = (
    <a
      href={contactHref}
      target="_blank"
      rel="noopener noreferrer"
      className={LINK_CLASS}
    >
      «&nbsp;Nous contacter&nbsp;»
    </a>
  );

  return [
    {
      question: "C'est gratuit ? Faut-il créer un compte ?",
      answer: (
        <>
          Oui, c&apos;est gratuit, et aucun compte n&apos;est nécessaire. Tu
          consultes, télécharges et partages sans inscription. Seuls les membres
          du BDE ont un compte, pour déposer les épreuves.
        </>
      ),
    },
    {
      question: "D'où viennent les épreuves ?",
      answer: (
        <>
          Ce sont les membres du BDE ESGIS qui les déposent, depuis un espace
          réservé. Chaque épreuve est classée par filière, niveau, matière,
          année académique, session et type. Les étudiants ne déposent pas
          directement sur le site.
        </>
      ),
    },
    {
      question:
        "Pourquoi ma filière, ma matière ou mon année n'a pas (encore) d'épreuve ?",
      answer: (
        <>
          Les archives se remplissent au fil des dépôts du BDE. Si une épreuve
          manque, c&apos;est que personne ne l&apos;a encore déposée, pas
          qu&apos;elle n&apos;existe pas. Si tu l&apos;as, envoie-la au BDE
          (voir question suivante).
        </>
      ),
    },
    {
      question:
        "J'ai une épreuve qui n'est pas sur le site, comment la faire ajouter ?",
      answer: (
        <>
          Envoie le PDF au BDE via le bouton {contact} (WhatsApp) en bas de
          page. Un membre du BDE la classera et la mettra en ligne.
        </>
      ),
    },
    {
      question: "Y a-t-il les corrigés ?",
      answer: (
        <>
          Non. Le site archive les sujets d&apos;épreuves (contrôles continus et
          contrôles terminaux, session normale et rattrapage), sans rubrique de
          corrigés.
        </>
      ),
    },
    {
      question:
        "Une épreuve est mal classée, ou ce n'est pas le bon fichier : comment le signaler ?",
      answer: (
        <>
          Préviens le BDE via {contact}, avec le lien de la fiche. Le BDE peut
          corriger les informations de l&apos;épreuve ou remplacer son fichier.
        </>
      ),
    },
    {
      question: "Comment trouver vite l'épreuve qu'il me faut ?",
      answer: (
        <>
          Trois chemins&nbsp;: la recherche (titre, matière, filière), la page{" "}
          <Link href="/filieres" className={LINK_CLASS}>
            Filières
          </Link>{" "}
          puis ton niveau, ou le{" "}
          <Link href="/catalogue" className={LINK_CLASS}>
            Catalogue
          </Link>{" "}
          filtrable (filière, niveau, matière, année académique, session, type).
        </>
      ),
    },
    {
      question:
        "Je n'arrive pas à voir ou télécharger le fichier, c'est normal ?",
      answer: (
        <>
          Sur téléphone, l&apos;aperçu s&apos;ouvre dans le lecteur PDF de
          l&apos;appareil. «&nbsp;Aperçu indisponible&nbsp;» veut dire que le
          fichier n&apos;est pas encore en ligne. Chaque fichier est un PDF, et
          la fiche affiche son poids.
        </>
      ),
    },
    {
      question: "Comment partager une épreuve avec ma classe ?",
      answer: (
        <>
          Utilise le bouton «&nbsp;Partager l&apos;épreuve&nbsp;» de la
          fiche&nbsp;: sur téléphone il ouvre le menu de partage de
          l&apos;appareil, sur ordinateur il propose WhatsApp ou copier le lien.
          Le lien mène à la page publique, consultable sans compte.
        </>
      ),
    },
  ];
}

/**
 * FAQ de l'accueil public, en fil de discussion : les questions des etudiants a gauche, la
 * reponse du BDE qui s'ouvre en dessous, a droite (styles `.faq-*` dans `globals.css`). Le fil
 * se termine par sa barre d'ecriture, qui est le vrai lien WhatsApp vers le BDE. Sans numero
 * regle par le BDE, ce lien ouvre WhatsApp sans destinataire : le texte le dit au lieu de
 * promettre une reponse que personne ne recevrait.
 */
export default async function Faq() {
  const [bdeNumber, contactHref] = await Promise.all([
    getBdeWhatsappNumber(),
    getBdeContactHref(),
  ]);
  const items = questions(contactHref);

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="mx-auto mb-20 grid max-w-7xl scroll-mt-6 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"
    >
      <header className="lg:sticky lg:top-8 lg:self-start">
        <p className="text-text-secondary/70 mb-4 flex items-center gap-3 text-sm font-semibold">
          <span aria-hidden="true" className="bg-background-accent h-0.5 w-6" />
          Questions fréquentes
        </p>
        <h2
          id="faq-title"
          className="text-text-secondary text-3xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
        >
          Ce qu&apos;on nous demande le plus
          <span className="text-background-accent">.</span>
        </h2>
        <p className="text-text-paragraph mt-5 max-w-md text-base text-pretty lg:text-lg">
          Gratuit, sans compte, alimenté par le BDE&nbsp;: l&apos;essentiel
          tient en {items.length} réponses.
        </p>
      </header>

      <div>
        <div className="flex flex-col gap-2">
          {items.map(({ question, answer }, index) => (
            <details
              key={question}
              name="faq"
              open={index === 0}
              className="faq-item"
            >
              <summary className="flex cursor-pointer py-1">
                <span className="faq-question text-text-secondary flex min-w-0 items-center gap-4 py-3 pr-3 pl-4 text-base leading-snug font-semibold text-pretty sm:pl-5 sm:text-lg">
                  {question.replace(/ ([?:])/g, "\u00a0$1")}
                  <span
                    aria-hidden="true"
                    className="faq-toggle rounded-control size-6 shrink-0"
                  />
                </span>
              </summary>
              <div className="flex justify-end pt-2 pb-5 pl-4 sm:pl-20">
                <div className="faq-answer max-w-xl px-4 py-3 sm:px-5 sm:py-4">
                  <p className="text-background-accent mb-1 text-xs font-semibold">
                    BDE ESGIS
                  </p>
                  <p className="text-text-default mb-0 text-[0.9375rem] leading-relaxed text-pretty sm:text-base">
                    {answer}
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-10">
          <p className="text-text-secondary font-semibold">
            Ta question n&apos;y est pas&nbsp;?
          </p>
          <p className="text-text-paragraph mt-1 text-sm text-pretty sm:text-base">
            {bdeNumber ? (
              <>
                Une épreuve à ajouter, une erreur à signaler&nbsp;: écris
                directement au BDE sur WhatsApp.
              </>
            ) : (
              <>
                Une épreuve à ajouter, une erreur à signaler&nbsp;: WhatsApp
                s&apos;ouvre avec ton message déjà rédigé, tu choisis le membre
                du BDE à qui l&apos;envoyer.
              </>
            )}
          </p>
          <a
            href={contactHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-card bg-background-primary shadow-card mt-4 flex items-center gap-3 border border-[rgb(17_22_36/0.1)] py-1.5 pr-1.5 pl-4 transition-colors hover:border-[rgb(15_33_85/0.4)] sm:pl-5"
          >
            <span className="text-text-paragraph min-w-0 flex-1 text-sm sm:text-base">
              {bdeNumber ? "Écrire au BDE" : "Préparer mon message"}
              {/* Le pictogramme dit deja WhatsApp a l'oeil ; le nom accessible le garde. */}
              <span className="max-sm:sr-only"> sur WhatsApp</span>
            </span>
            <span
              aria-hidden="true"
              className="bg-background-accent text-text-primary rounded-control grid size-10 shrink-0 place-items-center transition-[filter] group-hover:brightness-110"
            >
              <FaWhatsapp size={18} />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
