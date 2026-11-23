"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, pinField, subscribe } from "./store";

/**
 * Filiere epinglee ("Ma filiere", R-11), stockee localement au navigateur. Le premier rendu
 * client reprend l'etat vide du serveur (pas de mismatch d'hydratation) ; l'etat reel arrive au
 * rendu suivant, via `useSyncExternalStore`.
 */
export function useClasseur() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { state, pinField };
}
