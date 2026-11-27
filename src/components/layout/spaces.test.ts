import { describe, expect, it } from "vitest";
import { examFileHref, isNavLinkActive } from "./spaces";

describe("isNavLinkActive", () => {
  it("l'accueil n'est actif que sur la racine, jamais par prefixe", () => {
    expect(isNavLinkActive("/", "/")).toBe(true);
    expect(isNavLinkActive("/catalogue", "/")).toBe(false);
  });

  it("l'accueil reste actif quand usePathname resout la racine en chaine vide (rendu statique au build)", () => {
    expect(isNavLinkActive("", "/")).toBe(true);
  });

  it("l'accueil reste actif sur /index (regeneration ISR en prod Vercel, x-matched-path)", () => {
    expect(isNavLinkActive("/index", "/")).toBe(true);
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

describe("examFileHref", () => {
  it("espace public : aucun parametre d'espace", () => {
    expect(examFileHref("", "l1-irt-42")).toBe("/api/exams/l1-irt-42");
  });

  it("espace BDE : porte l'espace pour que la redirection de repli y reste (#145)", () => {
    expect(examFileHref("/bde", "l1-irt-42")).toBe(
      "/api/exams/l1-irt-42?space=bde",
    );
  });

  it("telechargement : ajoute dl=1, combine avec l'espace si BDE", () => {
    expect(examFileHref("", "l1-irt-42", true)).toBe(
      "/api/exams/l1-irt-42?dl=1",
    );
    expect(examFileHref("/bde", "l1-irt-42", true)).toBe(
      "/api/exams/l1-irt-42?space=bde&dl=1",
    );
  });
});
