import path from "node:path";
import { expect, test } from "@playwright/test";
import { login } from "./auth";
import { ADD_EXAM_SUBJECT, e2eBde } from "./fixtures";

/** Parcours BDE (#114) : connexion, ajout d'une epreuve avec fichier. */
test("un membre BDE se connecte et publie une epreuve avec son fichier", async ({
  page,
}) => {
  await login(page, e2eBde.email, e2eBde.password);
  await expect(page).toHaveURL(/\/bde\/accueil/);

  await page.goto("/bde/epreuves/ajouter");

  await page
    .locator('input[type="file"]')
    .setInputFiles(path.join(__dirname, "fixtures", "exemple.pdf"));

  await page.getByRole("combobox", { name: "Matière" }).fill(ADD_EXAM_SUBJECT);
  await page.getByRole("option", { name: ADD_EXAM_SUBJECT }).first().click();

  // Radios visuellement masquees (`sr-only`), leur `<label>` (le chip) recoit le clic.
  await page.getByRole("radio", { name: "Normale" }).check({ force: true });
  await page.getByRole("radio", { name: "Terminal" }).check({ force: true });

  await page.getByLabel("Année académique").selectOption({ index: 1 });

  await page.getByRole("button", { name: "Publier l'Épreuve" }).click();

  // L'etape "Publication en cours..." a aussi role="status" : laisser le temps a l'upload
  // (fichier + verification de doublon) de finir avant que le resultat ne la remplace.
  await expect(page.getByRole("status")).toContainText("publiée", {
    timeout: 15_000,
  });
});
