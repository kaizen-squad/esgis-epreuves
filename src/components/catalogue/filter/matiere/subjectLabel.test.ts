import { describe, expect, it } from "vitest";
import { subjectLabelWithCount } from "./subjectLabel";

describe("subjectLabelWithCount", () => {
  it("ajoute le compte entre parentheses quand il est connu", () => {
    expect(subjectLabelWithCount("Langage C", 5)).toBe("Langage C (5)");
  });

  it("affiche (0) pour une matiere sans aucune epreuve", () => {
    expect(subjectLabelWithCount("Algorithmique", 0)).toBe("Algorithmique (0)");
  });

  it("renvoie le nom seul quand le compte est inconnu (#147 hors page filiere)", () => {
    expect(subjectLabelWithCount("Langage C", undefined)).toBe("Langage C");
  });
});
