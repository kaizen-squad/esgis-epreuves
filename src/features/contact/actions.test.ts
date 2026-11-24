import { beforeEach, describe, expect, it, vi } from "vitest";

const select = vi.fn();
const eq = vi.fn(() => ({ select }));
const update = vi.fn<(row: Record<string, unknown>) => { eq: typeof eq }>(
  () => ({ eq }),
);
const from = vi.fn(() => ({ update }));
const updateTag = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from }),
}));
vi.mock("next/cache", () => ({
  updateTag,
  unstable_cache: (fn: unknown) => fn,
}));

const { updateBdeWhatsappNumber } = await import("./actions");
const { SITE_SETTINGS_TAG } = await import("./queries");

function form(value: string) {
  const formData = new FormData();
  formData.set("whatsappNumber", value);
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateBdeWhatsappNumber", () => {
  it("rejette un numero invalide sans toucher la base", async () => {
    const result = await updateBdeWhatsappNumber(form("0123"));

    expect(result.ok).toBe(false);
    expect(from).not.toHaveBeenCalled();
  });

  it("enregistre le numero normalise et invalide le cache du contact", async () => {
    select.mockResolvedValue({ data: [{ id: true }], error: null });

    const result = await updateBdeWhatsappNumber(form("+229 01 23 45 67 89"));

    expect(from).toHaveBeenCalledWith("site_settings");
    expect(update).toHaveBeenCalledWith({
      bde_whatsapp_number: "+2290123456789",
    });
    expect(result).toEqual({ ok: true, data: { number: "+2290123456789" } });
    expect(updateTag).toHaveBeenCalledWith(SITE_SETTINGS_TAG);
  });

  it("un champ vide retire le numero", async () => {
    select.mockResolvedValue({ data: [{ id: true }], error: null });

    await updateBdeWhatsappNumber(form(""));

    expect(update).toHaveBeenCalledWith({ bde_whatsapp_number: null });
  });

  it("signale un refus de la RLS (0 ligne modifiee) sans invalider le cache", async () => {
    select.mockResolvedValue({ data: [], error: null });

    const result = await updateBdeWhatsappNumber(form("+2290123456789"));

    expect(result.ok).toBe(false);
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("renvoie un message generique sur une erreur Supabase", async () => {
    select.mockResolvedValue({
      data: null,
      error: { code: "XX000", message: "panne" },
    });

    const result = await updateBdeWhatsappNumber(form("+2290123456789"));

    expect(result).toEqual({ ok: false, error: "Impossible d'enregistrer." });
  });
});
