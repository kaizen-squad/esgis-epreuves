import { Suspense } from "react";
import { FiDownload, FiExternalLink, FiFileText } from "react-icons/fi";
import { formatFileSize } from "@/lib/file-format";
import { examFileHref, type SpaceBasePath } from "@/components/layout/spaces";
import FullPagePreviewImage from "./FullPagePreviewImage";

/**
 * Banniere d'apercu du PDF : la route `/api/exams/[slug]` redirige vers R2, autorise dans
 * `frame-src` (CSP). Les navigateurs mobiles n'affichent pas un PDF dans un iframe : plutot que
 * d'y proposer de charger tout le fichier (R-28), on y montre la premiere page entiere, rendue par
 * `FullPagePreviewImage`, dans une limite `Suspense` pour ne pas bloquer le reste de la page.
 * Fichier absent de R2 : encart « apercu indisponible ».
 */
export default function ExamFilePreview({
  slug,
  title,
  available,
  r2Key,
  fileVersion,
  fileSize,
  basePath,
}: {
  slug: string;
  title: string;
  available: boolean;
  r2Key: string | null;
  fileVersion: string;
  fileSize: number;
  basePath: SpaceBasePath;
}) {
  const previewHref = examFileHref(basePath, slug);

  return (
    <section
      aria-label="Aperçu de l'épreuve"
      className="bg-background-secondary rounded-card shadow-card overflow-hidden"
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
            <Suspense
              fallback={
                <FiFileText size={40} className="text-background-accent" />
              }
            >
              <FullPagePreviewImage
                r2Key={r2Key}
                slug={slug}
                title={title}
                fileVersion={fileVersion}
              />
            </Suspense>
            <a
              href={examFileHref(basePath, slug, true)}
              className="bg-background-accent text-text-primary rounded-control flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
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
