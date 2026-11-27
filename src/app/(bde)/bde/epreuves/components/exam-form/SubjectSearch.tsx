"use client";

import { useEffect, useId, useRef, useState } from "react";
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
  const selected = subjects.find((subject) => subject.id === subjectId);
  // Prerempli avec la matiere deja choisie (formulaire de modification).
  const [query, setQuery] = useState(selected?.name ?? "");
  const [open, setOpen] = useState(false);
  // Suggestion mise en avant au clavier (#173) : -1 tant qu'aucune n'est active.
  const [activeIndex, setActiveIndex] = useState(-1);

  const fieldName = new Map(fields.map((field) => [field.id, field.name]));
  const levelName = new Map(levels.map((level) => [level.id, level.name]));
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
  // Clampee sur la liste courante : une liste qui se reduit (filtrage) ne doit pas laisser
  // l'index actif pointer hors bornes.
  const activeOption =
    activeIndex >= 0 && activeIndex < suggestions.length
      ? suggestions[activeIndex]
      : undefined;
  const optionId = (subject: Subject) => `${listId}-${subject.id}`;
  const listRef = useRef<HTMLUListElement>(null);

  // La suggestion active sort parfois de la zone visible (8 suggestions peuvent deborder
  // `max-h-72`) : la garder visible en naviguant au clavier (#173, revue de code apres coup).
  useEffect(() => {
    if (!open || !activeOption) return;
    // `optionId(activeOption)` inline : une fonction redefinie a chaque rendu casserait les deps.
    listRef.current
      ?.querySelector(`#${CSS.escape(`${listId}-${activeOption.id}`)}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeOption, listId]);

  const choose = (subject: Subject) => {
    onSelect(subject);
    setQuery(subject.name);
    setOpen(false);
    setActiveIndex(-1);
  };

  const moveActive = (delta: number) => {
    if (suggestions.length === 0) return;
    setActiveIndex((current) => {
      const next = current + delta;
      if (next < 0) return suggestions.length - 1;
      if (next >= suggestions.length) return 0;
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="subject-search" className="font-medium">
        Matière *
      </label>
      <div className="relative">
        <div
          className={`rounded-control flex items-center border px-3 py-2 ${error ? "border-error" : "border-border-control"}`}
        >
          <input
            id="subject-search"
            type="search"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              open && activeOption ? optionId(activeOption) : undefined
            }
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "subjectId-error" : "subject-hint"}
            autoComplete="off"
            value={inputValue}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActiveIndex(-1);
              if (subjectId) onSelect(null);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setOpen(true);
                moveActive(1);
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setOpen(true);
                moveActive(-1);
              }
              if (event.key === "Enter" && open) {
                event.preventDefault();
                // Valide la suggestion mise en avant par les flèches, pas forcement la première
                // (#173) ; sans navigation prealable, retombe sur la premiere comme avant.
                const target = activeOption ?? suggestions[0];
                if (target) choose(target);
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
            ref={listRef}
            id={listId}
            role="listbox"
            className="bg-background-primary rounded-control border-border-default shadow-elevated absolute z-10 mt-1 max-h-72 w-full overflow-y-auto border py-1"
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
              suggestions.map((subject, index) => (
                <li
                  key={subject.id}
                  id={optionId(subject)}
                  role="option"
                  // `aria-selected` marque l'option active au clavier (pattern combobox ARIA),
                  // pas forcement la matiere deja choisie (revue de code, #173, apres coup) :
                  // cette derniere garde juste un style distinct ci-dessous.
                  aria-selected={index === activeIndex}
                  // mousedown plutot que click : passe avant le blur qui ferme la liste.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    choose(subject);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm ${subject.id === subjectId ? "font-semibold" : ""} ${index === activeIndex ? "bg-background-default" : "hover:bg-background-default"}`}
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
        <p id="subjectId-error" className="text-error mb-0 text-sm">
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
