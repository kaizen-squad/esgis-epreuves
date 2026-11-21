"use client";

import { useId, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { searchTokens } from "@/features/exams/schemas";
import type { Subject } from "@/features/referentials/types";

const MAX_SUGGESTIONS = 8;

/**
 * Recherche de matiere parmi celles de la filiere (et du niveau, s'il est choisi) selectionnes.
 * Le texte saisi ne sert qu'a filtrer : seule une matiere choisie dans la liste remplit
 * `subjectId` (champ cache envoye avec le formulaire).
 */
export default function SubjectSearch({
  subjects,
  fieldId,
  levelId,
  subjectId,
  onChange,
  error,
}: {
  subjects: Subject[];
  fieldId: string;
  levelId: string;
  subjectId: string;
  onChange: (subjectId: string) => void;
  error?: string;
}) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selected = subjects.find((subject) => subject.id === subjectId);
  const available = subjects.filter(
    (subject) =>
      subject.fieldId === fieldId && (!levelId || subject.levelId === levelId),
  );
  const tokens = searchTokens(query);
  const suggestions = available
    .filter((subject) => {
      const name = searchTokens(subject.name).join(" ");
      return tokens.every((token) => name.includes(token));
    })
    .slice(0, MAX_SUGGESTIONS);

  const disabled = !fieldId;
  const inputValue = selected && !open ? selected.name : query;

  const choose = (subject: Subject) => {
    onChange(subject.id);
    setQuery(subject.name);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="subject-search" className="font-medium">
        Matière *
      </label>
      <div className="relative">
        <div
          className={`flex items-center rounded-lg border px-3 py-2 ${error ? "border-red-400" : "border-gray-300"} ${disabled ? "bg-background-default" : ""}`}
        >
          <input
            id="subject-search"
            type="search"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "subjectId-error" : "subject-hint"}
            autoComplete="off"
            disabled={false}
            value={inputValue}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              if (subjectId) onChange("");
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
              if (event.key === "Enter" && open && suggestions[0]) {
                event.preventDefault();
                choose(suggestions[0]);
              }
            }}
            placeholder={
              disabled
                ? "Choisissez d'abord une filière"
                : "Rechercher une matière"
            }
            className="min-w-0 flex-1 bg-transparent outline-none"
          />
          <FiSearch size={20} className="text-text-paragraph shrink-0" />
        </div>
        <input type="hidden" name="subjectId" value={subjectId} />

        {open && !disabled ? (
          <ul
            id={listId}
            role="listbox"
            className="bg-background-primary absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 py-1 shadow-lg"
          >
            {suggestions.length === 0 ? (
              <li className="text-text-paragraph px-3 py-2 text-sm">
                {available.length === 0
                  ? "Aucune matière pour cette filière et ce niveau."
                  : "Aucune matière ne correspond."}
              </li>
            ) : (
              suggestions.map((subject) => (
                <li
                  key={subject.id}
                  role="option"
                  aria-selected={subject.id === subjectId}
                  // mousedown plutot que click : passe avant le blur qui ferme la liste.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    choose(subject);
                  }}
                  className="hover:bg-background-default cursor-pointer px-3 py-2 text-sm aria-selected:font-semibold"
                >
                  {subject.name}
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
      {error ? (
        <p id="subjectId-error" className="mb-0 text-sm text-red-600">
          {error}
        </p>
      ) : (
        <span id="subject-hint" className="text-text-paragraph text-sm">
          Rechercher par nom dans la filière sélectionnée.
        </span>
      )}
    </div>
  );
}
