"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { CgSpinner } from "react-icons/cg";
import { FiSearch } from "react-icons/fi";

const DEBOUNCE_MS = 300;

/**
 * Recherche d'un membre par nom ou email. Met a jour `?q=` (et revient a la premiere page) apres
 * une courte pause de frappe ; la liste est filtree cote serveur.
 */
export default function MemberSearch({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  // Derniere recherche envoyee a l'URL : si l'URL change autrement (lien « Effacer la
  // recherche », retour arriere), le champ se recale sur elle.
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setQuery(urlQuery);
  }
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const pushQuery = (value: string) => {
    const params = new URLSearchParams(searchParams);
    const term = value.trim();
    setSyncedQuery(term);
    if (term) params.set("q", term);
    else params.delete("q");
    params.delete("page");
    const search = params.toString();
    startTransition(() =>
      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      }),
    );
  };

  const handleChange = (value: string) => {
    setQuery(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => pushQuery(value), DEBOUNCE_MS);
  };

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        clearTimeout(timer.current);
        pushQuery(query);
      }}
      className="relative w-full sm:w-72"
    >
      <label htmlFor="member-search" className="sr-only">
        Rechercher un membre
      </label>
      <FiSearch
        size={16}
        className="text-text-paragraph pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
      />
      <input
        id="member-search"
        type="search"
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Rechercher par nom ou email"
        className="field-control pr-9 pl-9 text-sm"
      />
      {pending ? (
        <CgSpinner
          size={16}
          className="text-text-paragraph absolute top-1/2 right-3 -translate-y-1/2 animate-spin"
        />
      ) : null}
      <p aria-live="polite" className="sr-only">
        {resultCount} résultat{resultCount === 1 ? "" : "s"}
      </p>
    </form>
  );
}
