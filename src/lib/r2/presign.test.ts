import { describe, expect, it } from "vitest";
import { contentDisposition } from "./presign";

describe("contentDisposition", () => {
  it("previsualisation (en ligne) quand download est faux", () => {
    expect(contentDisposition(false, "algo-1.pdf")).toBe(
      'inline; filename="algo-1.pdf"',
    );
  });

  it("telechargement (piece jointe) quand download est vrai", () => {
    expect(contentDisposition(true, "algo-1.pdf")).toBe(
      'attachment; filename="algo-1.pdf"',
    );
  });
});
