"use server";

import { updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { describeDbError } from "@/lib/supabase/errors";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import { SITE_SETTINGS_TAG } from "./queries";
import { whatsappNumberSchema } from "./schemas";

/**
 * Renseigne, change ou retire (champ vide) le numero WhatsApp du BDE. Pas de verification de role
 * ici : la RLS `site_settings_update_bde` est le verrou, et refuse un compte non BDE sans erreur
 * Postgres (0 ligne modifiee), d'ou le message explicite dans ce cas.
 */
export async function updateBdeWhatsappNumber(
  formData: FormData,
): Promise<ActionResult<{ number: string | null }>> {
  const parsed = whatsappNumberSchema.safeParse(
    formData.get("whatsappNumber") ?? "",
  );
  if (!parsed.success) {
    return actionError("Données invalides.", {
      whatsappNumber: [parsed.error.issues[0]?.message ?? "Numéro invalide."],
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .update({ bde_whatsapp_number: parsed.data })
    .eq("id", true)
    .select("id");
  if (error) {
    console.error("updateBdeWhatsappNumber", describeDbError(error));
    return actionError("Impossible d'enregistrer.");
  }
  if (!data || data.length === 0) {
    return actionError(
      "Votre compte n'a pas le droit de modifier ce réglage : il faut un compte BDE actif.",
    );
  }

  updateTag(SITE_SETTINGS_TAG);
  return actionOk({ number: parsed.data });
}
