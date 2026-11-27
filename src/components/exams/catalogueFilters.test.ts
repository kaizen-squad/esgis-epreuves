import { describe, expect, it } from "vitest";
import { CATALOGUE_PAGE_SIZE, toExamFilters } from "./catalogueFilters";

describe("toExamFilters", () => {
  it("garde la page de l'URL et fixe la taille de page du catalogue", () => {
    expect(
      toExamFilters({ page: "3", levelId: ["a", "b"], pageSize: "50" }),
    ).toEqual({ page: "3", levelId: "a", pageSize: CATALOGUE_PAGE_SIZE });
  });

  it("retire la session d'une URL perimee ou partagee qui porte aussi un Controle Continu (#196/#203)", () => {
    expect(
      toExamFilters({ examType: "Contrôle Continu", session: "Rattrapage" }),
    ).toEqual({ examType: "Contrôle Continu", pageSize: CATALOGUE_PAGE_SIZE });
  });

  it("garde la session pour un Controle Terminal", () => {
    expect(
      toExamFilters({
        examType: "Contrôle Terminal",
        session: "Rattrapage",
      }),
    ).toEqual({
      examType: "Contrôle Terminal",
      session: "Rattrapage",
      pageSize: CATALOGUE_PAGE_SIZE,
    });
  });
});
