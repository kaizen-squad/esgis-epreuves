import path from "node:path";
import { createCanvas } from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

/** Deux fois la largeur d'une carte (20rem) : net sur un ecran haute densite. */
export const PREVIEW_WIDTH = 640;
/** Meme ratio que le cadre de l'image d'`ExamCard` (2/1) : seul le haut de la page est rendu. */
export const PREVIEW_HEIGHT = 320;

const WEBP_QUALITY = 80;

const PDFJS_DIR = path.join(process.cwd(), "node_modules/pdfjs-dist");
/** Polices standard (Helvetica, Times...) : un PDF n'est pas oblige de les embarquer. */
const STANDARD_FONTS_DIR = `${PDFJS_DIR}/standard_fonts/`;
/** Decodeurs d'images des PDF scannes (JPEG 2000, JBIG2). */
const WASM_DIR = `${PDFJS_DIR}/wasm/`;

/**
 * Apercu d'un PDF : le haut de sa premiere page, en WebP. La page est mise a l'echelle de la
 * largeur voulue, ce qui depasse de la hauteur n'est pas dessine. Leve une erreur si le fichier
 * n'est pas un PDF lisible (corrompu, protege par mot de passe).
 */
export async function renderPdfPreview(file: Uint8Array): Promise<Buffer> {
  const loadingTask = getDocument({
    // Copie : pdf.js prend possession du tampon recu, et refuse un Buffer Node.
    data: new Uint8Array(file),
    standardFontDataUrl: STANDARD_FONTS_DIR,
    wasmUrl: WASM_DIR,
    useSystemFonts: false,
    verbosity: 0,
  });
  try {
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const scale = PREVIEW_WIDTH / page.getViewport({ scale: 1 }).width;

    const canvas = createCanvas(PREVIEW_WIDTH, PREVIEW_HEIGHT);
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);

    await page.render({
      canvas: canvas as unknown as HTMLCanvasElement,
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport: page.getViewport({ scale }),
    }).promise;

    return await canvas.encode("webp", WEBP_QUALITY);
  } finally {
    await loadingTask.destroy();
  }
}
