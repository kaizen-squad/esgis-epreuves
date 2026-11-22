"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import { getCurrentUserRole } from "./queries";
import { memberCreateSchema, memberUpdateSchema, toFullName } from "./schemas";

const FORBIDDEN = "Action réservée à l'administrateur.";
const NOT_CONFIGURED =
  "Action indisponible : configuration du serveur incomplète. Contactez le support technique.";
const EMAIL_TAKEN = "Un compte utilise déjà cet email.";

/**
 * Gestion des comptes BDE par l'Admin. Creer un compte Auth exige l'API d'administration Supabase
 * (cle secrete, qui contourne la RLS) : le role ADMIN de l'appelant est donc verifie ici, en
 * premier, avant toute ecriture. Un compte BDE n'a pas d'inscription publique (#15) : ces actions
 * sont le seul moyen d'en creer un hors dashboard Supabase.
 */
async function adminClientForCaller() {
  if ((await getCurrentUserRole()) !== "ADMIN") return { error: FORBIDDEN };
  const admin = createAdminClient();
  if (!admin) {
    console.error("adminClientForCaller: SUPABASE_SECRET_KEY manquante");
    return { error: NOT_CONFIGURED };
  }
  return { admin };
}

function readForm(formData: FormData) {
  return {
    lastName: formData.get("lastName"),
    firstNames: formData.get("firstNames"),
    email: formData.get("email"),
    password: formData.get("password"),
  };
}

function isEmailTaken(error: { code?: string; status?: number } | null) {
  return error?.code === "email_exists" || error?.status === 422;
}

/** Cree un compte BDE (Auth + profil). Le compte est confirme d'office : pas d'email d'invitation. */
export async function createBdeMember(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = memberCreateSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return actionError(
      "Informations invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const caller = await adminClientForCaller();
  if (!caller.admin) return actionError(caller.error);
  const { admin } = caller;
  const { lastName, firstNames, email, password } = parsed.data;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { last_name: lastName, first_names: firstNames },
  });
  if (error || !data.user) {
    if (isEmailTaken(error)) {
      return actionError(EMAIL_TAKEN, { email: [EMAIL_TAKEN] });
    }
    return actionError("Impossible de créer le compte. Réessayez.");
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    email,
    full_name: toFullName(lastName, firstNames),
    role: "BDE",
  });
  if (profileError) {
    // Pas de compte Auth sans profil : il pourrait se connecter sans apparaitre dans la liste.
    await admin.auth.admin.deleteUser(data.user.id);
    return actionError("Impossible de créer le compte. Réessayez.");
  }

  revalidatePath("/admin");
  return actionOk({ id: data.user.id });
}

/** Modifie un compte BDE : nom, prenoms, email, et mot de passe s'il est renseigne. */
export async function updateBdeMember(
  memberId: string,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  if (!z.uuid().safeParse(memberId).success) {
    return actionError("Membre introuvable.");
  }
  const parsed = memberUpdateSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return actionError(
      "Informations invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const caller = await adminClientForCaller();
  if (!caller.admin) return actionError(caller.error);
  const { admin } = caller;
  const { lastName, firstNames, email, password } = parsed.data;

  // Seul un compte BDE est modifiable ici, jamais un compte ADMIN.
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", memberId)
    .eq("role", "BDE")
    .maybeSingle();
  if (!profile) return actionError("Membre introuvable.");

  const { error } = await admin.auth.admin.updateUserById(memberId, {
    email,
    email_confirm: true,
    user_metadata: { last_name: lastName, first_names: firstNames },
    ...(password ? { password } : {}),
  });
  if (error) {
    if (isEmailTaken(error)) {
      return actionError(EMAIL_TAKEN, { email: [EMAIL_TAKEN] });
    }
    return actionError("Impossible de modifier le compte. Réessayez.");
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ email, full_name: toFullName(lastName, firstNames) })
    .eq("id", memberId);
  if (profileError) {
    return actionError("Impossible de modifier le compte. Réessayez.");
  }

  revalidatePath("/admin");
  return actionOk({ id: memberId });
}

// Duree recommandee par la doc Supabase pour un bannissement sans fin ; "none" le leve.
const BAN_FOREVER = "876000h";

/**
 * Desactive ou reactive un compte BDE. On ne supprime jamais un membre (ses epreuves le
 * referencent) : le compte Auth est banni pour bloquer la connexion, et `profiles.is_active`
 * retire immediatement tout droit d'ecriture via `has_role`, meme si une session est encore ouverte.
 */
export async function setBdeMemberActive(
  memberId: string,
  active: boolean,
): Promise<ActionResult<{ id: string }>> {
  if (!z.uuid().safeParse(memberId).success) {
    return actionError("Membre introuvable.");
  }
  if (!z.boolean().safeParse(active).success) {
    return actionError("Statut invalide.");
  }

  const caller = await adminClientForCaller();
  if (!caller.admin) return actionError(caller.error);
  const { admin } = caller;

  const { data: profile } = await admin
    .from("profiles")
    .select("id, is_active")
    .eq("id", memberId)
    .eq("role", "BDE")
    .maybeSingle();
  if (!profile) return actionError("Membre introuvable.");

  const failure = active
    ? "Impossible de réactiver le compte. Réessayez."
    : "Impossible de désactiver le compte. Réessayez.";

  const { error } = await admin.auth.admin.updateUserById(memberId, {
    ban_duration: active ? "none" : BAN_FOREVER,
  });
  if (error) return actionError(failure);

  const { error: profileError } = await admin
    .from("profiles")
    .update({ is_active: active })
    .eq("id", memberId);
  if (profileError) {
    // Auth et profil doivent dire la meme chose : on remet le bannissement tel que le profil
    // l'indiquait avant l'appel.
    const { error: rollbackError } = await admin.auth.admin.updateUserById(
      memberId,
      { ban_duration: profile.is_active ? "none" : BAN_FOREVER },
    );
    if (rollbackError) {
      console.error(
        `setBdeMemberActive : bannissement Auth et profil divergent pour ${memberId}`,
        rollbackError,
      );
    }
    return actionError(failure);
  }

  revalidatePath("/admin");
  return actionOk({ id: memberId });
}
