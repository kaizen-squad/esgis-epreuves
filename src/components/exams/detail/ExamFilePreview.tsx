import { FiExternalLink, FiFileText } from "react-icons/fi";

/**
 * Banniere d'apercu du PDF : la route `/api/exams/[slug]` redirige vers R2, autorise dans
 * `frame-src` (CSP). Les navigateurs mobiles n'affichent pas un PDF dans un iframe : on y propose
 * plutot d'ouvrir le fichier. Fichier absent de R2 : encart « apercu indisponible ».
 */
export default function ExamFilePreview({
  slug,
  title,
  available,
}: {
  slug: string;
  title: string;
  available: boolean;
}) {
  const previewHref = `/api/exams/${slug}`;

  return (
    <section
      aria-label="Aperçu de l'épreuve"
      className="bg-background-secondary overflow-hidden rounded-xl shadow-sm"
    >
      <div className="text-text-primary flex items-center justify-between gap-3 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 font-medium">
          <FiFileText size={16} /> Aperçu du fichier
        </span>
        {available ? (
          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-white/80 hover:bg-white/10 hover:text-white"
          >
            <FiExternalLink size={14} /> Plein écran
          </a>
        ) : null}
      </div>

      {available ? (
        <>
          <iframe
            src={`${previewHref}#view=FitH`}
            title={`Aperçu de ${title}`}
            loading="lazy"
            className="hidden h-[75vh] min-h-[32rem] w-full bg-white md:block"
          />
          <div className="flex flex-col items-center gap-4 bg-white px-6 py-14 text-center md:hidden">
            <FiFileText size={40} className="text-background-accent" />
            <p className="text-text-paragraph mb-0 text-sm">
              L&apos;aperçu s&apos;ouvre dans le lecteur PDF de votre appareil.
            </p>
            <a
              href={previewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-default flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
            >
              <FiExternalLink size={16} /> Ouvrir l&apos;aperçu
            </a>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 bg-white px-6 py-20 text-center">
          <span className="bg-background-default text-text-paragraph flex size-16 items-center justify-center rounded-full">
            <FiFileText size={28} />
          </span>
          <p className="text-text-secondary mb-0 font-semibold">
            Aperçu indisponible
          </p>
          <p className="text-text-paragraph mb-0 max-w-sm text-sm">
            Le fichier de cette épreuve n&apos;est pas encore disponible.
            Revenez un peu plus tard.
          </p>
        </div>
      )}
    </section>
  );
}
