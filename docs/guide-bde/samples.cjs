// PDF d'exemple factices, contenu distinct (la detection de doublons compare les octets).
const { open } = require("./lib.cjs");
const fs = require("fs");
const samples = [
  ["Algorithmique CT 2024-2025.pdf", "Algorithmique de base", "Contrôle terminal, session normale", "2024-2025", "Licence 1, IRT"],
  ["Algorithmique CT 2023-2024.pdf", "Algorithmique de base", "Contrôle terminal, session normale", "2023-2024", "Licence 1, IRT"],
  ["Droit du travail CT 2024-2025.pdf", "Droit du Travail", "Contrôle terminal, session normale", "2024-2025", "Licence 1, Gestion"],
  ["Algorithmique CT 2024-2025 version lisible.pdf", "Algorithmique de base", "Contrôle terminal, session normale", "2024-2025", "Licence 1, IRT (scan corrigé)"],
];
(async () => {
  const { browser, page, SP } = await open({ login: false });
  fs.rmSync(`${SP}/samples`, { recursive: true, force: true });
  fs.mkdirSync(`${SP}/samples`);
  for (const [file, matiere, type, annee, niveau] of samples) {
    await page.setContent(`<body style="font-family:serif;padding:48px;line-height:1.5">
      <p style="text-align:center;font-weight:bold">ESGIS, ${niveau}<br>Année académique ${annee}</p>
      <h2 style="text-align:center">${matiere}</h2><p style="text-align:center">${type}. Durée : 2 heures. Documents non autorisés.</p>
      <h3>Exercice 1 (6 points)</h3><p>Questions de cours.</p>
      <h3>Exercice 2 (14 points)</h3><p>Étude de cas, ${file}.</p></body>`);
    await page.pdf({ path: `${SP}/samples/${file}`, format: "A4" });
  }
  await browser.close();
})();
