// Toutes les captures du guide BDE, dans l'ordre du parcours.
const { open } = require("./lib.cjs");
const fs = require("fs");

(async () => {
  const { browser, page, shot, go, SP } = await open({ login: false });
  const S = `${SP}/samples`;
  fs.mkdirSync(`${SP}/shots/final`, { recursive: true });

  // Zone de capture : union des boites des locators donnes, marge autour, en coordonnees page.
  const box = async (locs, pad = 24) => {
    const rects = [];
    for (const l of locs) {
      const b = await l.boundingBox();
      const sy = await page.evaluate(() => window.scrollY);
      rects.push({
        x: b.x,
        y: b.y + sy,
        x2: b.x + b.width,
        y2: b.y + b.height + sy,
      });
    }
    const x = Math.max(0, Math.min(...rects.map((r) => r.x)) - pad);
    const y = Math.max(0, Math.min(...rects.map((r) => r.y)) - pad);
    return {
      x,
      y,
      width: Math.min(1440, Math.max(...rects.map((r) => r.x2)) + pad) - x,
      height: Math.max(...rects.map((r) => r.y2)) + pad - y,
    };
  };
  const clip = async (name, locs, pad) => {
    await page.addStyleTag({
      content:
        "nextjs-portal{display:none!important} *{caret-color:transparent!important}",
    });
    await page.mouse.move(0, 0);
    await page.waitForTimeout(600);
    await page.screenshot({
      path: `${SP}/shots/final/${name}.png`,
      fullPage: true,
      clip: await box(locs, pad),
    });
  };
  // Variante sans fullPage : un redimensionnement de capture pleine page referme menus et dialogues.
  const vclip = async (name, locs, pad = 24) => {
    await page.mouse.move(0, 0);
    await page.waitForTimeout(400);
    const bs = [];
    for (const l of locs) bs.push(await l.boundingBox());
    const x = Math.max(0, Math.min(...bs.map((b) => b.x)) - pad),
      y = Math.max(0, Math.min(...bs.map((b) => b.y)) - pad);
    const x2 = Math.min(1440, Math.max(...bs.map((b) => b.x + b.width)) + pad),
      y2 = Math.max(...bs.map((b) => b.y + b.height)) + pad;
    await page.screenshot({
      path: `${SP}/shots/final/${name}.png`,
      clip: { x, y, width: x2 - x, height: y2 - y },
    });
  };
  const full = (name) => shot(`final/${name}`);
  const main = page.locator("main");
  const h = (t) => page.getByRole("heading", { name: t, exact: true });
  const txt = (t) => page.getByText(t, { exact: true });

  // 1. Connexion
  await go("/login");
  await page.fill("#email", "membre.bde@esgis.bj");
  await page.fill("#password", "motdepasse");
  await page.evaluate(() => document.activeElement.blur());
  await full("01-connexion");
  await page.fill("#email", "e2e-bde@esgis.test");
  await page.fill("#password", "mot-de-passe-e2e-114!");
  await page.click("button[type=submit]");
  await page.waitForURL("**/bde/accueil");

  // 2. Verser un lot de deux fichiers
  await go("/bde/epreuves/ajouter");
  await page.setInputFiles("input[type=file]", [
    `${S}/Algorithmique CT 2024-2025.pdf`,
    `${S}/Algorithmique CT 2023-2024.pdf`,
  ]);
  const years = page.getByRole("combobox", {
    name: "Année académique",
    exact: true,
  });
  await years.nth(0).selectOption("2024-2025");
  await years.nth(1).selectOption("2023-2024");
  await clip("03-verser-fichiers", [
    h("Téléverser vos fichiers"),
    txt("Seul le format PDF est supporté."),
  ]);

  const subject = page.getByRole("combobox", { name: "Matière *" });
  await subject.scrollIntoViewIfNeeded();
  await subject.pressSequentially("algo", { delay: 60 });
  const opt = page
    .getByRole("option", { name: /Algorithmique de base/ })
    .first();
  await opt.waitFor();
  await clip("04-verser-matiere", [
    h("Entrez les données de chaque épreuve"),
    opt,
    page.getByRole("combobox", { name: "Niveau *" }),
  ]);
  await subject.focus();
  await opt.click();
  await txt("Terminal").click();
  await txt("Normale").click();
  await clip("05-verser-formulaire", [
    txt("Matière *"),
    page.getByRole("button", { name: /Verser les épreuves/ }),
  ]);

  await page.getByRole("button", { name: /Verser les épreuves/ }).click();
  await h("Épreuves publiées").waitFor({ timeout: 60000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await clip(
    "06-verser-resultat",
    [
      page.getByRole("status"),
      page.locator("main ul").first(),
      page.getByRole("button", { name: "Verser d'autres épreuves" }),
    ],
    32,
  );

  // 3. Epreuves manquantes, puis versement depuis une lacune
  await go("/bde/filieres");
  const gestion = page.getByRole("heading", { name: "Gestion", level: 2 });
  const l1 = page.locator("ul").filter({ hasText: "Droit du Travail" }).first();
  await full("12-manquantes-page");
  await page
    .getByRole("link", { name: /Droit du Travail/ })
    .first()
    .click();
  await page.waitForURL("**/bde/epreuves/ajouter**");
  await page.waitForLoadState("networkidle");
  await page.setInputFiles("input[type=file]", [
    `${S}/Droit du travail CT 2024-2025.pdf`,
  ]);
  await years.nth(0).selectOption("2024-2025");
  await clip("13-manquante-prerempli", [
    txt("Matière *"),
    page
      .getByRole("combobox", { name: "Niveau *" })
      .or(txt("Changer de matière"))
      .last(),
  ]);
  await txt("Terminal").click();
  await txt("Normale").click();
  await page.getByRole("button", { name: /Verser l'épreuve/ }).click();
  await h("Épreuve publiée").waitFor({ timeout: 60000 });

  // 4. Accueil, une fois les versements faits
  await go("/bde/accueil");
  await page.getByText("Mes derniers versements").waitFor();
  await page.waitForLoadState("networkidle");
  // Pastilles numerotees posees sur les elements a decrire (legende dans le guide).
  const marks = [
    ["link", "Accueil", "r"],
    ["link", "Verser", "r"],
    ["link", "Mes épreuves", "r"],
    ["link", "Épreuves manquantes", "r"],
    ["link", "Réglages", "r"],
    ["button", "Se déconnecter", "r"],
    ["link", "Verser une épreuve", "l"],
    ["link", /matières? sans épreuve/, "l"],
    ["searchbox", null, "l"],
    ["heading", /Mes derniers versements/, "l"],
  ];
  for (let i = 0; i < marks.length; i++) {
    const [role, name, side] = marks[i];
    const loc =
      role === "searchbox"
        ? page.getByLabel("Rechercher une épreuve").first()
        : page
            .getByRole(role, { name, exact: typeof name === "string" })
            .first();
    const b = await loc.boundingBox();
    await page.evaluate(
      ({ b, n, side }) => {
        const d = document.createElement("div");
        d.textContent = n;
        const x = side === "r" ? b.x + b.width - 34 : b.x - 40;
        Object.assign(d.style, {
          position: "fixed",
          left: x + "px",
          top: b.y + b.height / 2 - 14 + "px",
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "#c41c2d",
          color: "#fff",
          font: "700 14px/28px Arial, sans-serif",
          textAlign: "center",
          boxShadow: "0 0 0 3px #fff, 0 2px 6px rgba(0,0,0,.35)",
          zIndex: 99999,
        });
        document.body.appendChild(d);
      },
      { b, n: String(i + 1), side },
    );
  }
  await full("02-accueil");

  // 5. Mes epreuves, menu d'une carte ouvert
  await page.setViewportSize({ width: 1440, height: 1300 });
  await go("/bde/mes-epreuves");
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await page
    .getByRole("button", { name: /Gérer l'épreuve/ })
    .first()
    .click();
  await page.waitForTimeout(400);
  await vclip(
    "07-mes-epreuves-menu",
    [
      txt("Masquer les filtres"),
      page.getByText(/épreuves trouvées/),
      page.getByText("Supprimer l'épreuve", { exact: true }).first(),
    ],
    28,
  );
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1440, height: 900 });

  // 6. Fiche d'une epreuve
  const fichePath = await page
    .getByRole("link", { name: /Voir la fiche de Algorithmique/ })
    .first()
    .getAttribute("href");
  await go(fichePath);
  const ficheUrl = page.url();
  await full("08-fiche");

  // 7. Modifier les donnees
  await go(new URL(ficheUrl).pathname + "/modifier");
  await full("09-modifier");

  // 8. Remplacer le fichier
  await go(new URL(ficheUrl).pathname + "/remplacer");
  await full("10-remplacer-page");
  await page.setInputFiles("input[type=file]", [
    `${S}/Algorithmique CT 2024-2025 version lisible.pdf`,
  ]);
  await page.waitForTimeout(500);
  await full("10-remplacer");
  console.log("--- remplacer\n" + (await main.ariaSnapshot()));

  // 9. Suppression : fenetre de confirmation, annulee
  await go("/bde/mes-epreuves");
  await page
    .getByRole("button", { name: /Gérer l'épreuve/ })
    .first()
    .click();
  await page.getByText("Supprimer l'épreuve", { exact: true }).first().click();
  await page.waitForTimeout(400);
  await vclip("11-supprimer", [page.getByRole("dialog")], 70);
  await page.getByRole("button", { name: "Annuler" }).click();

  // 10. Recherche
  await go("/bde/accueil");
  await page
    .getByRole("searchbox")
    .or(page.getByPlaceholder("Rechercher une épreuve..."))
    .first()
    .fill("Algorithmique");
  await page
    .getByRole("button", { name: /Rechercher/ })
    .first()
    .click();
  await page.waitForURL("**/bde/catalogue**");
  await page.waitForLoadState("networkidle");
  await full("14-recherche");

  // 11. Reglages
  await go("/bde/reglages");
  await page
    .getByLabel("Numéro au format international")
    .fill("+229 01 97 00 00 00");
  await page.getByRole("button", { name: "Enregistrer le numéro" }).click();
  await page.waitForTimeout(1500);
  await full("15-reglages");
  console.log("--- reglages\n" + (await main.ariaSnapshot()));
  await page.getByLabel("Numéro au format international").fill("");
  await page.getByRole("button", { name: "Enregistrer le numéro" }).click();
  await page.waitForTimeout(1500);

  // 12. Mobile : menu ferme puis ouvert
  await page.setViewportSize({ width: 390, height: 844 });
  await go("/bde/accueil");
  await page.getByText("Mes derniers versements").waitFor();
  await shot("final/16-mobile", {
    pw: { clip: { x: 0, y: 0, width: 390, height: 470 } },
  });
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await page.waitForTimeout(500);
  await shot("final/16-mobile-menu", {
    pw: { clip: { x: 0, y: 0, width: 390, height: 470 } },
  });

  await browser.close();
})();
