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

  // Le champ debounce 300ms avant de pousser `?search=...` via router.replace : sans attendre
  // que cette navigation ait eu lieu, elle peut se declencher juste apres le clic sur
  // "Visualiser" et ramener le navigateur sur /catalogue.
  await page.waitForURL(
    (url) => url.searchParams.get("search") === SEARCHABLE_EXAM_TITLE,
  );

  const card = page.locator("article", { hasText: SEARCHABLE_EXAM_TITLE });
  await expect(card).toBeVisible();
  await card.scrollIntoViewIfNeeded();
  // Toute la carte mene a la fiche (R-09) : plus de lien "Visualiser" distinct. Le clic par
  // defaut (centre de la carte) peut tomber sur la cote (ex. "FISCALITÉ"), qui a son propre lien
  // vers le catalogue filtre et passe devant ce lien plein cadre par empilement volontaire (voir
  // ExamCard.tsx) : on cible la vignette du fichier en haut a gauche, jamais couverte par un lien
  // plus specifique.
  const link = card.getByRole("link", { name: `Voir la fiche de` });
  await link.click({ position: { x: 10, y: 10 } });

  await expect(
    page.getByRole("heading", { name: SEARCHABLE_EXAM_TITLE, level: 1 }),
  ).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Télécharger l'épreuve" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
});
