"use client";

import { useSyncExternalStore } from "react";
import {
  getServerSnapshot,
  getSnapshot,
  pinField,
  recordVisit,
  subscribe,
  toggleFavorite,
} from "./store";

/**
 * Classeur local au navigateur (R-11) : favoris, filiere epinglee, dernieres visites. Le premier
 * rendu client reprend l'etat vide du serveur (pas de mismatch d'hydratation) ; l'etat reel
 * arrive au rendu suivant, via `useSyncExternalStore`.
 */
export function useClasseur() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { state, toggleFavorite, pinField, recordVisit };
}
