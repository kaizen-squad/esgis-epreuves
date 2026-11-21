import { NextResponse, type NextRequest } from "next/server";
import { getExamR2Key } from "@/features/exams/queries";
import { examFileExists } from "@/lib/r2/exists";
import { getPresignedExamUrl } from "@/lib/r2/presign";

/**
 * Previsualisation (en ligne) et telechargement (`?dl=1`, piece jointe) d'une epreuve (#50) :
 * redirige vers une URL R2 presignee a jour, le bucket restant prive. `404` si le slug ne
 * correspond a aucune epreuve ou si son PDF est absent de R2 (plutot que de rediriger vers une
 * erreur XML de Cloudflare).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const r2Key = await getExamR2Key(slug);
  if (!r2Key || !(await examFileExists(r2Key))) {
    return new NextResponse("Fichier de l'épreuve introuvable.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const download = request.nextUrl.searchParams.get("dl") === "1";
  const url = await getPresignedExamUrl(r2Key, `${slug}.pdf`, download);

  return NextResponse.redirect(url, 307);
}
