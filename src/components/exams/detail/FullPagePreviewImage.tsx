import { FiFileText } from "react-icons/fi";
import { getFullPagePreview } from "@/lib/pdf/fullPagePreviewCache";

/**
 * Isole l'attente du rendu PDF (cache ou calcul) dans sa propre limite `Suspense`, pour qu'elle
 * ne retarde pas le reste de la page `ExamFilePreview`. PDF corrompu ou fichier absent de R2 :
 * retombe sur l'icone, comme avant l'apercu page entiere.
 */
export default async function FullPagePreviewImage({
  r2Key,
  slug,
  title,
  fileVersion,
}: {
  r2Key: string | null;
  slug: string;
  title: string;
  fileVersion: string;
}) {
  const fullPage = r2Key
    ? await getFullPagePreview(r2Key).catch((error: unknown) => {
        console.error(`Apercu page entiere indisponible pour ${slug}`, error);
        return null;
      })
    : null;

  if (!fullPage) {
    return <FiFileText size={40} className="text-background-accent" />;
  }

  return (
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
  );
}
