import { describe, expect, it } from "vitest";
import {
  memberCreateSchema,
  memberUpdateSchema,
  parsePage,
  sanitizeMemberSearch,
  toFullName,
} from "./schemas";

const valid = {
  lastName: "  KOFFI ",
  firstNames: "Ama Grâce",
  email: " Ama.Koffi@ESGIS.local ",
  password: "motdepasse",
};

describe("memberCreateSchema", () => {
  it("accepte un membre complet, nettoie les espaces et met l'email en minuscules", () => {
    const parsed = memberCreateSchema.parse(valid);
    expect(parsed).toEqual({
      lastName: "KOFFI",
      firstNames: "Ama Grâce",
      email: "ama.koffi@esgis.local",
      password: "motdepasse",
    });
  });

  it("exige chaque champ, un email valide et 8 caracteres de mot de passe", () => {
    const result = memberCreateSchema.safeParse({
      lastName: " ",
      firstNames: "",
      email: "pas-un-email",
      password: "court",
    });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((issue) => issue.path[0]);
    expect(paths).toEqual(
      expect.arrayContaining(["lastName", "firstNames", "email", "password"]),
    );
  });

  it("rejette un champ absent du FormData (null)", () => {
    expect(
      memberCreateSchema.safeParse({ ...valid, password: null }).success,
    ).toBe(false);
  });
});

describe("memberUpdateSchema", () => {
  it("accepte un mot de passe vide (inchange)", () => {
    expect(memberUpdateSchema.parse({ ...valid, password: "" }).password).toBe(
      "",
    );
  });

  it("valide un nouveau mot de passe s'il est renseigne", () => {
    expect(
      memberUpdateSchema.safeParse({ ...valid, password: "court" }).success,
    ).toBe(false);
  });
});

describe("toFullName", () => {
  it("place le nom avant les prenoms", () => {
    expect(toFullName(" KOFFI", "Ama ")).toBe("KOFFI Ama");
  });
});

describe("sanitizeMemberSearch", () => {
  it("retire la syntaxe PostgREST et les jokers ilike", () => {
    expect(sanitizeMemberSearch("a,b)(c%_*\\d")).toBe("a b c d");
  });

  it("reduit les espaces et tronque a 80 caracteres", () => {
    expect(sanitizeMemberSearch("  ama   koffi ")).toBe("ama koffi");
    expect(sanitizeMemberSearch("x".repeat(100))).toHaveLength(80);
  });
});

describe("parsePage", () => {
  it("lit un entier >= 1, 1 sinon", () => {
    expect(parsePage("3")).toBe(3);
    expect(parsePage(["2", "5"])).toBe(2);
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("0")).toBe(1);
    expect(parsePage("1.5")).toBe(1);
    expect(parsePage("abc")).toBe(1);
  });
});
