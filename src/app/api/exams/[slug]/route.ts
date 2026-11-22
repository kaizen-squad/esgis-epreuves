import { NextResponse, type NextRequest } from "next/server";
import { getExamR2Key } from "@/features/exams/queries";
import { publicExamPath } from "@/components/layout/spaces";
import { examFileExists } from "@/lib/r2/exists";
import { getPresignedExamUrl } from "@/lib/r2/presign";

/**
 * Previsualisation (en ligne) et telechargement (`?dl=1`, piece jointe) d'une epreuve (#50) :
 * redirige vers une URL R2 presignee a jour, le bucket restant prive. Slug inconnu ou PDF absent
 * de R2 : redirige vers la fiche de l'epreuve plutot qu'un `404` en texte brut (R-10), qui
 * affiche elle-meme la 404 standard du produit ou l'etat « apercu indisponible ».
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const r2Key = await getExamR2Key(slug);
  if (!r2Key || !(await examFileExists(r2Key))) {
    return NextResponse.redirect(
      new URL(publicExamPath(slug), request.url),
      307,
    );
  }

  const download = request.nextUrl.searchParams.get("dl") === "1";
  const url = await getPresignedExamUrl(r2Key, `${slug}.pdf`, download);

  return NextResponse.redirect(url, 307);
}
