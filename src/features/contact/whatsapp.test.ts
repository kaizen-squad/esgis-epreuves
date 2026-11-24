import { describe, expect, it } from "vitest";
import { whatsappHref } from "./whatsapp";

describe("whatsappHref", () => {
  it("vise le numero sans son +, message encode", () => {
    expect(whatsappHref("Bonjour, ça va ?", "+2290123456789")).toBe(
      "https://wa.me/2290123456789?text=Bonjour%2C%20%C3%A7a%20va%20%3F",
    );
  });

  it("sans numero, laisse choisir le destinataire", () => {
    expect(whatsappHref("Salut")).toBe("https://wa.me/?text=Salut");
    expect(whatsappHref("Salut", null)).toBe("https://wa.me/?text=Salut");
  });
});
