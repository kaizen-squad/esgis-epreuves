#!/usr/bin/env -S pnpm tsx
import { readdirSync } from "fs";
import { join } from "path";

/**
 * #189 : verifie que chaque migration locale est bien enregistree comme appliquee sur un projet
 * Supabase cloud donne, pour que l'ecart constate le 25/11 (4 migrations jamais poussees en
 * prod, build casse en silence pendant 22h) devienne une CI rouge plutot qu'une decouverte a
 * posteriori. Detection/alerte bloquante uniquement (decision du 2026-11-27) : ne joue jamais de
 * migration elle-meme, meme en cas d'ecart, pour ne jamais risquer une migration destructive sans
 * revue humaine prealable.
 */
async function main() {
  const ref = process.argv[2];
  if (!ref) throw new Error("Usage: check-remote-migrations.ts <project-ref>");

  // Degrade en avertissement (jamais en echec) tant que le secret n'est pas configure : la
  // verification elle-meme ne doit pas rendre `main` rouge avant que ce prealable humain soit
  // fait (action-mouwafic, aucun outil ne permet de creer ce jeton depuis la CI). Une fois le
  // secret present, un ecart reel echoue normalement.
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn(
      `::warning::SUPABASE_ACCESS_TOKEN absente : verification de ${ref} ignoree (voir action-mouwafic).`,
    );
    return;
  }

  // Meme regle que le CLI Supabase (`supabase migration list`) : un fichier qui n'y correspond
  // pas n'est pas une migration.
  const MIGRATION_FILENAME = /^(\d+)_.*\.sql$/;
  const localVersions = readdirSync(
    join(import.meta.dirname, "..", "supabase", "migrations"),
  )
    .map((name) => MIGRATION_FILENAME.exec(name)?.[1])
    .filter((version): version is string => version !== undefined)
    .sort();

  // Endpoint dedie (lecture seule du cote de ce qu'il expose), plutot que `/database/query` qui
  // executerait du SQL arbitraire avec les pleins droits du jeton.
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/migrations`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok) {
    throw new Error(
      `Lecture de l'historique de migrations de ${ref} impossible (${response.status}) : ${await response.text()}`,
    );
  }

  const remoteVersions = new Set(
    ((await response.json()) as { version: string }[]).map(
      (row) => row.version,
    ),
  );

  const missing = localVersions.filter(
    (version) => !remoteVersions.has(version),
  );
  if (missing.length > 0) {
    throw new Error(
      `Projet ${ref} en retard de ${missing.length} migration(s), jamais appliquee(s) : ` +
        `${missing.join(", ")}. Les appliquer manuellement (API Supabase) avant de refaire un push.`,
    );
  }

  console.log(`Projet ${ref} a jour (${localVersions.length} migrations).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
