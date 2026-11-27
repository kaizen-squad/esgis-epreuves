#!/usr/bin/env -S pnpm tsx
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parseArgs } from "node:util";
import { createClient } from "@/lib/supabase/script";
import { putExamFile } from "@/lib/r2/upload";
import { examFileExists } from "@/lib/r2/exists";
import { checkSeed, runSeed } from "@/features/exams/seed";

// Script Node autonome, hors du chargement automatique de .env.local par Next.js (dev/build/start) :
// a charger ici a la main, sans ajouter de dependance (dotenv) pour ce que le stdlib fait deja.
try {
  process.loadEnvFile(path.resolve(".env.local"));
} catch {
  // absent ou illisible : les variables sont alors deja dans l'environnement (CI, shell).
}

/**
 * CLI du script de seed en masse (#21). `pnpm seed:exams --csv <chemin> [--dir <dossier>] [--dry-run]`.
 * Mode audit (#199) : `pnpm seed:exams --csv <chemin> --check [--check-r2]`, avant le lancement
 * reel de la collecte (#23) : signale les lignes deja en base mal classees par rapport au CSV, les
 * lignes absentes, et (avec `--check-r2`) les epreuves en base dont l'objet R2 est introuvable.
 * Mode lecture seule : aucune credential R2/BDE requise, comme `--dry-run`.
 *
 * `--dir` fixe le dossier de base pour resoudre la colonne `fichier` du CSV (defaut : dossier du
 * CSV lui-meme, coherent avec le gabarit ou les chemins sont donnes relativement a l'echantillon).
 *
 * L'ecriture (hors `--dry-run`/`--check`) exige un compte BDE (`SEED_BDE_EMAIL`/`SEED_BDE_PASSWORD`,
 * variables d'environnement jamais en argument CLI, pour ne pas finir dans l'historique du
 * shell) : seule l'INSERT sur `exams` est protegee par la RLS (`exams_write_bde`), les lectures
 * (referentiels, detection de doublon) sont publiques. Un `--dry-run` n'a donc besoin d'aucune
 * credential.
 */
async function main() {
  const { values } = parseArgs({
    options: {
      csv: { type: "string" },
      dir: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      check: { type: "boolean", default: false },
      "check-r2": { type: "boolean", default: false },
    },
  });

  if (!values.csv) {
    console.error(
      "Usage : pnpm seed:exams --csv <chemin-vers-metadonnees.csv> [--dir <dossier>] [--dry-run | --check [--check-r2]]",
    );
    process.exitCode = 1;
    return;
  }

  const dryRun = values["dry-run"] === true;
  const check = values.check === true;
  const csvPath = path.resolve(values.csv);
  const baseDir = values.dir ? path.resolve(values.dir) : path.dirname(csvPath);
  const csvContent = await readFile(csvPath, "utf-8");

  const supabase = createClient();

  if (check) {
    const report = await checkSeed(
      csvContent,
      { baseDir, checkR2Objects: values["check-r2"] === true },
      { supabase, readFile: (filePath) => readFile(filePath), examFileExists },
    );

    for (const entry of report.entries) {
      switch (entry.status) {
        case "conforme":
          console.log(`[conforme] ${entry.file} -> ${entry.slug}`);
          break;
        case "mal_classee":
          console.log(`[mal classee] ${entry.file} -> ${entry.slug} :`);
          for (const m of entry.mismatches) {
            console.log(
              `  ${m.field} : attendu "${m.attendu}", trouve "${m.trouve}"`,
            );
          }
          break;
        case "absente":
          console.log(`[absente] ${entry.file} : pas encore en base.`);
          break;
        case "error":
          console.log(`[error] ${entry.file} : ${entry.message}`);
          break;
      }
    }

    if (report.orphanExams.length > 0) {
      console.log(
        `\n${report.orphanExams.length} epreuve(s) en base sans fichier correspondant dans le dossier de collecte :`,
      );
      for (const exam of report.orphanExams) console.log(`  ${exam.slug}`);
    }

    if (values["check-r2"] && report.missingR2Objects.length > 0) {
      console.log(
        `\n${report.missingR2Objects.length} epreuve(s) en base dont l'objet R2 est introuvable :`,
      );
      for (const exam of report.missingR2Objects) {
        console.log(`  ${exam.slug} (${exam.r2Key})`);
      }
    }

    const { summary } = report;
    console.log(
      `\n${summary.total} ligne(s) : ${summary.conforme} conforme(s), ${summary.mal_classee} mal classee(s), ${summary.absente} absente(s), ${summary.error} erreur(s).`,
    );

    if (summary.mal_classee > 0 || summary.error > 0) process.exitCode = 1;
    return;
  }

  if (!dryRun) {
    // Verifiees avant de traiter la moindre ligne : sans ca, un oubli de configuration R2 ne se
    // verrait qu'apres N allers-retours insertion + rollback inutiles (observe en pratique lors
    // d'un smoke-test local sans credentials R2). Un compte sans le role BDE, lui, n'a pas de
    // controle prealable possible (`profiles` n'a pas de lecture publique) : il echoue ligne par
    // ligne a l'insertion, avec le code Postgres (42501) dans le message d'erreur du rapport.
    const missingR2Vars = [
      "R2_BUCKET",
      "R2_ACCOUNT_ID",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
    ].filter((name) => !process.env[name]);
    if (missingR2Vars.length > 0) {
      console.error(
        `Variables R2 manquantes, requises hors --dry-run : ${missingR2Vars.join(", ")}.`,
      );
      process.exitCode = 1;
      return;
    }

    const email = process.env.SEED_BDE_EMAIL;
    const password = process.env.SEED_BDE_PASSWORD;
    if (!email || !password) {
      console.error(
        "SEED_BDE_EMAIL et SEED_BDE_PASSWORD sont requis hors --dry-run (compte BDE, seule l'ecriture est protegee par la RLS).",
      );
      process.exitCode = 1;
      return;
    }
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      console.error(`Connexion BDE impossible : ${authError.message}`);
      process.exitCode = 1;
      return;
    }
  }

  const report = await runSeed(
    csvContent,
    { baseDir, dryRun },
    {
      supabase,
      readFile: (filePath) => readFile(filePath),
      putExamFile,
    },
  );

  for (const entry of report.entries) {
    switch (entry.status) {
      case "imported":
      case "dry-run": {
        const prefix = entry.status === "dry-run" ? "[dry-run]" : "[importe]";
        const warning = entry.warning
          ? ` (avertissement : ${entry.warning})`
          : "";
        console.log(`${prefix} ${entry.file} -> ${entry.slug}${warning}`);
        break;
      }
      default:
        console.log(`[${entry.status}] ${entry.file} : ${entry.message}`);
    }
  }

  const { summary } = report;
  console.log(
    `\n${summary.total} ligne(s) : ${summary.imported} importee(s) (dont ${summary.warnings} avec avertissement), ${summary.duplicates} doublon(s), ${summary.errors} erreur(s).`,
  );

  if (summary.errors > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
