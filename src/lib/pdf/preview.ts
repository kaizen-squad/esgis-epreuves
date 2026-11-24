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

function openPdf(file: Uint8Array) {
  return getDocument({
    // Copie : pdf.js prend possession du tampon recu, et refuse un Buffer Node.
    data: new Uint8Array(file),
    standardFontDataUrl: STANDARD_FONTS_DIR,
    wasmUrl: WASM_DIR,
    useSystemFonts: false,
    verbosity: 0,
  });
}

/**
 * Apercu d'un PDF : le haut de sa premiere page, en WebP. La page est mise a l'echelle de la
 * largeur voulue, ce qui depasse de la hauteur n'est pas dessine. Leve une erreur si le fichier
 * n'est pas un PDF lisible (corrompu, protege par mot de passe).
 */
export async function renderPdfPreview(file: Uint8Array): Promise<Buffer> {
  const loadingTask = openPdf(file);
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

/** Largeur du rendu complet : deux fois celle d'une carte, lisible sur un ecran de telephone. */
export const FULL_PAGE_WIDTH = 640;
/**
 * Hauteur maximale du rendu : une page MediaBox demesuree (PDF corrompu ou malveillant) ne doit
 * pas forcer l'allocation d'un canvas arbitrairement grand. Largement au-dessus d'un A4 a cette
 * largeur (~905px) ; au-dela, la page est recadree plutot que rendue en entier.
 */
const MAX_FULL_PAGE_HEIGHT = 2400;

/**
 * Apercu de la premiere page entiere (pas seulement son haut), avec le nombre total de pages :
 * pour laisser verifier le bon sujet sur mobile sans charger tout le PDF (R-28). Meme erreurs que
 * `renderPdfPreview` sur un fichier illisible.
 */
export async function renderPdfFirstPageFull(
  file: Uint8Array,
): Promise<{ image: Buffer; pageCount: number }> {
  const loadingTask = openPdf(file);
  try {
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const scale = FULL_PAGE_WIDTH / page.getViewport({ scale: 1 }).width;
    if (!Number.isFinite(scale) || scale <= 0) {
      throw new Error("Dimensions de page PDF invalides");
    }
    const viewport = page.getViewport({ scale });
    if (
      !Number.isFinite(viewport.width) ||
      !Number.isFinite(viewport.height) ||
      viewport.height <= 0
    ) {
      throw new Error("Dimensions de page PDF invalides");
    }
    const height = Math.min(Math.round(viewport.height), MAX_FULL_PAGE_HEIGHT);

    const canvas = createCanvas(FULL_PAGE_WIDTH, height);
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, FULL_PAGE_WIDTH, height);

    await page.render({
      canvas: canvas as unknown as HTMLCanvasElement,
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport,
    }).promise;

    return {
      image: await canvas.encode("webp", WEBP_QUALITY),
      pageCount: pdf.numPages,
    };
  } finally {
    await loadingTask.destroy();
  }
}
