import Link from "next/link";
import type { ReactNode } from "react";
import { FaWhatsapp } from "@/components/icons";
import { getBdeContactHref } from "@/features/contact/queries";

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
 * FAQ de l'accueil public, a la place du bloc de presentation du site : elle renseigne
 * l'etudiant au lieu de decrire Alexandria. Panneau marine plein, seul aplat sombre de la feuille
 * blanche ; la premiere question (la plus importante) est ouverte d'emblee. Le contact BDE
 * (questions 4 et 6, et l'encart "Ta question n'y est pas ?") suit le numero regle par le BDE.
 */
export default async function Faq() {
  const contactHref = await getBdeContactHref();

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="bg-background-partial text-text-primary mx-auto mb-20 grid max-w-7xl scroll-mt-6 gap-10 rounded-3xl px-4 py-10 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:rounded-4xl lg:px-14 lg:py-16"
    >
      {/* Sous lg, `contents` laisse l'en-tete au-dessus des questions et l'encart de contact
          en dessous ; a partir de lg, les deux restent ensemble dans la colonne de gauche. */}
      <div className="contents lg:sticky lg:top-8 lg:flex lg:flex-col lg:justify-between lg:gap-10 lg:self-start">
        <header className="order-1">
          <p className="text-text-primary/70 mb-4 flex items-center gap-3 text-sm font-semibold">
            <span
              aria-hidden="true"
              className="bg-background-accent h-0.5 w-6"
            />
            Questions fréquentes
          </p>
          <h2
            id="faq-title"
            className="text-[2rem] leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            Ce qu&apos;on nous demande le plus
            <span className="text-background-accent">.</span>
          </h2>
          <p className="text-text-primary/75 mt-5 max-w-md text-base text-pretty lg:text-lg">
            Gratuit, sans compte, alimenté par le BDE&nbsp;: l&apos;essentiel
            tient en 9 réponses.
          </p>
        </header>

        <aside
          aria-label="Contacter le BDE"
          className="rounded-card order-3 flex flex-col gap-4 border border-white/15 bg-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-start lg:p-6"
        >
          <div>
            <p className="font-semibold">Ta question n&apos;y est pas&nbsp;?</p>
            <p className="text-text-primary/75 mt-1 text-sm text-pretty">
              Une épreuve à ajouter, une erreur à signaler&nbsp;: le BDE te
              répond sur WhatsApp.
            </p>
          </div>
          <a
            href={contactHref}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-background-accent text-text-primary rounded-control inline-flex w-fit shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-[filter] hover:brightness-110"
          >
            <FaWhatsapp size={16} aria-hidden="true" />
            Écrire au BDE
          </a>
        </aside>
      </div>

      <div className="order-2 -mx-1 flex flex-col sm:mx-0">
        {questions(contactHref).map(({ question, answer }, index) => (
          <details
            key={question}
            name="faq"
            open={index === 0}
            className="faq-item rounded-card"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-5 sm:gap-6 sm:px-6 lg:py-6">
              <span className="text-base leading-snug font-semibold text-pretty sm:text-lg lg:text-xl">
                {question.replace(/ ([?:])/g, "\u00a0$1")}
              </span>
              <span
                aria-hidden="true"
                className="faq-toggle rounded-control size-9 shrink-0 sm:size-10"
              />
            </summary>
            <p className="text-text-paragraph mb-0 max-w-prose px-4 pb-6 text-base leading-relaxed text-pretty sm:px-6 lg:pb-7">
              {answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
