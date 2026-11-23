import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class FakeStorage {
  private data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

/** Re-importe `store.ts` a neuf : simule un rechargement de page (module re-evalue). */
async function freshStore() {
  vi.resetModules();
  return await import("./store");
}

describe("classeur store", () => {
  let storage: FakeStorage;

  beforeEach(() => {
    storage = new FakeStorage();
    vi.stubGlobal("window", { localStorage: storage, dispatchEvent: vi.fn() });
    vi.stubGlobal("localStorage", storage);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("epingle puis desepingle une filiere", async () => {
    const store = await freshStore();
    store.pinField({ id: "field-1", name: "IRT" });
    expect(store.getSnapshot().pinnedField).toEqual({
      id: "field-1",
      name: "IRT",
    });

    store.pinField(null);
    expect(store.getSnapshot().pinnedField).toBeNull();
  });

  it("persiste la filiere epinglee apres rechargement", async () => {
    const store = await freshStore();
    store.pinField({ id: "field-1", name: "IRT" });

    const reloaded = await freshStore();
    expect(reloaded.getSnapshot().pinnedField).toEqual({
      id: "field-1",
      name: "IRT",
    });
  });

  it("getServerSnapshot renvoie l'etat vide meme avec des donnees stockees", async () => {
    const store = await freshStore();
    store.pinField({ id: "field-1", name: "IRT" });

    expect(store.getServerSnapshot().pinnedField).toBeNull();
  });

  it("getSnapshot renvoie la meme reference sans ecriture, une nouvelle apres ecriture", async () => {
    const store = await freshStore();
    const first = store.getSnapshot();
    const second = store.getSnapshot();
    expect(second).toBe(first);

    store.pinField({ id: "field-1", name: "IRT" });
    expect(store.getSnapshot()).not.toBe(first);
  });

  it("un JSON corrompu retombe sur l'etat vide", async () => {
    storage.setItem("esgis-epreuves:classeur", "{ pas du json valide");
    const store = await freshStore();
    expect(store.getSnapshot().pinnedField).toBeNull();
  });

  it("une version inconnue retombe sur l'etat vide", async () => {
    storage.setItem(
      "esgis-epreuves:classeur",
      JSON.stringify({
        version: 99,
        pinnedField: { id: "field-1", name: "IRT" },
      }),
    );
    const store = await freshStore();
    expect(store.getSnapshot().pinnedField).toBeNull();
  });

  it("une erreur a l'ecriture ne fait pas planter, et garde l'etat en memoire", async () => {
    const store = await freshStore();
    vi.spyOn(storage, "setItem").mockImplementation(() => {
      throw new Error("quota depasse");
    });

    expect(() => store.pinField({ id: "field-1", name: "IRT" })).not.toThrow();
    // La filiere reste visible en memoire meme si la lecture suivante retombe sur le disque
    // (toujours vide, puisque l'ecriture a echoue) : sans le correctif, elle disparaitrait.
    expect(store.getSnapshot().pinnedField).toEqual({
      id: "field-1",
      name: "IRT",
    });
  });

  it("un stockage dont la simple lecture leve une exception ne fait pas planter", async () => {
    vi.stubGlobal("window", {
      get localStorage(): never {
        throw new DOMException("bloque", "SecurityError");
      },
      dispatchEvent: vi.fn(),
      addEventListener: vi.fn(),
    });
    const store = await freshStore();

    expect(() => store.getSnapshot()).not.toThrow();
    expect(store.getSnapshot().pinnedField).toBeNull();
  });

  it("un evenement storage d'un autre onglet notifie les abonnes", async () => {
    const store = await freshStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    storage.setItem(
      "esgis-epreuves:classeur",
      JSON.stringify({
        version: 1,
        pinnedField: { id: "field-1", name: "IRT" },
      }),
    );
    store.notifyStorageEvent({ key: "esgis-epreuves:classeur" });

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
