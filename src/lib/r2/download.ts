import { GetObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "./client";

/** Contenu d'un fichier d'epreuve depose sur R2. Leve une erreur si l'objet est absent. */
export async function getExamFile(r2Key: string): Promise<Uint8Array> {
  const { Body } = await createClient().send(
    new GetObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: r2Key }),
  );
  if (!Body) throw new Error(`Objet R2 vide : ${r2Key}`);
  return Body.transformToByteArray();
}
