import { describe, expect, it } from "vitest";
import { r2UploadErrorMessage } from "./errors";

describe("r2UploadErrorMessage", () => {
  it("signale un refus d'acces R2 (403, jeton ou bucket)", () => {
    for (const error of [
      { name: "AccessDenied", $metadata: { httpStatusCode: 403 } },
      { name: "InvalidAccessKeyId" },
      { name: "Unknown", $metadata: { httpStatusCode: 401 } },
    ]) {
      expect(r2UploadErrorMessage(error)).toContain("refusé l'envoi");
    }
  });

  it("garde le message generique pour les autres erreurs", () => {
    expect(r2UploadErrorMessage(new Error("network"))).toBe(
      "Impossible de deposer le fichier.",
    );
    expect(r2UploadErrorMessage(undefined)).toBe(
      "Impossible de deposer le fichier.",
    );
  });
});
