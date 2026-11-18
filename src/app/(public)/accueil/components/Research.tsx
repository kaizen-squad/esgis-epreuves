"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { searchExamSuggestions } from "@/features/exams/actions";
import { searchTokens } from "@/features/exams/schemas";
import type { Exam } from "@/features/exams/types";

const DEBOUNCE_MS = 300;
/** Aligne sur MAX_SEARCH_LENGTH d'examFiltersSchema : au-dela, le serveur ignorerait le terme. */
const MAX_QUERY_LENGTH = 100;

type SuggestionsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; exams: Exam[] }
  | { status: "error" };

type ResearchProps = {
  /** Terme deja present dans l'URL (page catalogue), pour pre-remplir le champ. */
  initialQuery?: string;
};

function catalogueHref(query: string): string {
  const term = query.trim();
  return term ? `/catalogue?search=${encodeURIComponent(term)}` : "/catalogue";
}

const Research = ({ initialQuery = "" }: ResearchProps) => {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SuggestionsState>({
    status: "idle",
  });
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Numero de la derniere requete : une reponse plus ancienne arrivee en retard est ignoree. */
  const requestRef = useRef(0);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const handleChange = (value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    const requestId = ++requestRef.current;

    if (searchTokens(value).length === 0) {
      setSuggestions({ status: "idle" });
      setIsOpen(false);
      return;
    }

    setSuggestions({ status: "loading" });
    setIsOpen(true);
    timerRef.current = setTimeout(async () => {
      try {
        const exams = await searchExamSuggestions(value);
        if (requestId === requestRef.current)
          setSuggestions({ status: "done", exams });
      } catch {
        if (requestId === requestRef.current)
          setSuggestions({ status: "error" });
      }
    }, DEBOUNCE_MS);
  };

  const handleSubmit = () => {
    setIsOpen(false);
    router.push(catalogueHref(query));
  };

  const showPanel = isOpen && suggestions.status !== "idle";

  return (
    <div className="mb-8 px-6 text-center">
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
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
          className="bg-background-primary flex border border-gray-300 py-1 pr-2 pl-4"
        >
          <input
            className="min-w-0 flex-1 outline-none"
            type="search"
            name="search"
            value={query}
            maxLength={MAX_QUERY_LENGTH}
            onChange={(event) => handleChange(event.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Rechercher une matière, un titre..."
            aria-label="Rechercher une épreuve"
            aria-controls={listId}
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

        {showPanel && (
          <div
            id={listId}
            className="bg-background-primary absolute inset-x-0 top-full z-20 mt-1 border border-gray-300 text-left shadow-lg"
          >
            {suggestions.status === "loading" && (
              <p className="text-text-paragraph px-4 py-3 text-sm">
                Recherche en cours...
              </p>
            )}

            {suggestions.status === "error" && (
              <p className="text-text-paragraph px-4 py-3 text-sm" role="alert">
                Impossible de charger les suggestions.
              </p>
            )}

            {suggestions.status === "done" &&
              (suggestions.exams.length === 0 ? (
                <p className="text-text-paragraph px-4 py-3 text-sm">
                  Aucune épreuve ne correspond à votre recherche.
                </p>
              ) : (
                <ul>
                  {suggestions.exams.map((exam) => (
                    <li key={exam.id}>
                      <a
                        href={`/api/exams/${exam.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        <span className="text-text-default block truncate font-medium">
                          {exam.title}
                        </span>
                        <span className="text-text-paragraph block truncate text-xs">
                          {exam.subject} · {exam.field} · {exam.level} ·{" "}
                          {exam.academicYear}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ))}

            {suggestions.status === "done" && suggestions.exams.length > 0 && (
              <Link
                href={catalogueHref(query)}
                onClick={() => setIsOpen(false)}
                className="text-text-default flex items-center justify-between border-t border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-100"
              >
                Voir tous les résultats
                <FiArrowRight />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Research;
