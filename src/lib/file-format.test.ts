import { describe, expect, it } from "vitest";
import { formatFileSize, formatFileType } from "./file-format";

describe("formatFileSize", () => {
  it("garde les octets exacts sous 1 Ko", () => {
    expect(formatFileSize(614)).toBe("614 o");
  });

  it("affiche au plus une decimale, a la francaise", () => {
    expect(formatFileSize(512 * 1024)).toBe("512 Ko");
    expect(formatFileSize(353_485)).toBe("345,2 Ko");
    expect(formatFileSize(1.6 * 1024 * 1024)).toBe("1,6 Mo");
  });
});

describe("formatFileType", () => {
  it("deduit le libelle du type MIME reel", () => {
    expect(formatFileType("application/pdf")).toBe("PDF");
    expect(formatFileType("application/pdf; charset=binary")).toBe("PDF");
    expect(formatFileType("image/png")).toBe("PNG");
  });

  it("reste neutre quand le type est inconnu", () => {
    expect(formatFileType("")).toBe("Fichier");
  });
});
