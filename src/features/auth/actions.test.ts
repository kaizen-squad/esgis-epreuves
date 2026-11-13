import { beforeEach, describe, expect, it, vi } from "vitest";

const signInWithPassword = vi.fn();
const signOut = vi.fn();
const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirect(url),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { signInWithPassword, signOut } }),
}));

const { login, logout } = await import("./actions");

function loginForm(email: string, password: string) {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("password", password);
  return formData;
}

beforeEach(() => {
  signInWithPassword.mockReset();
  signOut.mockReset();
  redirect.mockClear();
});

describe("login", () => {
  it("rejette un email mal forme sans appeler Supabase", async () => {
    const result = await login(null, loginForm("pas-un-email", "x"));

    expect(result.ok).toBe(false);
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("message generique sur identifiants incorrects, sans reveler si le compte existe", async () => {
    signInWithPassword.mockResolvedValue({ error: { status: 400 } });

    const result = await login(
      null,
      loginForm("bde.dev@esgis.local", "mauvais"),
    );

    expect(result).toEqual({
      ok: false,
      error: "Email ou mot de passe incorrect.",
    });
  });

  it("message distinct sur limitation de debit (429), sans reveler l'existence du compte", async () => {
    signInWithPassword.mockResolvedValue({ error: { status: 429 } });

    const result = await login(null, loginForm("bde.dev@esgis.local", "x"));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Trop de tentatives");
  });

  it("redirige vers /admin en cas de succes", async () => {
    signInWithPassword.mockResolvedValue({ error: null });

    await expect(
      login(null, loginForm("bde.dev@esgis.local", "x")),
    ).rejects.toThrow("REDIRECT:/admin");
  });
});

describe("logout", () => {
  it("deconnecte uniquement la session locale (compte partage par l'equipe BDE) et redirige", async () => {
    signOut.mockResolvedValue({ error: null });

    await expect(logout()).rejects.toThrow("REDIRECT:/login");
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
  });
});
