import type { ReactNode } from "react";
import { FiAlertCircle, FiFileText } from "react-icons/fi";
import { academicYears } from "./examForm";

const INPUT_CLASS =
  "w-full rounded-lg border bg-background-primary px-3 py-2 text-sm outline-none focus:border-background-accent";

type CardValues = { title: string; academicYear: string };

/**
 * Carte d'un fichier d'epreuve : nom, detail (taille ou erreur), actions, et les deux metadonnees
 * propres a chaque fichier (titre, annee academique), nommees `title` et `academicYear` comme
 * l'attendent `uploadExamsBatch` (une valeur par carte, dans l'ordre du lot) et `updateExamMetadata`.
 */
export default function ExamFileCard({
  idPrefix,
  name,
  detail,
  fileError,
  values,
  errors,
  onChange,
  actions,
}: {
  /** Prefixe unique des id des champs de la carte. */
  idPrefix: string;
  name: string;
  detail: string;
  fileError?: string | null;
  /** Sans `values`, la carte n'affiche que le fichier (ex. remplacement du PDF). */
  values?: CardValues;
  errors?: Partial<Record<keyof CardValues, string>>;
  onChange?: (patch: Partial<CardValues>) => void;
  actions?: ReactNode;
}) {
  const titleId = `${idPrefix}-title`;
  const yearId = `${idPrefix}-year`;
  // L'annee enregistree reste proposee meme si elle sort de la plage du select.
  const years = academicYears();
  if (values?.academicYear && !years.includes(values.academicYear)) {
    years.push(values.academicYear);
  }

  return (
    <li
      className={`bg-background-primary flex w-full flex-col gap-3 rounded-lg border p-3 text-left ${fileError ? "border-red-300" : "border-gray-200"}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-md ${fileError ? "bg-red-50 text-red-600" : "bg-background-default text-background-accent"}`}
        >
          {fileError ? <FiAlertCircle size={18} /> : <FiFileText size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-text-default mb-0 truncate text-sm font-medium">
            {name}
          </p>
          <p
            className={`mb-0 text-xs ${fileError ? "text-red-600" : "text-text-paragraph"}`}
          >
            {fileError ?? detail}
          </p>
        </div>
        {actions}
      </div>

      {values ? (
        <div className="grid gap-3 sm:grid-cols-[1fr_11rem]">
          <div className="flex flex-col gap-1">
            <label htmlFor={titleId} className="text-sm font-medium">
              Titre *
            </label>
            <input
              id={titleId}
              name="title"
              type="text"
              value={values.title}
              onChange={(event) => onChange?.({ title: event.target.value })}
              placeholder="Devoir d'Algorithmique avancée"
              aria-invalid={errors?.title ? true : undefined}
              aria-describedby={errors?.title ? `${titleId}-error` : undefined}
              className={`${INPUT_CLASS} ${errors?.title ? "border-red-400" : "border-gray-300"}`}
            />
            {errors?.title ? (
              <p id={`${titleId}-error`} className="mb-0 text-xs text-red-600">
                {errors.title}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor={yearId} className="text-sm font-medium">
              Année académique *
            </label>
            <select
              id={yearId}
              name="academicYear"
              value={values.academicYear}
              onChange={(event) =>
                onChange?.({ academicYear: event.target.value })
              }
              aria-invalid={errors?.academicYear ? true : undefined}
              aria-describedby={
                errors?.academicYear ? `${yearId}-error` : undefined
              }
              className={`${INPUT_CLASS} ${errors?.academicYear ? "border-red-400" : "border-gray-300"}`}
            >
              <option value="" disabled>
                Choisir une année
              </option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {errors?.academicYear ? (
              <p id={`${yearId}-error`} className="mb-0 text-xs text-red-600">
                {errors.academicYear}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}
