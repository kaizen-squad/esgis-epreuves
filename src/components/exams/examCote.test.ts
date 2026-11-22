import { describe, expect, it } from "vitest";
import { examCote } from "./examCote";

describe("examCote", () => {
  it("joint les segments dans l'ordre filière, niveau, matière, année, type", () => {
    expect(
      examCote({
        field: "Informatique, Réseaux et Télécommunications",
        level: "L2",
        subject: "Algèbre",
        academicYear: "2023-2024",
        examType: "Contrôle Terminal",
      }),
    ).toBe("IRT : L2 : ALGÈBRE : 2023-2024 : CT");
  });

  it("abrège le contrôle continu", () => {
    expect(
      examCote({
        field: "Gestion",
        level: "L1",
        subject: "Comptabilité",
        academicYear: "2024-2025",
        examType: "Contrôle Continu",
      }),
    ).toBe("Gestion : L1 : COMPTABILITÉ : 2024-2025 : CC");
  });

  it("omet un champ manquant sans laisser de segment vide", () => {
    expect(
      examCote({
        field: "Gestion",
        level: "L1",
        subject: "Comptabilité",
        academicYear: "2024-2025",
        examType: null,
      }),
    ).toBe("Gestion : L1 : COMPTABILITÉ : 2024-2025");
  });

  it("omet plusieurs champs manquants, y compris un champ absent du type", () => {
    expect(examCote({ level: "L3", subject: "Réseaux" })).toBe("L3 : RÉSEAUX");
  });

  it("renvoie une chaîne vide quand aucun champ n'est fourni", () => {
    expect(examCote({})).toBe("");
  });
});
