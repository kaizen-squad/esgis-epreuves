import { defineConfig, devices } from "@playwright/test";

/**
 * Filet de securite (#114) : trois parcours critiques (visiteur, BDE, admin) contre une base
 * Supabase locale et son stockage S3 (en CI, tient lieu de R2) seedes par `scripts/seed-e2e.ts`.
 * L'app tournante est le build de production (`pnpm start`), pas `next dev`, pour tester ce qui
 * sera deploye.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Jamais de retry : les trois parcours ne sont pas rejouables tels quels (le BDE verrait son
  // depot refuse comme doublon, l'admin repartirait d'un membre deja dans l'etat cible), un retry
  // masquerait l'echec reel sous une erreur differente plutot que de le reveler (flaky = casse).
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
