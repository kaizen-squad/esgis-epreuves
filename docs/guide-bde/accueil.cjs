// Accueil annote : fenetre de 860 px de haut pour que la section suivante ne soit pas coupee en bas.
const { open } = require("./lib.cjs");
(async () => {
  const { browser, page, shot, go } = await open({ height: 860 });
  await go("/bde/accueil");
  await page.getByText("Mes derniers versements").waitFor();
  await page.waitForLoadState("networkidle");
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  // Le titre de la section suivante depasserait en bas de la capture : masque, pas retire.
  await page.getByRole("heading", { name: /Dernières épreuves de l'équipe/ }).evaluate((el) => (el.style.visibility = "hidden"));
  const marks = [
    ["link", "Accueil", "r"], ["link", "Verser", "r"], ["link", "Mes épreuves", "r"],
    ["link", "Épreuves manquantes", "r"], ["link", "Réglages", "r"], ["button", "Se déconnecter", "r"],
    ["link", "Verser une épreuve", "l"], ["link", /matières? sans épreuve/, "l"],
    ["search", null, "l"], ["heading", /Mes derniers versements/, "l"],
  ];
  for (let i = 0; i < marks.length; i++) {
    const [role, name, side] = marks[i];
    const loc = role === "search" ? page.getByLabel("Rechercher une épreuve").first() : page.getByRole(role, { name, exact: typeof name === "string" }).first();
    const b = await loc.boundingBox();
    await page.evaluate(({ b, n, side }) => {
      const d = document.createElement("div");
      d.textContent = n;
      const x = side === "r" ? b.x + b.width - 22 : b.x - 40;
      Object.assign(d.style, { position: "fixed", left: x + "px", top: b.y + b.height / 2 - 14 + "px", width: "28px", height: "28px", borderRadius: "50%", background: "#c41c2d", color: "#fff", font: "700 14px/28px Arial, sans-serif", textAlign: "center", boxShadow: "0 0 0 3px #fff, 0 2px 6px rgba(0,0,0,.35)", zIndex: 99999 });
      document.body.appendChild(d);
    }, { b, n: String(i + 1), side });
  }
  await shot("final/02-accueil");
  await browser.close();
})();
