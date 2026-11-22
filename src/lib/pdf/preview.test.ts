import { loadImage } from "@napi-rs/canvas";
import { describe, expect, it } from "vitest";
import { PREVIEW_HEIGHT, PREVIEW_WIDTH, renderPdfPreview } from "./preview";

/** PDF minimal d'une page A4 (sans table xref : pdf.js la reconstruit). */
const PDF = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] >>
endobj
trailer
<< /Size 4 /Root 1 0 R >>
%%EOF`;

describe("renderPdfPreview", () => {
  it("rend le haut de la premiere page au format de la carte", async () => {
    const image = await loadImage(await renderPdfPreview(Buffer.from(PDF)));

    expect(image.width).toBe(PREVIEW_WIDTH);
    expect(image.height).toBe(PREVIEW_HEIGHT);
  });

  it("refuse un fichier qui n'est pas un PDF", async () => {
    await expect(renderPdfPreview(Buffer.from("pas un pdf"))).rejects.toThrow();
  });
});
