#!/usr/bin/env -S pnpm tsx
import path from "node:path";
import process from "node:process";
import { createAdminClient } from "@/lib/supabase/admin";
import { putExamFile } from "@/lib/r2/upload";
import { E2E_USERS } from "../e2e/fixtures";

// Script Node autonome, hors chargement automatique de .env.local par Next.js : a charger ici a
// la main (voir scripts/seed-exams.ts). En CI, les variables sont deja dans l'environnement.
try {
  process.loadEnvFile(path.resolve(".env.local"));
} catch {
  // absent ou illisible : les variables sont alors deja dans l'environnement (CI, shell).
}

/**
 * Fixtures des tests E2E (#114) : comptes BDE/Admin reels (mot de passe) que `supabase db reset`
 * ne peut pas creer par simple SQL (GoTrue gere le hachage via son API, pas une colonne en clair),
 * et les deux PDF de demo du seed SQL deposes sur le stockage S3 de Supabase local (compatible R2
 * via `R2_ENDPOINT`, voir `src/lib/r2/client.ts` ; aucun service tiers a faire tourner en CI). A
 * lancer apres `supabase db reset`, jamais en production (cree de vrais comptes Auth, dont un
 * ADMIN avec mot de passe en clair dans `e2e/fixtures.ts`).
 */

/** `R2_ENDPOINT` n'est jamais renseigne hors CI E2E : sa presence suffit a confirmer un stockage local. */
function assertLocalStack() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const isLocalHost = ["127.0.0.1", "localhost"].includes(
    new URL(supabaseUrl || "http://invalide").hostname,
  );
  if (!isLocalHost || !process.env.R2_ENDPOINT) {
    throw new Error(
      "Seed E2E annule : NEXT_PUBLIC_SUPABASE_URL doit pointer sur un hote local et R2_ENDPOINT " +
        "doit etre defini. Ce script cree de vrais comptes Auth, dont un ADMIN avec mot de passe " +
        "public (e2e/fixtures.ts) ; jamais a lancer contre un projet Supabase ou un bucket distant.",
    );
  }
}

async function main() {
  assertLocalStack();

  const missingVars = [
    "R2_BUCKET",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
  ].filter((name) => !process.env[name]);
  if (missingVars.length > 0) {
    throw new Error(`Variables R2 manquantes : ${missingVars.join(", ")}.`);
  }

  const admin = createAdminClient();
  if (!admin) {
    console.error("SUPABASE_SECRET_KEY manquante : seed E2E annule.");
    process.exitCode = 1;
    return;
  }

  const bucket = process.env.R2_BUCKET!;
  const { error: bucketError } = await admin.storage.createBucket(bucket, {
    public: false,
  });
  if (bucketError && !bucketError.message.includes("already exists")) {
    throw new Error(
      `Creation du bucket ${bucket} echouee : ${bucketError.message}`,
    );
  }

  for (const user of E2E_USERS) {
    const { data, error } = await admin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });
    if (error || !data.user) {
      throw new Error(
        `Creation du compte ${user.email} echouee : ${error?.message}`,
      );
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: data.user.id,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      is_active: user.isActive,
    });
    if (profileError) {
      throw new Error(`Profil ${user.email} echoue : ${profileError.message}`);
    }
  }

  for (const key of ["dev/exemple-1.pdf", "dev/exemple-2.pdf"]) {
    await putExamFile(key, Buffer.from(`%PDF-1.4 fixture e2e ${key}`));
  }

  console.log(`Seed E2E : ${E2E_USERS.length} compte(s), 2 fichier(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
