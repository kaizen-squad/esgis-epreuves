// HTML -> PDF A4 en deux passes : la seconde inscrit au sommaire la page de chaque section.
const { chromium } = require("@playwright/test");
const { execFileSync } = require("child_process");
const SP = __dirname;
const OUT = `${SP}/guide/guide-bde.pdf`;
const TITLES = {
  s1: "Se connecter",
  s2: "Découvrir votre espace",
  s3: "Verser une épreuve",
  s4: "Retrouver une épreuve",
  s5: "Corriger ou retirer une épreuve",
  s6: "Combler les épreuves manquantes",
  s7: "Tenir à jour le numéro WhatsApp",
  s8: "Passation entre deux bureaux",
  s9: "En cas de difficulté",
};

async function render(page, pages) {
  await page.goto(`file://${SP}/guide/guide-inline.html`);
  await page.evaluate(() => document.fonts.ready);
  if (pages) {
    await page.evaluate((pages) => {
      for (const [id, n] of Object.entries(pages))
        document.querySelector(`[data-toc="${id}"]`).textContent = n;
    }, pages);
  }
  await page.pdf({
    path: OUT,
    preferCSSPageSize: true,
    printBackground: true,
    tagged: true,
    outline: true,
  });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await render(page);
  const count = Number(
    /Pages:\s+(\d+)/.exec(execFileSync("pdfinfo", [OUT]).toString())[1],
  );
  const found = {};
  for (let p = 3; p <= count; p++) {
    const text = execFileSync("pdftotext", [
      "-f",
      String(p),
      "-l",
      String(p),
      OUT,
      "-",
    ]).toString();
    for (const [id, t] of Object.entries(TITLES)) {
      if (
        !found[id] &&
        new RegExp(`^${id.slice(1)}\\.\\s*${t}`, "m").test(text)
      )
        found[id] = p;
    }
  }
  console.log(count, "pages", found);
  await render(page, found);
  await page.close();
  await browser.close();
})();
