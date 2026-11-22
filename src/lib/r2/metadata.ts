import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { unstable_cache } from "next/cache";
import { createClient } from "./client";

export type ExamFileInfo = { size: number; mimeType: string };

const REVALIDATE_SECONDS = 24 * 60 * 60;
/** Le catalogue attend cette reponse : R2 injoignable ne doit pas le bloquer. */
const TIMEOUT_MS = 2000;

/** Seul un succes est mis en cache : une erreur est levee, donc retentee a l'appel suivant. */
const headExamFile = unstable_cache(
  async (r2Key: string): Promise<ExamFileInfo> => {
    const head = await createClient().send(
      new HeadObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: r2Key }),
      { abortSignal: AbortSignal.timeout(TIMEOUT_MS) },
    );
    if (head.ContentLength === undefined || !head.ContentType) {
      throw new Error(`Metadonnees R2 incompletes pour ${r2Key}`);
    }
    return { size: head.ContentLength, mimeType: head.ContentType };
  },
  ["exam-file-info"],
  { revalidate: REVALIDATE_SECONDS },
);

/**
 * Taille et type reels du fichier depose sur R2 (la cle contient le hash du contenu : un fichier
 * remplace change de cle). `null` si R2 ne repond pas ou si le fichier est absent : l'appelant
 * retombe alors sur les valeurs enregistrees en base.
 */
export async function getExamFileInfo(
  r2Key: string,
): Promise<ExamFileInfo | null> {
  if (!process.env.R2_BUCKET) return null;
  try {
    return await headExamFile(r2Key);
  } catch {
    return null;
  }
}
