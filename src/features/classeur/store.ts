import { classeurStateSchema } from "./schemas";
import type { ClasseurState, PinnedField } from "./types";

const STORAGE_KEY = "esgis-epreuves:classeur";

export const EMPTY_STATE: ClasseurState = {
  version: 1,
  pinnedField: null,
};

let cachedRaw: string | null = null;
let cachedState: ClasseurState = EMPTY_STATE;
const subscribers = new Set<() => void>();

/**
 * Stockage bloque (cookies tiers desactives, quota plein, navigation privee restrictive) : la
 * simple lecture de `window.localStorage` peut lever une `SecurityError`, pas seulement l'ecriture.
 * Une fois constate, on arrete d'y toucher et la memoire de cet onglet devient la seule source.
 */
let storageBroken = false;

function hasStorage(): boolean {
  if (storageBroken || typeof window === "undefined") return false;
  try {
    return !!window.localStorage;
  } catch {
    storageBroken = true;
    return false;
  }
}

function readRaw(): string | null {
  // Stockage indisponible : la memoire de cet onglet est deja la source, `cachedRaw` la reflete.
  if (!hasStorage()) return cachedRaw;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    storageBroken = true;
    return cachedRaw;
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
    // Quota plein ou navigation privee : l'etat reste correct en memoire pour cet onglet
    // (`storageBroken` empeche `readRaw` d'ecraser cet etat avec l'ancienne valeur du disque).
    storageBroken = true;
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

export function pinField(field: PinnedField | null) {
  const current = getSnapshot();
  write({ ...current, pinnedField: field });
  notify();
}
