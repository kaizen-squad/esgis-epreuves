#!/usr/bin/env -S pnpm tsx
import { CreateBucketCommand } from "@aws-sdk/client-s3";
import { createClient } from "@/lib/r2/client";

/**
 * Cree le bucket R2 cible s'il n'existe pas deja (idempotent) : utilise par la CI (job `quality`,
 * #157) pour que `examFileExists` recoive de vrais 404 sur un bucket vide plutot qu'une erreur de
 * configuration, puisque le build prerend desormais reellement `/epreuves/[slug]`.
 */
async function main() {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error("R2_BUCKET manquante.");

  try {
    await createClient().send(new CreateBucketCommand({ Bucket: bucket }));
  } catch (error) {
    const code =
      (error as { Code?: string; name?: string }).Code ??
      (error as { name?: string }).name;
    if (code !== "BucketAlreadyOwnedByYou" && code !== "BucketAlreadyExists") {
      throw error;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
