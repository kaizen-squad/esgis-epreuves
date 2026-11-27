"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import type { CatalogueFilterKey } from "@/components/exams/catalogueFilters";

/** Changer de filiere, de niveau ou d'option rend la matiere choisie potentiellement hors sujet : on la retire. */
const CLEARS_SUBJECT: CatalogueFilterKey[] = ["fieldId", "levelId", "optionId"];
/** Changer de filiere rend l'option choisie potentiellement hors sujet (#201, options propres a une
 * filiere), changer de niveau aussi (le filtre Option ne liste que les options reellement presentes
 * pour la filiere ET le niveau choisis, voir `FilterComponents.tsx`) : on la retire dans les deux cas. */
const CLEARS_OPTION: CatalogueFilterKey[] = ["fieldId", "levelId"];

export type CatalogueFilters = ReturnType<typeof useCatalogueFilters>;

/** Lecture/ecriture des filtres dans l'URL ; la page serveur se re-rend avec les nouvelles epreuves. */
export function useCatalogueFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  /**
   * `searchParams` ne reflete le dernier `replace`/`push` qu'au rendu suivant : deux clics rapides
   * (deux puces) liraient tous les deux l'URL d'avant le premier clic et le second ecraserait le
   * premier. On enchaine donc sur le dernier params ecrit, pas sur `searchParams` directement ;
   * l'effet remet ce relais a zero une fois que l'URL reelle a rattrape ce qu'on a ecrit.
   */
  const pendingParams = useRef<URLSearchParams | null>(null);
  useEffect(() => {
    pendingParams.current = null;
  }, [searchParams]);
  const currentParams = () =>
    new URLSearchParams(pendingParams.current ?? searchParams);

  const get = (key: CatalogueFilterKey) => searchParams.get(key);

  const set = (key: CatalogueFilterKey, value: string | null) => {
    const params = currentParams();
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    if (CLEARS_SUBJECT.includes(key)) params.delete("subjectId");
    if (CLEARS_OPTION.includes(key)) params.delete("optionId");
    // Un Controle Continu n'a jamais de session (#196/#203) : la session choisie devient hors
    // sujet, la combinaison ne renverrait jamais rien.
    if (key === "examType" && value === "Contrôle Continu") {
      params.delete("session");
    }
    pendingParams.current = params;

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  /** Change de page sans toucher aux filtres ; `push` pour que « retour » ramene a la page precedente. */
  const goToPage = (page: number) => {
    const params = currentParams();
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    pendingParams.current = params;

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  /** Re-cliquer sur la valeur active la desactive. */
  const toggle = (key: CatalogueFilterKey, value: string) =>
    set(key, get(key) === value ? null : value);

  /** Retire tous les parametres de l'URL (filtres et recherche compris, page aussi). */
  const reset = () => {
    pendingParams.current = new URLSearchParams();
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  return { get, set, toggle, goToPage, reset, page, isPending };
}
