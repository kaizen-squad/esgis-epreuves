import { z } from "zod";

/** Meme regle que la contrainte `site_settings.bde_whatsapp_number` (E.164 : `+` puis 8 a 15 chiffres). */
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

/**
 * Numero WhatsApp saisi par le BDE : espaces, points, tirets et parentheses toleres, `00` accepte
 * a la place du `+`, stocke au format E.164. Un champ vide retire le numero (`null`).
 */
export const whatsappNumberSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s.()-]/g, "").replace(/^00/, "+"))
  .refine(
    (value) => value === "" || E164_PATTERN.test(value),
    "Saisissez le numéro au format international, indicatif compris (ex. +229 01 23 45 67 89).",
  )
  .transform((value) => value || null);
