import { describe, expect, it } from "vitest";
import { loginSchema } from "./schemas";

describe("loginSchema", () => {
  it("accepte un email et un mot de passe non vides", () => {
    expect(
      loginSchema.safeParse({ email: "bde@esgis.local", password: "x" })
        .success,
    ).toBe(true);
  });

  it("rejette un email mal forme", () => {
    expect(
      loginSchema.safeParse({ email: "pas-un-email", password: "x" }).success,
    ).toBe(false);
  });

  it("rejette un mot de passe vide", () => {
    expect(
      loginSchema.safeParse({ email: "bde@esgis.local", password: "" }).success,
    ).toBe(false);
  });
});
