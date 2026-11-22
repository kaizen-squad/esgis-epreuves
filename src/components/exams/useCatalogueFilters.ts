"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { CatalogueFilterKey } from "@/components/exams/catalogueFilters";

/** Changer de filiere ou de niveau rend la matiere choisie potentiellement hors sujet : on la retire. */
const CLEARS_SUBJECT: CatalogueFilterKey[] = ["fieldId", "levelId"];

export type CatalogueFilters = ReturnType<typeof useCatalogueFilters>;

/** Lecture/ecriture des filtres dans l'URL ; la page serveur se re-rend avec les nouvelles epreuves. */
export function useCatalogueFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const get = (key: CatalogueFilterKey) => searchParams.get(key);

  const set = (key: CatalogueFilterKey, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    if (CLEARS_SUBJECT.includes(key)) params.delete("subjectId");

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  /** Change de page sans toucher aux filtres ; `push` pour que « retour » ramene a la page precedente. */
  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) params.set("page", String(page));
    else params.delete("page");

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

  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  return { get, set, toggle, goToPage, page, isPending };
}
