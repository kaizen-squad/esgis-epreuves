import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string) {
  // On place un subscriber sur la changement de taille de l'écran
  return useSyncExternalStore(
    // le premier argument est la fonction de subscribe qui dérit à quoi on doit se subscribe. Lorsque l'état change, il appelle le callback qui déclenche le deuxième argument.
    (callback) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", callback);

      return () => mediaQueryList.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
  );
}
