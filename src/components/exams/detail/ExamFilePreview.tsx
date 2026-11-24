import { FiDownload, FiExternalLink, FiFileText } from "react-icons/fi";
import { formatFileSize } from "@/lib/file-format";
import { getFullPagePreview } from "@/lib/pdf/fullPagePreviewCache";

/**
 * Banniere d'apercu du PDF : la route `/api/exams/[slug]` redirige vers R2, autorise dans
 * `frame-src` (CSP). Les navigateurs mobiles n'affichent pas un PDF dans un iframe : plutot que
 * d'y proposer de charger tout le fichier (R-28), on y montre la premiere page entiere, deja mise
 * en cache pour les cartes. Fichier absent de R2 : encart « apercu indisponible ».
 */
export default async function ExamFilePreview({
  slug,
  title,
  available,
  r2Key,
  fileVersion,
  fileSize,
}: {
  slug: string;
  title: string;
  available: boolean;
  r2Key: string | null;
  fileVersion: string;
  fileSize: number;
}) {
  const previewHref = `/api/exams/${slug}`;
  // Pas de rendu si le fichier n'existe pas (r2Key absent) ou si la page entiere echoue (PDF
  // corrompu) : le bloc mobile retombe alors sur le lien plein ecran, comme avant.
  const fullPage =
    available && r2Key
      ? await getFullPagePreview(r2Key).catch(() => null)
      : null;

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
          <div className="flex flex-col items-center gap-3 bg-white px-6 py-6 text-center md:hidden">
            {fullPage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- image server deja au format final, `next/image` n'apporterait rien ici */}
                <img
                  src={`/api/exams/${slug}/preview/full?v=${fileVersion}`}
                  alt={`Première page de ${title}`}
                  loading="lazy"
                  width={640}
                  className="w-full max-w-sm rounded-lg border border-gray-200"
                />
                <p className="text-text-paragraph mb-0 text-xs">
                  Page 1 sur {fullPage.pageCount}
                </p>
              </>
            ) : (
              <FiFileText size={40} className="text-background-accent" />
            )}
            <a
              href={`${previewHref}?dl=1`}
              className="bg-background-accent text-text-primary flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium"
            >
              <FiDownload size={16} /> Télécharger · {formatFileSize(fileSize)}
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
