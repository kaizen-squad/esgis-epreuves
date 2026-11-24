import { describe, expect, it } from "vitest";
import { whatsappNumberSchema } from "./schemas";

const parse = (value: unknown) => whatsappNumberSchema.safeParse(value);

describe("whatsappNumberSchema", () => {
  it("normalise un numero international saisi avec espaces, points ou tirets", () => {
    expect(parse(" +229 01.23-45 67 89 ").data).toBe("+2290123456789");
    expect(parse("+33 (6) 12 34 56 78").data).toBe("+33612345678");
  });

  it("accepte le prefixe 00 a la place du +", () => {
    expect(parse("00229 01 23 45 67 89").data).toBe("+2290123456789");
  });

  it("un champ vide retire le numero (null)", () => {
    expect(parse("").data).toBeNull();
    expect(parse("   ").data).toBeNull();
  });

  it("refuse un numero sans indicatif, trop court, trop long ou avec des lettres", () => {
    for (const value of [
      "0123456789",
      "+229 12",
      "+1234567890123456",
      "+229 01 AB 45",
      "+0229123456",
    ]) {
      expect(parse(value).success, value).toBe(false);
    }
  });
});
