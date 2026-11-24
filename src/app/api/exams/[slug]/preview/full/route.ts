import { NextResponse, type NextRequest } from "next/server";
import { getExamR2Key } from "@/features/exams/queries";
import {
  FULL_PAGE_PREVIEW_REVALIDATE_SECONDS,
  getFullPagePreview,
} from "@/lib/pdf/fullPagePreviewCache";

/**
 * Apercu de la premiere page entiere d'une epreuve, pour la fiche sur mobile (R-28) : verifier le
 * bon sujet sans charger tout le PDF. Meme regles que `/preview` (cle de version, 404 silencieux).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const r2Key = await getExamR2Key(slug);
  if (!r2Key) return new NextResponse(null, { status: 404 });

  try {
    const { image } = await getFullPagePreview(r2Key);
    return new NextResponse(new Uint8Array(Buffer.from(image, "base64")), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": `public, max-age=${FULL_PAGE_PREVIEW_REVALIDATE_SECONDS}, s-maxage=${FULL_PAGE_PREVIEW_REVALIDATE_SECONDS}`,
      },
    });
  } catch (error) {
    console.error(
      `Apercu page entiere impossible pour l'epreuve ${slug}`,
      error,
    );
    return new NextResponse(null, { status: 404 });
  }
}
