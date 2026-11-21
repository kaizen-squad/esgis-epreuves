import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "./client";

/**
 * Le PDF d'une epreuve est-il bien present sur R2 ? Une URL presignee se signe sans contacter R2 :
 * sans cette verification, un fichier absent (bucket vide en local, depot interrompu) n'apparait
 * qu'une fois la redirection suivie, sous forme d'erreur XML de Cloudflare. Toute erreur autre
 * qu'un 404 (identifiants R2 manquants, reseau) est journalisee et traitee comme « indisponible ».
 */
export async function examFileExists(r2Key: string): Promise<boolean> {
  try {
    await createClient().send(
      new HeadObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: r2Key }),
    );
    return true;
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } })
      .$metadata?.httpStatusCode;
    if (status !== 404) console.error("R2 HeadObject a echoue", error);
    return false;
  }
}
