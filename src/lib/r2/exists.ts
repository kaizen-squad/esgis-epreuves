import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "./client";

/**
 * Le PDF d'une epreuve est-il bien present sur R2 ? Une URL presignee se signe sans contacter R2 :
 * sans cette verification, un fichier absent (bucket vide en local, depot interrompu) n'apparait
 * qu'une fois la redirection suivie, sous forme d'erreur XML de Cloudflare. Un 404 est une absence
 * legitime, toujours traitee comme « indisponible ». Toute autre erreur (identifiants R2
 * manquants, reseau) est journalisee ; en mode `strict` (#157, page publique desormais en ISR),
 * elle est aussi relancee pour qu'un rate passager de R2 ne fige pas une page degradee dans le
 * cache au lieu de laisser Next.js garder la derniere version statique valide.
 */
export async function examFileExists(
  r2Key: string,
  { strict = false }: { strict?: boolean } = {},
): Promise<boolean> {
  try {
    await createClient().send(
      new HeadObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: r2Key }),
    );
    return true;
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } })
      .$metadata?.httpStatusCode;
    if (status === 404) return false;
    console.error("R2 HeadObject a echoue", error);
    if (strict) throw error;
    return false;
  }
}
