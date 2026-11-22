import { describe, expect, it } from "vitest";
import { describeDbError, examInsertErrorMessage } from "./errors";

describe("describeDbError", () => {
  it("garde le code et le message sur une ligne", () => {
    expect(
      describeDbError({ code: "42501", message: "refuse", details: null }),
    ).toBe("[42501] refuse");
  });

  it("ajoute details et hint s'ils existent", () => {
    expect(
      describeDbError({ code: "23503", message: "m", details: "d", hint: "h" }),
    ).toBe("[23503] m (d ; h)");
  });

  it("reste lisible sans aucune information", () => {
    expect(describeDbError({})).toBe("[sans code] sans message");
  });
});

describe("examInsertErrorMessage", () => {
  it("signale un refus de la RLS (compte non BDE ou desactive)", () => {
    expect(examInsertErrorMessage({ code: "42501" })).toContain(
      "compte BDE actif",
    );
  });

  it("garde le message generique pour les autres erreurs", () => {
    expect(examInsertErrorMessage({ code: "23503" })).toBe(
      "Impossible d'enregistrer l'epreuve.",
    );
  });
});
