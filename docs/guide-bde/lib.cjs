const { chromium } = require("@playwright/test");
const SP = __dirname;
const BASE = "http://localhost:3000";
const HIDE = "nextjs-portal{display:none!important} *{caret-color:transparent!important}";

async function open({ login = true, height = 900 } = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height }, deviceScaleFactor: 2, locale: "fr-FR" });
  const page = await ctx.newPage();
  if (login) {
    await page.goto(BASE + "/login");
    await page.fill("#email", "e2e-bde@esgis.test");
    await page.fill("#password", "mot-de-passe-e2e-114!");
    await page.click("button[type=submit]");
    await page.waitForURL("**/bde/accueil");
  }
  const shot = async (name, opts = {}) => {
    await page.addStyleTag({ content: HIDE }).catch(() => {});
    await page.mouse.move(0, 0);
    await page.waitForTimeout(opts.wait ?? 800);
    await page.screenshot({ path: `${SP}/shots/${name}.png`, ...opts.pw });
  };
  const go = async (u) => {
    await page.goto(BASE + u);
    await page.waitForLoadState("networkidle");
  };
  return { browser, page, shot, go, BASE, SP };
}
module.exports = { open };
