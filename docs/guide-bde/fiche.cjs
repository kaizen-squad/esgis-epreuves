// Fiche d'epreuve en Chrome avec interface (le lecteur PDF de l'apercu ne s'affiche pas en headless).
const { chromium } = require("@playwright/test");
const SP = __dirname;
(async () => {
  const browser = await chromium.launch({ headless: false, channel: "chrome" });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    locale: "fr-FR",
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/login");
  await page.fill("#email", "e2e-bde@esgis.test");
  await page.fill("#password", "mot-de-passe-e2e-114!");
  await page.click("button[type=submit]");
  await page.waitForURL("**/bde/accueil");
  await page.goto("http://localhost:3000/bde/mes-epreuves");
  const href = await page
    .getByRole("link", { name: /Voir la fiche de Algorithmique/ })
    .first()
    .getAttribute("href");
  await page.goto("http://localhost:3000" + href);
  await page.waitForLoadState("networkidle");
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${SP}/shots/final/08-fiche.png` });
  await browser.close();
})();
