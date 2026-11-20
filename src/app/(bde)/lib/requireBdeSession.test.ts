import { beforeEach, describe, expect, it, vi } from "vitest";

const getClaims = vi.fn();
const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirect(url),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getClaims } }),
}));
// `cache` de React memoise par requete serveur : hors requete, on le neutralise.
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  cache: <T>(fn: T) => fn,
}));

const { requireBdeSession } = await import("./requireBdeSession");

beforeEach(() => {
  getClaims.mockReset();
  redirect.mockClear();
});

describe("requireBdeSession", () => {
  it("laisse passer quand une session existe", async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "user-bde" } } });

    await expect(requireBdeSession()).resolves.toBeUndefined();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirige vers /login sans session", async () => {
    getClaims.mockResolvedValue({ data: null });

    await expect(requireBdeSession()).rejects.toThrow("REDIRECT:/login");
  });
});
