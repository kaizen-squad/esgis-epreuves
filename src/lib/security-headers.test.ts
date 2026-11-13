import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy } from "./security-headers";

describe("buildContentSecurityPolicy", () => {
  it("autorise le compte R2 fourni (frame-src, pour la redirection 307 vers une URL presignee), sans joker generique", () => {
    const csp = buildContentSecurityPolicy({
      r2AccountId: "7d2a1f161c4f7c19940ccf3e85965188",
      isDev: false,
    });

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain(
      "frame-src 'self' https://7d2a1f161c4f7c19940ccf3e85965188.r2.cloudflarestorage.com https://*.7d2a1f161c4f7c19940ccf3e85965188.r2.cloudflarestorage.com",
    );
    expect(csp).not.toMatch(/\s\*[\s;]/);
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'self'");
  });

  it("n'autorise aucune origine Supabase ou R2 en connect-src/img-src : rien n'y accede depuis le navigateur pour l'instant", () => {
    const csp = buildContentSecurityPolicy({
      r2AccountId: "7d2a1f161c4f7c19940ccf3e85965188",
      isDev: false,
    });

    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("img-src 'self' data: blob:");
  });

  it("ajoute 'unsafe-eval' au script-src seulement en developpement (next dev utilise eval pour les piles d'erreur)", () => {
    const dev = buildContentSecurityPolicy({ r2AccountId: "abc", isDev: true });
    const prod = buildContentSecurityPolicy({
      r2AccountId: "abc",
      isDev: false,
    });

    expect(dev).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
    expect(prod).toContain("script-src 'self' 'unsafe-inline';");
    expect(prod).not.toContain("unsafe-eval");
  });

  it("tolere R2_ACCOUNT_ID vide sans planter (next typegen/tsc n'injectent pas toujours les variables)", () => {
    const csp = buildContentSecurityPolicy({ r2AccountId: "", isDev: false });

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-src 'self';");
    expect(csp).not.toContain("undefined");
  });
});
