import { expect, test } from "@playwright/test";
import { login } from "./auth";
import { e2eAdmin, e2eMember } from "./fixtures";

/**
 * Parcours admin (#114) : connexion, activation puis desactivation d'un membre.
 * `e2eMember` demarre desactive (voir `fixtures.ts`) : ce parcours l'active, puis le desactive,
 * dans l'ordre attendu par le ticket.
 */
test("un admin se connecte, active puis desactive un membre", async ({
  page,
}) => {
  await login(page, e2eAdmin.email, e2eAdmin.password);
  await expect(page).toHaveURL(/\/admin/);

  await page.getByLabel("Rechercher un membre").fill(e2eMember.email);

  const row = page.getByRole("row", { name: e2eMember.email });
  await expect(row).toContainText("Désactivé");

  await row
    .getByRole("button", { name: `Activer ${e2eMember.fullName}` })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Activer", exact: true })
    .click();
  await expect(row).toContainText("Actif");

  await row
    .getByRole("button", { name: `Désactiver ${e2eMember.fullName}` })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Désactiver", exact: true })
    .click();
  await expect(row).toContainText("Désactivé");
});
