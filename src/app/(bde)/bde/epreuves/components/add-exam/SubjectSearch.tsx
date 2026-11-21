"use client";

import { useId, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { searchTokens } from "@/features/exams/schemas";
import type { Field, Level, Subject } from "@/features/referentials/types";

const MAX_SUGGESTIONS = 8;
const PLACEHOLDER_EXAMPLES = 2;

function matches(subject: Subject, tokens: string[]) {
  const name = searchTokens(subject.name).join(" ");
  return tokens.every((token) => name.includes(token));
}

/**
 * Recherche de matiere. La liste est restreinte a la filiere et au niveau choisis quand ils le
 * sont ; sinon (ou si rien n'y correspond) la recherche porte sur toutes les matieres, et choisir
 * une matiere renseigne sa filiere et son niveau. Le texte saisi ne sert qu'a filtrer : seule une
 * matiere choisie dans la liste remplit `subjectId` (champ cache envoye avec le formulaire).
 */
export default function SubjectSearch({
  subjects,
  fields,
  levels,
  fieldId,
  levelId,
  subjectId,
  onSelect,
  error,
}: {
  subjects: Subject[];
  fields: Field[];
  levels: Level[];
  fieldId: string;
  levelId: string;
  subjectId: string;
  onSelect: (subject: Subject | null) => void;
  error?: string;
}) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const fieldName = new Map(fields.map((field) => [field.id, field.name]));
  const levelName = new Map(levels.map((level) => [level.id, level.name]));

  const selected = subjects.find((subject) => subject.id === subjectId);
  const scoped = subjects.filter(
    (subject) =>
      (!fieldId || subject.fieldId === fieldId) &&
      (!levelId || subject.levelId === levelId),
  );
  const tokens = searchTokens(query);
  const scopedMatches = scoped.filter((subject) => matches(subject, tokens));
  // Rien dans la filiere/le niveau choisis : on elargit a toutes les matieres plutot que de
  // laisser une recherche sans resultat.
  const outOfScope = scopedMatches.length === 0 && (!!fieldId || !!levelId);
  const suggestions = (
    outOfScope
      ? subjects.filter((subject) => matches(subject, tokens))
      : scopedMatches
  ).slice(0, MAX_SUGGESTIONS);

  const examples = (scoped.length ? scoped : subjects)
    .slice(0, PLACEHOLDER_EXAMPLES)
    .map((subject) => subject.name);
  const placeholder = examples.length
    ? `Ex. : ${examples.join(", ")}`
    : "Rechercher une matière";

  const inputValue = selected && !open ? selected.name : query;

  const choose = (subject: Subject) => {
    onSelect(subject);
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
          className={`flex items-center rounded-lg border px-3 py-2 ${error ? "border-red-400" : "border-gray-300"}`}
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
            value={inputValue}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              if (subjectId) onSelect(null);
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
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent outline-none"
          />
          <FiSearch size={20} className="text-text-paragraph shrink-0" />
        </div>
        <input type="hidden" name="subjectId" value={subjectId} />

        {open ? (
          <ul
            id={listId}
            role="listbox"
            className="bg-background-primary absolute z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-gray-200 py-1 shadow-lg"
          >
            {outOfScope && suggestions.length > 0 ? (
              <li className="text-text-paragraph px-3 py-1 text-xs">
                Aucune matière dans la filière et le niveau choisis. Autres
                matières :
              </li>
            ) : null}
            {suggestions.length === 0 ? (
              <li className="text-text-paragraph px-3 py-2 text-sm">
                Aucune matière ne correspond à « {query} ».
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
                  className="hover:bg-background-default flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm aria-selected:font-semibold"
                >
                  <span className="truncate">{subject.name}</span>
                  <span className="text-text-paragraph shrink-0 text-xs font-normal">
                    {fieldName.get(subject.fieldId)} ·{" "}
                    {levelName.get(subject.levelId)}
                  </span>
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
          Recherchez par nom. Choisir une matière renseigne sa filière et son
          niveau.
        </span>
      )}
    </div>
  );
}
