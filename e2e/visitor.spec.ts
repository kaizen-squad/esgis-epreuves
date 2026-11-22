import { expect, test } from "@playwright/test";
import { SEARCHABLE_EXAM_TITLE } from "./fixtures";

/**
 * Parcours visiteur (#114) : recherche d'une epreuve, ouverture de sa page de detail,
 * telechargement du fichier. Sans connexion : c'est le catalogue public.
 */
test("un visiteur recherche une epreuve, l'ouvre et telecharge son fichier", async ({
  page,
}) => {
  await page.goto("/catalogue");

  await page
    .getByRole("searchbox", { name: "Rechercher une épreuve" })
    .first()
    .fill(SEARCHABLE_EXAM_TITLE);

  const card = page.locator("article", { hasText: SEARCHABLE_EXAM_TITLE });
  await expect(card).toBeVisible();
  await card.scrollIntoViewIfNeeded();
  const link = card.getByRole("link", { name: "Visualiser" });
  // L'apercu PDF de la carte charge en differe (succes ou 404) et decale encore la mise en page
  // juste apres le scroll : sans attendre une position stable entre deux lectures, le clic peut
  // partir avant que le lien n'ait fini de se stabiliser a sa position finale.
  let previousBox = await link.boundingBox();
  await expect(async () => {
    const box = await link.boundingBox();
    expect(box).toEqual(previousBox);
    previousBox = box;
  }).toPass();
  await link.click();

  await expect(
    page.getByRole("heading", { name: SEARCHABLE_EXAM_TITLE, level: 1 }),
  ).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Télécharger l'épreuve" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
});
