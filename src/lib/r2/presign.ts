import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createClient } from "./client";

/** Courte duree de vie : l'URL n'est utilisee qu'une fois, immediatement, pour la redirection (#50). */
const EXPIRES_IN_SECONDS = 300;

export function contentDisposition(
  download: boolean,
  filename: string,
): string {
  return `${download ? "attachment" : "inline"}; filename="${filename}"`;
}

/** URL R2 presignee pour une previsualisation (en ligne) ou un telechargement (piece jointe) d'une epreuve. */
export async function getPresignedExamUrl(
  r2Key: string,
  filename: string,
  download: boolean,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: r2Key,
    ResponseContentType: "application/pdf",
    ResponseContentDisposition: contentDisposition(download, filename),
  });

  return getSignedUrl(createClient(), command, {
    expiresIn: EXPIRES_IN_SECONDS,
  });
}
