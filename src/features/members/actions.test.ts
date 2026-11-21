import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUserRole = vi.fn();
const createUser = vi.fn();
const deleteUser = vi.fn();
const updateUserById = vi.fn();
const insert = vi.fn();
const profileLookup = vi.fn();
const update = vi.fn();
const updateEq = vi.fn();

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("./queries", () => ({
  getCurrentUserRole: () => getCurrentUserRole(),
}));
let adminConfigured = true;
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () =>
    adminConfigured
      ? {
          auth: { admin: { createUser, deleteUser, updateUserById } },
          from: () => ({
            insert,
            select: () => ({
              eq: () => ({ eq: () => ({ maybeSingle: profileLookup }) }),
            }),
            update: (values: unknown) => ({
              eq: (...args: unknown[]) => {
                updateEq(...args);
                return update(values);
              },
            }),
          }),
        }
      : null,
}));

const { createBdeMember, setBdeMemberActive, updateBdeMember } =
  await import("./actions");

const MEMBER_ID = "3f0c8a51-8f0e-4c1b-9a51-0d9d7c6f2b11";

function memberForm(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const values = {
    lastName: "KOFFI",
    firstNames: "Ama",
    email: "ama@esgis.local",
    password: "motdepasse",
    ...overrides,
  };
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
  adminConfigured = true;
  getCurrentUserRole.mockResolvedValue("ADMIN");
  createUser.mockResolvedValue({
    data: { user: { id: MEMBER_ID } },
    error: null,
  });
  insert.mockResolvedValue({ error: null });
  profileLookup.mockResolvedValue({
    data: { id: MEMBER_ID, is_active: true },
  });
  updateUserById.mockResolvedValue({ error: null });
  update.mockResolvedValue({ error: null });
});

describe("createBdeMember", () => {
  it("refuse un appelant qui n'est pas ADMIN, sans toucher a l'API Auth", async () => {
    getCurrentUserRole.mockResolvedValue("BDE");

    const result = await createBdeMember(memberForm());

    expect(result).toEqual({
      ok: false,
      error: "Action réservée à l'administrateur.",
    });
    expect(createUser).not.toHaveBeenCalled();
  });

  it("renvoie les erreurs par champ sans appeler Supabase", async () => {
    const result = await createBdeMember(memberForm({ password: "court" }));

    expect(result.ok).toBe(false);
    if (!result.ok && "fieldErrors" in result) {
      expect(result.fieldErrors?.password).toBeDefined();
    }
    expect(createUser).not.toHaveBeenCalled();
  });

  it("signale une cle secrete manquante", async () => {
    adminConfigured = false;

    const result = await createBdeMember(memberForm());

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("SUPABASE_SECRET_KEY");
  });

  it("cree le compte Auth confirme puis le profil BDE", async () => {
    const result = await createBdeMember(memberForm());

    expect(result).toEqual({ ok: true, data: { id: MEMBER_ID } });
    expect(createUser).toHaveBeenCalledWith({
      email: "ama@esgis.local",
      password: "motdepasse",
      email_confirm: true,
      user_metadata: { last_name: "KOFFI", first_names: "Ama" },
    });
    expect(insert).toHaveBeenCalledWith({
      id: MEMBER_ID,
      email: "ama@esgis.local",
      full_name: "KOFFI Ama",
      role: "BDE",
    });
  });

  it("rattache un email deja utilise au champ email", async () => {
    createUser.mockResolvedValue({
      data: { user: null },
      error: { code: "email_exists", status: 422 },
    });

    const result = await createBdeMember(memberForm());

    expect(result.ok).toBe(false);
    if (!result.ok && "fieldErrors" in result) {
      expect(result.fieldErrors?.email).toEqual([
        "Un compte utilise déjà cet email.",
      ]);
    }
  });

  it("supprime le compte Auth si le profil ne peut pas etre cree", async () => {
    insert.mockResolvedValue({ error: { code: "23505" } });

    const result = await createBdeMember(memberForm());

    expect(result.ok).toBe(false);
    expect(deleteUser).toHaveBeenCalledWith(MEMBER_ID);
  });
});

describe("updateBdeMember", () => {
  it("ne change pas le mot de passe quand il est laisse vide", async () => {
    const result = await updateBdeMember(
      MEMBER_ID,
      memberForm({ password: "" }),
    );

    expect(result).toEqual({ ok: true, data: { id: MEMBER_ID } });
    expect(updateUserById).toHaveBeenCalledWith(MEMBER_ID, {
      email: "ama@esgis.local",
      email_confirm: true,
      user_metadata: { last_name: "KOFFI", first_names: "Ama" },
    });
    expect(update).toHaveBeenCalledWith({
      email: "ama@esgis.local",
      full_name: "KOFFI Ama",
    });
  });

  it("refuse un compte qui n'est pas BDE (ou introuvable)", async () => {
    profileLookup.mockResolvedValue({ data: null });

    const result = await updateBdeMember(MEMBER_ID, memberForm());

    expect(result).toEqual({ ok: false, error: "Membre introuvable." });
    expect(updateUserById).not.toHaveBeenCalled();
  });

  it("refuse un id qui n'est pas un uuid", async () => {
    const result = await updateBdeMember("pas-un-uuid", memberForm());
    expect(result).toEqual({ ok: false, error: "Membre introuvable." });
  });
});

describe("setBdeMemberActive", () => {
  it("refuse un appelant qui n'est pas ADMIN, sans toucher a l'API Auth", async () => {
    getCurrentUserRole.mockResolvedValue("BDE");

    const result = await setBdeMemberActive(MEMBER_ID, false);

    expect(result).toEqual({
      ok: false,
      error: "Action réservée à l'administrateur.",
    });
    expect(updateUserById).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("refuse un id qui n'est pas un uuid", async () => {
    const result = await setBdeMemberActive("pas-un-uuid", false);
    expect(result).toEqual({ ok: false, error: "Membre introuvable." });
  });

  it("refuse un compte qui n'est pas BDE (ou introuvable)", async () => {
    profileLookup.mockResolvedValue({ data: null });

    const result = await setBdeMemberActive(MEMBER_ID, false);

    expect(result).toEqual({ ok: false, error: "Membre introuvable." });
    expect(updateUserById).not.toHaveBeenCalled();
  });

  it("desactive : bannit le compte Auth puis marque le profil inactif", async () => {
    const result = await setBdeMemberActive(MEMBER_ID, false);

    expect(result).toEqual({ ok: true, data: { id: MEMBER_ID } });
    expect(updateUserById).toHaveBeenCalledWith(MEMBER_ID, {
      ban_duration: "876000h",
    });
    expect(update).toHaveBeenCalledWith({ is_active: false });
    expect(updateEq).toHaveBeenCalledWith("id", MEMBER_ID);
  });

  it("refuse un statut qui n'est pas un booleen", async () => {
    const result = await setBdeMemberActive(
      MEMBER_ID,
      "false" as unknown as boolean,
    );

    expect(result.ok).toBe(false);
    expect(updateUserById).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("reactive : leve le bannissement puis marque le profil actif", async () => {
    const result = await setBdeMemberActive(MEMBER_ID, true);

    expect(result).toEqual({ ok: true, data: { id: MEMBER_ID } });
    expect(updateUserById).toHaveBeenCalledWith(MEMBER_ID, {
      ban_duration: "none",
    });
    expect(update).toHaveBeenCalledWith({ is_active: true });
  });

  it("n'ecrit pas le profil si l'API Auth echoue", async () => {
    updateUserById.mockResolvedValue({ error: { status: 500 } });

    const result = await setBdeMemberActive(MEMBER_ID, false);

    expect(result.ok).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it("annule le bannissement si le profil ne peut pas etre mis a jour", async () => {
    update.mockResolvedValue({ error: { message: "boom" } });

    const result = await setBdeMemberActive(MEMBER_ID, false);

    expect(result.ok).toBe(false);
    expect(updateUserById).toHaveBeenLastCalledWith(MEMBER_ID, {
      ban_duration: "none",
    });
  });

  it("annule la reactivation (re-bannit) si le profil ne peut pas etre mis a jour", async () => {
    profileLookup.mockResolvedValue({
      data: { id: MEMBER_ID, is_active: false },
    });
    update.mockResolvedValue({ error: { message: "boom" } });

    const result = await setBdeMemberActive(MEMBER_ID, true);

    expect(result.ok).toBe(false);
    expect(updateUserById).toHaveBeenLastCalledWith(MEMBER_ID, {
      ban_duration: "876000h",
    });
  });

  it("restaure l'etat reel, pas l'inverse de la demande, si le profil echoue", async () => {
    profileLookup.mockResolvedValue({
      data: { id: MEMBER_ID, is_active: false },
    });
    update.mockResolvedValue({ error: { message: "boom" } });

    await setBdeMemberActive(MEMBER_ID, false);

    expect(updateUserById).toHaveBeenLastCalledWith(MEMBER_ID, {
      ban_duration: "876000h",
    });
  });
});
