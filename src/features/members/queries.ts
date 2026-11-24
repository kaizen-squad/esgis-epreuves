import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MEMBERS_PAGE_SIZE, sanitizeMemberSearch } from "./schemas";
import type {
  BdeMember,
  BdeMemberDetail,
  BdeMemberPage,
  UserRole,
} from "./types";

const MEMBER_SELECT = "id, full_name, email, created_at, is_active";

type MemberRow = {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
  is_active: boolean;
};

function toMember(row: MemberRow): BdeMember {
  return {
    id: row.id,
    fullName: row.full_name ?? "",
    email: row.email,
    createdAt: row.created_at,
    isActive: row.is_active,
  };
}

/**
 * Role de l'utilisateur connecte, `null` sans session. `profiles` n'est lisible que par un ADMIN
 * (politique `profiles_write_admin`) : un compte BDE ne voit pas sa propre ligne, d'ou le repli
 * sur "BDE" pour toute session valide sans profil lisible.
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return data?.role === "ADMIN" ? "ADMIN" : "BDE";
}

/**
 * Role et statut actif du compte connecte, `null` sans session (#164). Passe par le RPC
 * `current_profile_status` (fonction `security definer` exposee en `public`, voir la migration
 * du meme nom) plutot que par une lecture directe de `profiles` : un compte BDE ne peut pas lire
 * sa propre ligne (RLS admin-only, voir `getCurrentUserRole`), ce dont la garde BDE a justement
 * besoin pour detecter un compte desactive sans attendre l'expiration de son jeton de session.
 */
export async function getCurrentProfileStatus(): Promise<{
  role: UserRole;
  isActive: boolean;
} | null> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) return null;

  const { data, error } = (await supabase
    .rpc("current_profile_status")
    .maybeSingle()) as {
    data: { role: string; is_active: boolean } | null;
    error: { message: string } | null;
  };
  if (error) throw error;
  if (!data) return null;

  return {
    role: data.role === "ADMIN" ? "ADMIN" : "BDE",
    isActive: data.is_active,
  };
}

/**
 * Membres BDE pour le tableau de bord Admin, actifs d'abord puis desactives, chacun du plus recent
 * au plus ancien, filtres par nom ou
 * email (`search`) et pagines (`MEMBERS_PAGE_SIZE`). Une page au-dela de la derniere est ramenee
 * a la derniere. Lecture protegee par la RLS (ADMIN uniquement).
 */
export async function getBdeMembers({
  search = "",
  page = 1,
}: { search?: string; page?: number } = {}): Promise<BdeMemberPage> {
  const supabase = await createClient();
  const term = sanitizeMemberSearch(search);

  const fetchPage = async (pageNumber: number) => {
    const from = (pageNumber - 1) * MEMBERS_PAGE_SIZE;
    let query = supabase
      .from("profiles")
      .select(MEMBER_SELECT, { count: "exact" })
      .eq("role", "BDE")
      .order("is_active", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, from + MEMBERS_PAGE_SIZE - 1);
    if (term) {
      query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
    }
    const { data, count, error } = await query;
    // PostgREST repond 416 (PGRST103) quand la plage depasse le nombre de lignes.
    if (error && error.code !== "PGRST103") throw error;
    return { rows: (data ?? []) as MemberRow[], total: count ?? 0 };
  };

  let current = Math.max(1, page);
  let { rows, total } = await fetchPage(current);
  const pageCount = Math.max(1, Math.ceil(total / MEMBERS_PAGE_SIZE));
  if (current > pageCount) {
    current = pageCount;
    ({ rows, total } = await fetchPage(current));
  }

  return { members: rows.map(toMember), total, page: current, pageCount };
}

/**
 * Nombre total de comptes BDE, desactives compris : decide de l'etat vide du tableau de bord.
 * Ne compter que les actifs cacherait la liste, et donc le bouton de reactivation, des que le
 * dernier compte actif est desactive.
 */
export async function countBdeMembers(): Promise<number> {
  return countBde(false);
}

/** Nombre de comptes BDE actifs (indicateur "Membres du BDE" du tableau de bord). */
export async function countActiveBdeMembers(): Promise<number> {
  return countBde(true);
}

async function countBde(activeOnly: boolean): Promise<number> {
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "BDE");
  if (activeOnly) query = query.eq("is_active", true);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

/**
 * Membre BDE a modifier, `null` si l'id n'est pas un uuid ou ne designe pas un compte BDE. Nom et
 * prenoms viennent des metadonnees Auth posees a la creation ; a defaut (compte cree a la main),
 * le premier mot de `full_name` est pris comme nom.
 */
export async function getBdeMember(
  id: string,
): Promise<BdeMemberDetail | null> {
  if (!z.uuid().safeParse(id).success) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(MEMBER_SELECT)
    .eq("id", id)
    .eq("role", "BDE")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const member = toMember(data);
  const admin = createAdminClient();
  const metadata = admin
    ? (await admin.auth.admin.getUserById(id)).data.user?.user_metadata
    : undefined;

  if (
    typeof metadata?.last_name === "string" &&
    typeof metadata?.first_names === "string"
  ) {
    return {
      ...member,
      lastName: metadata.last_name,
      firstNames: metadata.first_names,
    };
  }

  const [lastName = "", ...rest] = member.fullName.split(" ");
  return { ...member, lastName, firstNames: rest.join(" ") };
}
