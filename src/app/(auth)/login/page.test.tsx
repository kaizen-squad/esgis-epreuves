import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentProfileStatus = vi.fn();
const signOut = vi.fn();
const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirect(url),
}));
vi.mock("@/features/members/queries", () => ({
  getCurrentProfileStatus: () => getCurrentProfileStatus(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { signOut } }),
}));
vi.mock("@/features/auth/ui/LoginForm", () => ({
  default: () => null,
}));
vi.mock("next/image", () => ({ default: () => null }));

const { default: LoginPage } = await import("./page");

beforeEach(() => {
  getCurrentProfileStatus.mockReset();
  signOut.mockReset();
  redirect.mockClear();
});

describe("LoginPage", () => {
  it("redirige un compte ADMIN actif vers /admin", async () => {
    getCurrentProfileStatus.mockResolvedValue({
      role: "ADMIN",
      isActive: true,
    });

    await expect(LoginPage()).rejects.toThrow("REDIRECT:/admin");
    expect(signOut).not.toHaveBeenCalled();
  });

  it("redirige un compte BDE actif vers /bde/accueil", async () => {
    getCurrentProfileStatus.mockResolvedValue({ role: "BDE", isActive: true });

    await expect(LoginPage()).rejects.toThrow("REDIRECT:/bde/accueil");
    expect(signOut).not.toHaveBeenCalled();
  });

  it("deconnecte un compte BDE desactive au lieu de le renvoyer vers l'espace (#164)", async () => {
    getCurrentProfileStatus.mockResolvedValue({
      role: "BDE",
      isActive: false,
    });

    // Rendu normal du formulaire, sans redirection : sinon /bde/accueil renverrait aussitot
    // vers /login (jeton encore valide), boucle infinie entre les deux pages.
    await expect(LoginPage()).resolves.toBeDefined();
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("affiche le formulaire sans session", async () => {
    getCurrentProfileStatus.mockResolvedValue(null);

    await expect(LoginPage()).resolves.toBeDefined();
    expect(signOut).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
