"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FiArrowRight } from "react-icons/fi";
import { countSearchResults } from "@/features/exams/actions";
import { searchTokens } from "@/features/exams/schemas";
import { useCatalogueFilters } from "../../components/filter/useCatalogueFilters";

const DEBOUNCE_MS = 300;
/** Aligne sur MAX_SEARCH_LENGTH d'examFiltersSchema : au-dela, le serveur ignorerait le terme. */
const MAX_QUERY_LENGTH = 100;

type ResearchProps = {
  /**
   * Page catalogue : la saisie met directement a jour `?search=` et donc les epreuves affichees.
   * Ailleurs : un lien "Voir les N resultats" renvoie vers le catalogue.
   */
  live?: boolean;
  /** Terme deja present dans l'URL (page catalogue), pour pre-remplir le champ. */
  initialQuery?: string;
};

function catalogueHref(query: string): string {
  const term = query.trim();
  return term ? `/catalogue?search=${encodeURIComponent(term)}` : "/catalogue";
}

/** Appelle `callback` apres DEBOUNCE_MS sans nouvel appel ; `cancel` annule l'appel en attente. */
function useDebounced<T>(callback: (value: T) => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const cancel = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  const schedule = (value: T) => {
    cancel();
    timerRef.current = setTimeout(() => callback(value), DEBOUNCE_MS);
  };

  return { schedule, cancel };
}

type SearchFormProps = {
  query: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onFocus?: () => void;
};

function SearchForm({ query, onChange, onSubmit, onFocus }: SearchFormProps) {
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="bg-background-primary flex border border-gray-300 py-1 pr-2 pl-4"
    >
      <input
        className="min-w-0 flex-1 outline-none"
        type="search"
        name="search"
        value={query}
        maxLength={MAX_QUERY_LENGTH}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        placeholder="Rechercher une matière, un titre..."
        aria-label="Rechercher une épreuve"
        autoComplete="off"
      />
      <button
        type="submit"
        className="bg-background-accent text-text-primary flex h-full min-w-0 cursor-pointer items-center gap-3 p-2"
      >
        Rechercher
        <FiArrowRight />
      </button>
    </form>
  );
}

function ResearchShell({ children }: { children: ReactNode }) {
  return <div className="mb-8 px-6 text-center">{children}</div>;
}

/** Catalogue : la saisie filtre directement les epreuves de la page via l'URL. */
function LiveResearch({ initialQuery = "" }: { initialQuery?: string }) {
  const filters = useCatalogueFilters();
  const [query, setQuery] = useState(initialQuery);
  const apply = (value: string) => {
    const term = value.trim();
    if (term !== (filters.get("search") ?? "")) filters.set("search", term);
  };
  const debounced = useDebounced(apply);

  return (
    <ResearchShell>
      <div className="mx-auto md:w-2/3 lg:w-1/3">
        <SearchForm
          query={query}
          onChange={(value) => {
            setQuery(value);
            debounced.schedule(value);
          }}
          onSubmit={() => {
            debounced.cancel();
            apply(query);
          }}
        />
      </div>
    </ResearchShell>
  );
}

type CountState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; total: number }
  | { status: "error" };

/** Hors catalogue : nombre de resultats sous le champ, avec un lien vers le catalogue filtre. */
function LinkResearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [count, setCount] = useState<CountState>({ status: "idle" });
  const [isOpen, setIsOpen] = useState(false);
  /** Numero de la derniere requete : une reponse plus ancienne arrivee en retard est ignoree. */
  const requestRef = useRef(0);

  const debounced = useDebounced(async (value: string) => {
    const requestId = requestRef.current;
    try {
      const total = await countSearchResults(value);
      if (requestId === requestRef.current) setCount({ status: "done", total });
    } catch {
      if (requestId === requestRef.current) setCount({ status: "error" });
    }
  });

  const handleChange = (value: string) => {
    setQuery(value);
    requestRef.current += 1;

    if (searchTokens(value).length === 0) {
      debounced.cancel();
      setCount({ status: "idle" });
      return;
    }

    setCount({ status: "loading" });
    setIsOpen(true);
    debounced.schedule(value);
  };

  const showPanel = isOpen && count.status !== "idle";

  return (
    <ResearchShell>
      <div
        className="relative mx-auto md:w-2/3 lg:w-1/3"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setIsOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setIsOpen(false);
        }}
      >
        <SearchForm
          query={query}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          onSubmit={() => {
            setIsOpen(false);
            router.push(catalogueHref(query));
          }}
        />

        {showPanel && (
          <div
            className="bg-background-primary absolute inset-x-0 top-full z-20 mt-1 border border-gray-300 text-left text-sm shadow-lg"
            aria-live="polite"
          >
            {count.status === "loading" && (
              <p className="text-text-paragraph px-4 py-3">
                Recherche en cours...
              </p>
            )}

            {count.status === "error" && (
              <p className="text-text-paragraph px-4 py-3" role="alert">
                Impossible de lancer la recherche.
              </p>
            )}

            {count.status === "done" &&
              (count.total === 0 ? (
                <p className="text-text-paragraph px-4 py-3">
                  Aucune épreuve ne correspond à votre recherche.
                </p>
              ) : (
                <Link
                  href={catalogueHref(query)}
                  onClick={() => setIsOpen(false)}
                  className="text-text-default flex items-center justify-between gap-3 px-4 py-3 font-medium hover:bg-gray-100"
                >
                  <span className="truncate">
                    Voir {count.total === 1 ? "le" : `les ${count.total}`}{" "}
                    résultat{count.total > 1 ? "s" : ""} pour «&nbsp;
                    {query.trim()}&nbsp;»
                  </span>
                  <FiArrowRight className="shrink-0" />
                </Link>
              ))}
          </div>
        )}
      </div>
    </ResearchShell>
  );
}

const Research = ({ live = false, initialQuery }: ResearchProps) =>
  live ? <LiveResearch initialQuery={initialQuery} /> : <LinkResearch />;

export default Research;
