import { NextResponse, type NextRequest } from "next/server";
import { getExamR2Key } from "@/features/exams/queries";
import { getPresignedExamUrl } from "@/lib/r2/presign";

/**
 * Previsualisation (en ligne) et telechargement (`?dl=1`, piece jointe) d'une epreuve (#50) :
 * redirige vers une URL R2 presignee a jour, le bucket restant prive.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const r2Key = await getExamR2Key(slug);
  if (!r2Key) return new NextResponse(null, { status: 404 });

  const download = request.nextUrl.searchParams.get("dl") === "1";
  const url = await getPresignedExamUrl(r2Key, `${slug}.pdf`, download);

  return NextResponse.redirect(url, 307);
}
