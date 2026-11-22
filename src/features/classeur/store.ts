import { classeurStateSchema } from "./schemas";
import type { ClasseurState, FavoriteSnapshot, PinnedField } from "./types";

const STORAGE_KEY = "esgis-epreuves:classeur";

export const EMPTY_STATE: ClasseurState = {
  version: 1,
  favorites: {},
  pinnedField: null,
  lastVisits: {},
};

let cachedRaw: string | null = null;
let cachedState: ClasseurState = EMPTY_STATE;
const subscribers = new Set<() => void>();

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readRaw(): string | null {
  if (!hasStorage()) return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): ClasseurState {
  if (!raw) return EMPTY_STATE;
  try {
    return classeurStateSchema.parse(JSON.parse(raw));
  } catch {
    return EMPTY_STATE;
  }
}

function write(state: ClasseurState) {
  cachedState = state;
  cachedRaw = JSON.stringify(state);
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  } catch {
    // Navigation privee ou quota plein : l'etat reste correct en memoire pour cet onglet.
  }
}

function notify() {
  for (const subscriber of subscribers) subscriber();
}

/** Reference stable tant que le contenu stocke ne change pas, sinon `useSyncExternalStore` boucle. */
export function getSnapshot(): ClasseurState {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedState = parse(raw);
  }
  return cachedState;
}

export function getServerSnapshot(): ClasseurState {
  return EMPTY_STATE;
}

export function subscribe(callback: () => void): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

/** Appele depuis l'ecouteur `storage` (autre onglet) : ne reagit qu'aux changements de notre cle. */
export function notifyStorageEvent(event: { key: string | null }) {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  notify();
}

if (
  typeof window !== "undefined" &&
  typeof window.addEventListener === "function"
) {
  window.addEventListener("storage", notifyStorageEvent);
}

export function toggleFavorite(snapshot: FavoriteSnapshot) {
  const current = getSnapshot();
  const favorites = { ...current.favorites };
  if (favorites[snapshot.slug]) delete favorites[snapshot.slug];
  else favorites[snapshot.slug] = snapshot;
  write({ ...current, favorites });
  notify();
}

export function pinField(field: PinnedField | null) {
  const current = getSnapshot();
  write({ ...current, pinnedField: field });
  notify();
}

export function recordVisit(slug: string) {
  const current = getSnapshot();
  write({
    ...current,
    lastVisits: { ...current.lastVisits, [slug]: new Date().toISOString() },
  });
  notify();
}
