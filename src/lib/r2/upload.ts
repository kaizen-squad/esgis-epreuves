import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "./client";

/** Depot d'un PDF d'epreuve sur R2, sous la cle calculee par l'appelant (#18, hash du fichier). */
export async function putExamFile(r2Key: string, body: Buffer): Promise<void> {
  await createClient().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: r2Key,
      Body: body,
      ContentType: "application/pdf",
    }),
  );
}

/** Suppression d'un PDF d'epreuve sur R2 (#55, remplacement de fichier ou suppression d'epreuve). */
export async function deleteExamFile(r2Key: string): Promise<void> {
  await createClient().send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: r2Key,
    }),
  );
}
