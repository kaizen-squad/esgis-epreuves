import { S3Client } from "@aws-sdk/client-s3";

/**
 * `R2_ENDPOINT` surcharge l'endpoint R2 par un S3 compatible (le stockage local de Supabase en CI
 * E2E, #114) : jamais renseigne en developpement ni en production, ou le compte Cloudflare fait foi.
 */
export function createClient() {
  const endpoint =
    process.env.R2_ENDPOINT ||
    `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  return new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle: !!process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}
