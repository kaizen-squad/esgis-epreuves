import { beforeEach, describe, expect, it, vi } from "vitest";

const insertSingle = vi.fn();
const insertSelect = vi.fn(() => ({ single: insertSingle }));
const insert = vi.fn<
  (row: Record<string, unknown>) => { select: typeof insertSelect }
>(() => ({ select: insertSelect }));

const updateSelect = vi.fn();
const updateEq = vi.fn(() => ({ select: updateSelect }));
const update = vi.fn<(row: Record<string, unknown>) => { eq: typeof updateEq }>(
  () => ({ eq: updateEq }),
);

const from = vi.fn(() => ({ insert, update }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from }),
}));

const {
  createField,
  updateField,
  setFieldActive,
  createLevel,
  createSubject,
  updateSubject,
  createOption,
  updateOption,
} = await import("./actions");

const FIELD_UUID = "11111111-1111-4111-a111-111111111111";
const UNKNOWN_UUID = "99999999-9999-4999-a999-999999999999";

function form(values: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) formData.set(key, value);
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createField", () => {
  it("rejette un nom vide sans toucher la base", async () => {
    const result = await createField(form({ name: "" }));

    expect(result.ok).toBe(false);
    expect(from).not.toHaveBeenCalled();
  });

  it("insere la filiere et renvoie son id", async () => {
    insertSingle.mockResolvedValue({ data: { id: FIELD_UUID }, error: null });

    const result = await createField(form({ name: "Informatique" }));

    expect(from).toHaveBeenCalledWith("fields");
    expect(insert).toHaveBeenCalledWith({ name: "Informatique" });
    expect(result).toEqual({ ok: true, data: { id: FIELD_UUID } });
  });

  it("renvoie un message de doublon sur une violation d'unicite (23505)", async () => {
    insertSingle.mockResolvedValue({
      data: null,
      error: { code: "23505", message: "duplicate key" },
    });

    const result = await createField(form({ name: "Informatique" }));

    expect(result).toEqual({
      ok: false,
      error: "Cette filiere existe deja.",
    });
  });

  it("renvoie un message generique sur une erreur Supabase inattendue", async () => {
    insertSingle.mockResolvedValue({
      data: null,
      error: { code: "42501", message: "refuse" },
    });

    const result = await createField(form({ name: "Informatique" }));

    expect(result).toEqual({ ok: false, error: "Impossible d'enregistrer." });
  });
});

describe("updateField", () => {
  it("modifie la filiere existante", async () => {
    updateSelect.mockResolvedValue({ data: [{ id: FIELD_UUID }], error: null });

    const result = await updateField(FIELD_UUID, form({ name: "Gestion" }));

    expect(update).toHaveBeenCalledWith({ name: "Gestion" });
    expect(updateEq).toHaveBeenCalledWith("id", FIELD_UUID);
    expect(result).toEqual({ ok: true, data: null });
  });

  it("renvoie Introuvable sur un id qui n'est pas un uuid, sans toucher la base", async () => {
    const result = await updateField("pas-un-uuid", form({ name: "Gestion" }));

    expect(result).toEqual({ ok: false, error: "Introuvable." });
    expect(from).not.toHaveBeenCalled();
  });

  it("renvoie Introuvable quand la RLS ne filtre aucune ligne (0 ligne affectee)", async () => {
    updateSelect.mockResolvedValue({ data: [], error: null });

    const result = await updateField(UNKNOWN_UUID, form({ name: "Gestion" }));

    expect(result).toEqual({ ok: false, error: "Introuvable." });
    expect(update).toHaveBeenCalled();
  });

  it("renvoie un message de doublon sur une violation d'unicite (23505)", async () => {
    updateSelect.mockResolvedValue({
      data: null,
      error: { code: "23505", message: "duplicate key" },
    });

    const result = await updateField(FIELD_UUID, form({ name: "Gestion" }));

    expect(result).toEqual({ ok: false, error: "Cette filiere existe deja." });
  });
});

describe("updateSubject", () => {
  it("ne modifie que le nom, jamais le rattachement field_id/level_id", async () => {
    updateSelect.mockResolvedValue({ data: [{ id: FIELD_UUID }], error: null });

    await updateSubject(FIELD_UUID, form({ name: "Algorithmique avancee" }));

    expect(update).toHaveBeenCalledWith({ name: "Algorithmique avancee" });
  });
});

describe("updateOption", () => {
  it("ne modifie que le nom, jamais field_id", async () => {
    updateSelect.mockResolvedValue({ data: [{ id: FIELD_UUID }], error: null });

    await updateOption(FIELD_UUID, form({ name: "CCA renommee" }));

    expect(update).toHaveBeenCalledWith({ name: "CCA renommee" });
  });
});

describe("setFieldActive", () => {
  it("desactive la filiere", async () => {
    updateSelect.mockResolvedValue({ data: [{ id: FIELD_UUID }], error: null });

    const result = await setFieldActive(FIELD_UUID, false);

    expect(update).toHaveBeenCalledWith({ is_active: false });
    expect(result).toEqual({ ok: true, data: null });
  });

  it("rejette un id qui n'est pas un uuid, sans toucher la base", async () => {
    const result = await setFieldActive("pas-un-uuid", false);

    expect(result).toEqual({ ok: false, error: "Introuvable." });
    expect(from).not.toHaveBeenCalled();
  });

  it("rejette un isActive qui n'est pas un booleen, sans toucher la base", async () => {
    // @ts-expect-error valeur forgee volontairement pour simuler un appel non type-safe
    const result = await setFieldActive(FIELD_UUID, "yes");

    expect(result).toEqual({ ok: false, error: "Donnees invalides." });
    expect(from).not.toHaveBeenCalled();
  });

  it("renvoie Introuvable quand 0 ligne est affectee", async () => {
    updateSelect.mockResolvedValue({ data: [], error: null });

    const result = await setFieldActive(UNKNOWN_UUID, false);

    expect(result).toEqual({ ok: false, error: "Introuvable." });
    expect(update).toHaveBeenCalled();
  });

  it("renvoie un message generique sur une erreur Supabase inattendue", async () => {
    updateSelect.mockResolvedValue({
      data: null,
      error: { code: "42501", message: "refuse" },
    });

    const result = await setFieldActive(FIELD_UUID, false);

    expect(result).toEqual({
      ok: false,
      error: "Impossible de changer l'etat.",
    });
  });
});

describe("createLevel", () => {
  it("insere le niveau dans sa propre table", async () => {
    insertSingle.mockResolvedValue({ data: { id: FIELD_UUID }, error: null });

    await createLevel(form({ name: "L1" }));

    expect(from).toHaveBeenCalledWith("levels");
    expect(insert).toHaveBeenCalledWith({ name: "L1" });
  });
});

describe("createSubject", () => {
  it("insere la matiere avec les colonnes field_id/level_id", async () => {
    insertSingle.mockResolvedValue({ data: { id: FIELD_UUID }, error: null });

    await createSubject(
      form({ fieldId: FIELD_UUID, levelId: FIELD_UUID, name: "Algorithmique" }),
    );

    expect(from).toHaveBeenCalledWith("subjects");
    expect(insert).toHaveBeenCalledWith({
      field_id: FIELD_UUID,
      level_id: FIELD_UUID,
      name: "Algorithmique",
    });
  });

  it("rejette un fieldId invalide sans toucher la base", async () => {
    const result = await createSubject(
      form({ fieldId: "pas-un-uuid", levelId: FIELD_UUID, name: "Algo" }),
    );

    expect(result.ok).toBe(false);
    expect(from).not.toHaveBeenCalled();
  });
});

describe("createOption", () => {
  it("insere l'option avec la colonne field_id", async () => {
    insertSingle.mockResolvedValue({ data: { id: FIELD_UUID }, error: null });

    await createOption(form({ fieldId: FIELD_UUID, name: "CCA" }));

    expect(from).toHaveBeenCalledWith("options");
    expect(insert).toHaveBeenCalledWith({ field_id: FIELD_UUID, name: "CCA" });
  });
});
