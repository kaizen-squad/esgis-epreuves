"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FiArrowRight } from "@/components/icons";
import { searchExamPreview } from "@/features/exams/actions";
import { searchTokens } from "@/features/exams/schemas";
import { useCatalogueFilters } from "@/components/exams/useCatalogueFilters";
import { BDE_BASE_PATH, examHref } from "@/components/layout/spaces";

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
  /** Catalogue vers lequel renvoie la recherche hors catalogue (`/bde/catalogue` cote BDE). */
  catalogueHref?: string;
};

const DEFAULT_CATALOGUE_HREF = "/catalogue";

/** Ajoute `search` aux filtres deja presents dans `catalogueHref` (ex. `?fieldId=...`), sans les perdre. */
function catalogueSearchHref(catalogueHref: string, query: string): string {
  const term = query.trim();
  if (!term) return catalogueHref;

  const [path, existingQuery] = catalogueHref.split("?");
  const params = new URLSearchParams(existingQuery);
  params.set("search", term);
  return `${path}?${params.toString()}`;
}

/** `fieldId` deja present dans `catalogueHref` (page filiere) : garde l'apercu de recherche dans le meme contexte. */
function fieldIdFromCatalogueHref(catalogueHref: string): string | undefined {
  const [, existingQuery] = catalogueHref.split("?");
  return new URLSearchParams(existingQuery).get("fieldId") ?? undefined;
}

/** `catalogueHref` ("/catalogue" ou "/bde/catalogue") -> espace, pour construire le lien de chaque epreuve trouvee. */
function spaceFromCatalogueHref(
  catalogueHref: string,
): "" | typeof BDE_BASE_PATH {
  return catalogueHref.startsWith(BDE_BASE_PATH) ? BDE_BASE_PATH : "";
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
  /** Page ciblee par une soumission native (sans JS) ; la page courante par defaut. */
  action?: string;
};

function SearchForm({
  query,
  onChange,
  onSubmit,
  onFocus,
  action,
}: SearchFormProps) {
  return (
    <form
      role="search"
      method="get"
      action={action}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="bg-background-primary rounded-control focus-ring-within flex border border-gray-300 py-1 pr-2 pl-4"
    >
      <input
        className="min-w-0 flex-1"
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
        className="bg-background-accent text-text-primary rounded-control flex h-full min-w-0 items-center gap-3 p-2"
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

type PreviewExam = { title: string; slug: string };

type PreviewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; total: number; exams: PreviewExam[] }
  | { status: "error" };

/** Hors catalogue : titres trouves (3 a 5) sous le champ, avec un lien vers le catalogue filtre. */
function LinkResearch({ catalogueHref }: { catalogueHref: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<PreviewState>({ status: "idle" });
  const [isOpen, setIsOpen] = useState(false);
  /** Numero de la derniere requete : une reponse plus ancienne arrivee en retard est ignoree. */
  const requestRef = useRef(0);
  const basePath = spaceFromCatalogueHref(catalogueHref);
  const fieldId = fieldIdFromCatalogueHref(catalogueHref);

  const debounced = useDebounced(async (value: string) => {
    const requestId = requestRef.current;
    try {
      const result = await searchExamPreview(value, fieldId);
      if (requestId === requestRef.current)
        setPreview({ status: "done", ...result });
    } catch {
      if (requestId === requestRef.current) setPreview({ status: "error" });
    }
  });

  const handleChange = (value: string) => {
    setQuery(value);
    requestRef.current += 1;

    if (searchTokens(value).length === 0) {
      debounced.cancel();
      setPreview({ status: "idle" });
      return;
    }

    setPreview({ status: "loading" });
    setIsOpen(true);
    debounced.schedule(value);
  };

  const showPanel = isOpen && preview.status !== "idle";

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
          action={catalogueHref}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          onSubmit={() => {
            setIsOpen(false);
            router.push(catalogueSearchHref(catalogueHref, query));
          }}
        />

        {showPanel && (
          <div
            className="bg-background-primary rounded-control shadow-elevated absolute inset-x-0 top-full z-20 mt-1 border border-gray-300 text-left text-sm"
            aria-live="polite"
          >
            {preview.status === "loading" && (
              <p className="text-text-paragraph px-4 py-3">
                Recherche en cours...
              </p>
            )}

            {preview.status === "error" && (
              <p className="text-text-paragraph px-4 py-3" role="alert">
                Impossible de lancer la recherche.
              </p>
            )}

            {preview.status === "done" &&
              (preview.total === 0 ? (
                <p className="text-text-paragraph px-4 py-3">
                  Aucune épreuve ne correspond à{" "}
                  {basePath === "" ? "ta" : "votre"} recherche.
                </p>
              ) : (
                <>
                  <ul>
                    {preview.exams.map((exam) => (
                      <li key={exam.slug}>
                        <Link
                          href={examHref(basePath, exam.slug)}
                          onClick={() => setIsOpen(false)}
                          className="text-text-default block truncate px-4 py-2.5 font-medium hover:bg-gray-100"
                        >
                          {exam.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={catalogueSearchHref(catalogueHref, query)}
                    onClick={() => setIsOpen(false)}
                    className="text-text-default flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 font-medium hover:bg-gray-100"
                  >
                    <span className="truncate">
                      Voir {preview.total === 1 ? "le" : `les ${preview.total}`}{" "}
                      résultat{preview.total > 1 ? "s" : ""} pour «&nbsp;
                      {query.trim()}&nbsp;»
                    </span>
                    <FiArrowRight className="shrink-0" />
                  </Link>
                </>
              ))}
          </div>
        )}
      </div>
    </ResearchShell>
  );
}

const Research = ({
  live = false,
  initialQuery,
  catalogueHref = DEFAULT_CATALOGUE_HREF,
}: ResearchProps) =>
  live ? (
    <LiveResearch initialQuery={initialQuery} />
  ) : (
    <LinkResearch catalogueHref={catalogueHref} />
  );

export default Research;
