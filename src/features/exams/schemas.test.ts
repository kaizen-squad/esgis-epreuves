import { describe, expect, it } from "vitest";
import {
  examFiltersSchema,
  examUploadSchema,
  fixedFieldFilters,
  searchTokens,
  slugify,
} from "./schemas";

describe("searchTokens", () => {
  it("decoupe en mots, espaces superflus ignores", () => {
    expect(searchTokens("  algo   base  ")).toEqual(["algo", "base"]);
  });

  it("aplatit la casse et les accents pour s'aligner sur unaccent + lower en base", () => {
    expect(searchTokens("Économie")).toEqual(["economie"]);
    expect(searchTokens("RÉSEAUX")).toEqual(["reseaux"]);
  });

  it("replie les ligatures et le beta eszett, absents de unaccent", () => {
    expect(searchTokens("cœur")).toEqual(["coeur"]);
    expect(searchTokens("Straße")).toEqual(["strasse"]);
  });

  it("traite l'apostrophe typographique comme une separation de mots", () => {
    expect(searchTokens("Système d’information")).toEqual([
      "systeme",
      "d",
      "information",
    ]);
  });

  it("retourne un tableau vide pour une entree vide, absente ou faite de jokers ilike", () => {
    expect(searchTokens("")).toEqual([]);
    expect(searchTokens("   ")).toEqual([]);
    expect(searchTokens(undefined)).toEqual([]);
    expect(searchTokens("%%__")).toEqual([]);
  });
});

describe("examFiltersSchema", () => {
  it("applique les valeurs par defaut de pagination quand rien n'est fourni", () => {
    const result = examFiltersSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.search).toEqual([]);
  });

  it("decoupe le terme de recherche en mots normalises a travers le schema", () => {
    const result = examFiltersSchema.parse({ search: "  Système  Réseau  " });
    expect(result.search).toEqual(["systeme", "reseau"]);
  });

  it("ignore un fieldId vide ou invalide plutot que de lever une exception", () => {
    expect(examFiltersSchema.parse({ fieldId: "" }).fieldId).toBeUndefined();
    expect(
      examFiltersSchema.parse({ fieldId: "not-a-uuid" }).fieldId,
    ).toBeUndefined();
  });

  it("ignore une session hors de l'enum attendu plutot que de lever une exception", () => {
    expect(
      examFiltersSchema.parse({ session: "Session Speciale" }).session,
    ).toBeUndefined();
  });

  it("ignore une annee academique qui ne suit pas le format AAAA-AAAA", () => {
    expect(
      examFiltersSchema.parse({ academicYear: "2024" }).academicYear,
    ).toBeUndefined();
  });

  it("accepte pageSize a la limite haute et retombe au defaut au-dela", () => {
    expect(examFiltersSchema.parse({ pageSize: 50 }).pageSize).toBe(50);
    expect(examFiltersSchema.parse({ pageSize: 51 }).pageSize).toBe(20);
  });

  it("retombe sur la page 1 quand page est hors bornes (0, negatif, absent)", () => {
    expect(examFiltersSchema.parse({ page: 0 }).page).toBe(1);
    expect(examFiltersSchema.parse({ page: -3 }).page).toBe(1);
  });

  it("convertit page et pageSize fournis en chaine, cas reel d'un searchParams d'URL", () => {
    const result = examFiltersSchema.parse({ page: "2", pageSize: "10" });
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(10);
  });
});

describe("fixedFieldFilters", () => {
  it("impose le fieldId de la page meme si les filtres en portent un autre", () => {
    const result = fixedFieldFilters("field-a", { fieldId: "field-b" });
    expect(result.fieldId).toBe("field-a");
  });

  it("conserve les autres filtres inchanges", () => {
    const result = fixedFieldFilters("field-a", { search: "algo", page: 2 });
    expect(result.search).toBe("algo");
    expect(result.page).toBe(2);
  });
});

describe("slugify", () => {
  it("aplatit la casse et les accents, espaces en tirets", () => {
    const slug = slugify("Système d'information - Session 1");
    expect(slug).toMatch(/^systeme-d-information-session-1-[0-9a-f]{8}$/);
  });

  it("produit un slug distinct pour chaque appel, meme titre", () => {
    const first = slugify("Algorithmique");
    const second = slugify("Algorithmique");
    expect(first).not.toBe(second);
  });
});

describe("examUploadSchema", () => {
  const UUID = "11111111-1111-4111-a111-111111111111";

  function validInput(overrides: Record<string, unknown> = {}) {
    return {
      title: "Algorithmique S1",
      academicYear: "2024-2025",
      session: "Session Normale",
      examType: "Contrôle Terminal",
      fieldId: UUID,
      levelId: UUID,
      subjectId: UUID,
      file: new File(["%PDF-1.4"], "exam.pdf", { type: "application/pdf" }),
      ...overrides,
    };
  }

  it("accepte un depot valide", () => {
    const result = examUploadSchema.safeParse(validInput());
    expect(result.success).toBe(true);
  });

  it("accepte l'absence d'option (filiere sans specialisation)", () => {
    const result = examUploadSchema.safeParse(
      validInput({ optionId: undefined }),
    );
    expect(result.success).toBe(true);
  });

  it("rejette un fichier dont le type MIME n'est pas application/pdf", () => {
    const result = examUploadSchema.safeParse(
      validInput({
        file: new File(["image"], "exam.png", { type: "image/png" }),
      }),
    );
    expect(result.success).toBe(false);
  });

  it("rejette un fichier vide", () => {
    const result = examUploadSchema.safeParse(
      validInput({
        file: new File([], "exam.pdf", { type: "application/pdf" }),
      }),
    );
    expect(result.success).toBe(false);
  });

  it("rejette un fichier au-dela de la limite de taille", () => {
    const tooBig = new Uint8Array(901 * 1024);
    const result = examUploadSchema.safeParse(
      validInput({
        file: new File([tooBig], "exam.pdf", { type: "application/pdf" }),
      }),
    );
    expect(result.success).toBe(false);
  });

  it("rejette une annee academique mal formee", () => {
    const result = examUploadSchema.safeParse(
      validInput({ academicYear: "2024" }),
    );
    expect(result.success).toBe(false);
  });
});
