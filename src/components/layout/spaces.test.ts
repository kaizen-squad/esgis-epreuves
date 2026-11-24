import { describe, expect, it } from "vitest";
import { isNavLinkActive } from "./spaces";

describe("isNavLinkActive", () => {
  it("l'accueil n'est actif que sur la racine, jamais par prefixe", () => {
    expect(isNavLinkActive("/", "/")).toBe(true);
    expect(isNavLinkActive("/catalogue", "/")).toBe(false);
  });

  it("l'accueil reste actif quand usePathname resout la racine en chaine vide (rendu statique au build)", () => {
    expect(isNavLinkActive("", "/")).toBe(true);
  });

  it("une rubrique reste active sur ses sous-pages", () => {
    expect(isNavLinkActive("/filieres", "/filieres")).toBe(true);
    expect(isNavLinkActive("/filieres/irt", "/filieres")).toBe(true);
    expect(isNavLinkActive("/bde/catalogue", "/bde/catalogue")).toBe(true);
  });

  it("ne capte pas une autre route qui partage le meme prefixe de chaine", () => {
    expect(isNavLinkActive("/filiere", "/filieres")).toBe(false);
    expect(isNavLinkActive("/filieresque", "/filieres")).toBe(false);
  });

  it("ne confond pas deux espaces qui partagent un prefixe", () => {
    expect(isNavLinkActive("/bde/catalogue", "/catalogue")).toBe(false);
    expect(isNavLinkActive("/catalogue", "/bde/catalogue")).toBe(false);
  });
});
