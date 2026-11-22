import { unstable_cache } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getExamR2Key } from "@/features/exams/queries";
import { renderPdfPreview } from "@/lib/pdf/preview";
import { getExamFile } from "@/lib/r2/download";

const REVALIDATE_SECONDS = 24 * 60 * 60;

/** Rendu mis en cache par cle R2 ; en base64, le cache de Next ne stockant que du JSON. */
const getPreview = unstable_cache(
  async (r2Key: string): Promise<string> => {
    const preview = await renderPdfPreview(await getExamFile(r2Key));
    return preview.toString("base64");
  },
  ["exam-preview"],
  { revalidate: REVALIDATE_SECONDS },
);

/**
 * Apercu d'une epreuve pour sa carte : le haut de la premiere page du PDF, en image. Les cartes
 * ajoutent `?v=<version du fichier>` a l'URL : un fichier remplace n'affiche jamais l'ancien
 * apercu. `404` si l'epreuve, son fichier ou un rendu lisible manque : la carte garde alors son
 * icone de fond.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const r2Key = await getExamR2Key(slug);
  if (!r2Key) return new NextResponse(null, { status: 404 });

  try {
    const preview = Buffer.from(await getPreview(r2Key), "base64");
    return new NextResponse(new Uint8Array(preview), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": `public, max-age=${REVALIDATE_SECONDS}, s-maxage=${REVALIDATE_SECONDS}`,
      },
    });
  } catch (error) {
    console.error(`Apercu impossible pour l'epreuve ${slug}`, error);
    return new NextResponse(null, { status: 404 });
  }
}
