import { unstable_cache } from "next/cache";
import { renderPdfFirstPageFull } from "@/lib/pdf/preview";
import { getExamFile } from "@/lib/r2/download";

export const FULL_PAGE_PREVIEW_REVALIDATE_SECONDS = 24 * 60 * 60;

/**
 * Rendu de la premiere page entiere, mis en cache par cle R2 (en base64, le cache de Next ne
 * stockant que du JSON) : partage par la route d'image et par `ExamFilePreview`, qui n'a besoin
 * que du nombre de pages. Un seul rendu sert donc les deux, sans recalcul.
 */
export const getFullPagePreview = unstable_cache(
  async (r2Key: string): Promise<{ image: string; pageCount: number }> => {
    const { image, pageCount } = await renderPdfFirstPageFull(
      await getExamFile(r2Key),
    );
    return { image: image.toString("base64"), pageCount };
  },
  ["exam-preview-full-page"],
  { revalidate: FULL_PAGE_PREVIEW_REVALIDATE_SECONDS },
);
