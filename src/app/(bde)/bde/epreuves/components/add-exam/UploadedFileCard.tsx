import { FiAlertCircle, FiFileText, FiX } from "react-icons/fi";
import {
  academicYears,
  formatFileSize,
  validateExamFile,
  type AddExamFileErrors,
} from "./addExamForm";

export type FileEntry = {
  /** Cle stable de la carte (le fichier peut etre retire, l'index change). */
  key: string;
  file: File;
  title: string;
  academicYear: string;
};

const INPUT_CLASS =
  "w-full rounded-lg border bg-background-primary px-3 py-2 text-sm outline-none focus:border-background-accent";

/**
 * Fichier ajoute au lot : nom, taille, erreur eventuelle, bouton pour le retirer, et les deux
 * metadonnees propres a chaque fichier (titre, annee academique). Les champs portent les noms
 * attendus par `uploadExamsBatch`, repetes une fois par carte dans l'ordre du lot.
 */
export default function UploadedFileCard({
  entry,
  index,
  errors,
  onChange,
  onRemove,
}: {
  entry: FileEntry;
  index: number;
  errors?: AddExamFileErrors[number];
  onChange: (patch: Partial<Pick<FileEntry, "title" | "academicYear">>) => void;
  onRemove: () => void;
}) {
  const fileError = validateExamFile(entry.file) ?? errors?.file;
  const titleId = `file-${entry.key}-title`;
  const yearId = `file-${entry.key}-year`;

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
            {index + 1}. {entry.file.name}
          </p>
          <p
            className={`mb-0 text-xs ${fileError ? "text-red-600" : "text-text-paragraph"}`}
          >
            {fileError ?? formatFileSize(entry.file.size)}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Retirer ${entry.file.name}`}
          className="text-text-paragraph cursor-pointer rounded p-1 hover:bg-gray-100"
        >
          <FiX size={18} />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_11rem]">
        <div className="flex flex-col gap-1">
          <label htmlFor={titleId} className="text-sm font-medium">
            Titre *
          </label>
          <input
            id={titleId}
            name="title"
            type="text"
            value={entry.title}
            onChange={(event) => onChange({ title: event.target.value })}
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
            value={entry.academicYear}
            onChange={(event) => onChange({ academicYear: event.target.value })}
            aria-invalid={errors?.academicYear ? true : undefined}
            aria-describedby={
              errors?.academicYear ? `${yearId}-error` : undefined
            }
            className={`${INPUT_CLASS} ${errors?.academicYear ? "border-red-400" : "border-gray-300"}`}
          >
            <option value="" disabled>
              Choisir une année
            </option>
            {academicYears().map((year) => (
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
    </li>
  );
}
