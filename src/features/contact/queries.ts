import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { describeDbError } from "@/lib/supabase/errors";
import { whatsappHref } from "./whatsapp";

/** Tag des reglages du site, invalide par `updateBdeWhatsappNumber` des l'enregistrement. */
export const SITE_SETTINGS_TAG = "site-settings";

const SITE_SETTINGS_REVALIDATE_SECONDS = 3600;

const BDE_CONTACT_MESSAGE =
  "Bonjour, je vous contacte à propos d'Alexandria, le site des épreuves ESGIS.";

const getBdeWhatsappNumberCached = unstable_cache(
  async (): Promise<string | null> => {
    const { data, error } = await createPublicClient()
      .from("site_settings")
      .select("bde_whatsapp_number")
      .maybeSingle();
    if (error) throw error;
    return data?.bde_whatsapp_number ?? null;
  },
  ["bde-whatsapp-number"],
  { revalidate: SITE_SETTINGS_REVALIDATE_SECONDS, tags: [SITE_SETTINGS_TAG] },
);

/**
 * Numero WhatsApp du BDE (E.164) ou `null` s'il n'est pas defini. Exception assumee a la
 * convention des `queries.ts` : une erreur de lecture renvoie `null` au lieu de lever, car le
 * pied de page de chaque page en depend et le lien reste utilisable sans numero.
 */
export async function getBdeWhatsappNumber(): Promise<string | null> {
  try {
    return await getBdeWhatsappNumberCached();
  } catch (error) {
    console.error(
      "getBdeWhatsappNumber",
      error instanceof Error ? error.message : describeDbError(error ?? {}),
    );
    return null;
  }
}

/** Lien "Nous contacter" du BDE : pied de page, FAQ de l'accueil, et tout futur contact. */
export async function getBdeContactHref(): Promise<string> {
  return whatsappHref(BDE_CONTACT_MESSAGE, await getBdeWhatsappNumber());
}
