import { describe, expect, it } from "vitest";
import { fieldPageTitle } from "./fieldLabel";

describe("fieldPageTitle", () => {
  it("affiche Tronc commun en L1, seul niveau sans option pour les deux filieres reelles (#195)", () => {
    expect(fieldPageTitle("Gestion", null, "L1", [])).toBe(
      "L1 Gestion : Tronc commun",
    );
  });

  it("affiche les options en L2, mixte au programme reel (tronc commun au S3, options au S4, #195)", () => {
    expect(
      fieldPageTitle(
        "Informatique, Réseaux et Télécommunications",
        "IRT",
        "L2",
        [
          "Architecture Logicielle (AL)",
          "Sécurité Informatique (SI)",
          "Systèmes Réseaux et Cloud (SRC)",
        ],
      ),
    ).toBe("L2 IRT : AL / SI / SRC");
  });

  it("affiche les options en L3", () => {
    expect(
      fieldPageTitle(
        "Informatique, Réseaux et Télécommunications",
        "IRT",
        "L3",
        ["Architecture Logicielle (AL)"],
      ),
    ).toBe("L3 IRT : AL");
  });

  it("n'affiche que l'abreviation de la filiere sans niveau", () => {
    expect(fieldPageTitle("Gestion", null, null, [])).toBe("Gestion");
  });
});
