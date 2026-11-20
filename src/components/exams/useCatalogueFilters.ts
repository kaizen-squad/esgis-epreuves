"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { CatalogueFilterKey } from "@/components/exams/catalogueFilters";

/** Filtres comptes dans le badge (la recherche et la page n'en sont pas). */
const COUNTED_KEYS: CatalogueFilterKey[] = [
  "fieldId",
  "levelId",
  "subjectId",
  "session",
  "examType",
  "academicYear",
];

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

  /** Re-cliquer sur la valeur active la desactive. */
  const toggle = (key: CatalogueFilterKey, value: string) =>
    set(key, get(key) === value ? null : value);

  const activeCount = COUNTED_KEYS.filter((key) =>
    searchParams.has(key),
  ).length;

  return { get, set, toggle, activeCount, isPending };
}
