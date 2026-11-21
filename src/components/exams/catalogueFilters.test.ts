import { describe, expect, it } from "vitest";
import { CATALOGUE_PAGE_SIZE, toExamFilters } from "./catalogueFilters";

describe("toExamFilters", () => {
  it("garde la page de l'URL et fixe la taille de page du catalogue", () => {
    expect(
      toExamFilters({ page: "3", levelId: ["a", "b"], pageSize: "50" }),
    ).toEqual({ page: "3", levelId: "a", pageSize: CATALOGUE_PAGE_SIZE });
  });
});
