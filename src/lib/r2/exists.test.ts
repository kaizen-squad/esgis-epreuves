import { beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
vi.mock("./client", () => ({ createClient: () => ({ send }) }));

const { examFileExists } = await import("./exists");

beforeEach(() => {
  send.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("examFileExists", () => {
  it("vrai quand l'objet existe", async () => {
    send.mockResolvedValue({});
    expect(await examFileExists("exams/a.pdf")).toBe(true);
  });

  it("faux sur un 404, sans journaliser", async () => {
    send.mockRejectedValue({ $metadata: { httpStatusCode: 404 } });
    expect(await examFileExists("exams/a.pdf")).toBe(false);
    expect(console.error).not.toHaveBeenCalled();
  });

  it("faux et journalise sur toute autre erreur (identifiants, reseau)", async () => {
    send.mockRejectedValue(new Error("network"));
    expect(await examFileExists("exams/a.pdf")).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });

  it("faux sur un 404 en mode strict, sans relancer", async () => {
    send.mockRejectedValue({ $metadata: { httpStatusCode: 404 } });
    expect(await examFileExists("exams/a.pdf", { strict: true })).toBe(false);
  });

  it("relance toute autre erreur en mode strict, apres l'avoir journalisee", async () => {
    const error = new Error("network");
    send.mockRejectedValue(error);
    await expect(
      examFileExists("exams/a.pdf", { strict: true }),
    ).rejects.toThrow(error);
    expect(console.error).toHaveBeenCalled();
  });
});
