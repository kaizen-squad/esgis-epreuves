import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentProfileStatus = vi.fn();
const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirect(url),
}));
vi.mock("@/features/members/queries", () => ({
  getCurrentProfileStatus: () => getCurrentProfileStatus(),
}));
// `cache` de React memoise par requete serveur : hors requete, on le neutralise.
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  cache: <T>(fn: T) => fn,
}));

const { requireBdeSession } = await import("./requireBdeSession");

beforeEach(() => {
  getCurrentProfileStatus.mockReset();
  redirect.mockClear();
});

describe("requireBdeSession", () => {
  it("laisse passer un compte BDE actif", async () => {
    getCurrentProfileStatus.mockResolvedValue({ role: "BDE", isActive: true });

    await expect(requireBdeSession()).resolves.toBeUndefined();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirige vers /login sans session", async () => {
    getCurrentProfileStatus.mockResolvedValue(null);

    await expect(requireBdeSession()).rejects.toThrow("REDIRECT:/login");
  });

  it("redirige un compte ADMIN vers /admin (#164)", async () => {
    getCurrentProfileStatus.mockResolvedValue({
      role: "ADMIN",
      isActive: true,
    });

    await expect(requireBdeSession()).rejects.toThrow("REDIRECT:/admin");
  });

  it("redirige un compte BDE desactive vers /login (#164)", async () => {
    getCurrentProfileStatus.mockResolvedValue({
      role: "BDE",
      isActive: false,
    });

    await expect(requireBdeSession()).rejects.toThrow("REDIRECT:/login");
  });
});
