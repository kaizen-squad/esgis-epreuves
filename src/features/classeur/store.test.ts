import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FavoriteSnapshot } from "./types";

const favorite: FavoriteSnapshot = {
  slug: "irt-l2-algebre-2023-ct",
  title: "Algèbre - Contrôle terminal",
  field: "IRT",
  subject: "Algèbre",
  academicYear: "2023-2024",
  savedAt: "2026-01-01T00:00:00.000Z",
};

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

  it("persiste un favori apres rechargement", async () => {
    const store = await freshStore();
    store.toggleFavorite(favorite);

    const reloaded = await freshStore();
    expect(reloaded.getSnapshot().favorites[favorite.slug]).toEqual(favorite);
  });

  it("retire un favori deja present", async () => {
    const store = await freshStore();
    store.toggleFavorite(favorite);
    store.toggleFavorite(favorite);

    expect(store.getSnapshot().favorites[favorite.slug]).toBeUndefined();
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

  it("enregistre la date de derniere visite", async () => {
    vi.setSystemTime(new Date("2026-03-01T10:00:00.000Z"));
    const store = await freshStore();
    store.recordVisit(favorite.slug);

    expect(store.getSnapshot().lastVisits[favorite.slug]).toBe(
      "2026-03-01T10:00:00.000Z",
    );
    vi.useRealTimers();
  });

  it("getServerSnapshot renvoie l'etat vide meme avec des donnees stockees", async () => {
    const store = await freshStore();
    store.toggleFavorite(favorite);

    expect(store.getServerSnapshot().favorites).toEqual({});
  });

  it("getSnapshot renvoie la meme reference sans ecriture, une nouvelle apres ecriture", async () => {
    const store = await freshStore();
    const first = store.getSnapshot();
    const second = store.getSnapshot();
    expect(second).toBe(first);

    store.toggleFavorite(favorite);
    expect(store.getSnapshot()).not.toBe(first);
  });

  it("un JSON corrompu retombe sur l'etat vide", async () => {
    storage.setItem("esgis-epreuves:classeur", "{ pas du json valide");
    const store = await freshStore();
    expect(store.getSnapshot().favorites).toEqual({});
  });

  it("une version inconnue retombe sur l'etat vide", async () => {
    storage.setItem(
      "esgis-epreuves:classeur",
      JSON.stringify({ version: 99, favorites: {}, lastVisits: {} }),
    );
    const store = await freshStore();
    expect(store.getSnapshot().favorites).toEqual({});
  });

  it("une erreur localStorage ne fait pas planter l'ecriture", async () => {
    const store = await freshStore();
    vi.spyOn(storage, "setItem").mockImplementation(() => {
      throw new Error("quota depasse");
    });

    expect(() => store.toggleFavorite(favorite)).not.toThrow();
  });

  it("un evenement storage d'un autre onglet notifie les abonnes", async () => {
    const store = await freshStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    storage.setItem(
      "esgis-epreuves:classeur",
      JSON.stringify({
        version: 1,
        favorites: { [favorite.slug]: favorite },
        pinnedField: null,
        lastVisits: {},
      }),
    );
    store.notifyStorageEvent({ key: "esgis-epreuves:classeur" });

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
