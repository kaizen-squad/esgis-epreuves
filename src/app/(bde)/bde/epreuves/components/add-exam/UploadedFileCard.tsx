import { FiAlertCircle, FiFileText, FiX } from "react-icons/fi";
import { formatFileSize, validateExamFile } from "./addExamForm";

/** Fichier ajoute au lot : nom, taille, erreur eventuelle et bouton pour le retirer. */
export default function UploadedFileCard({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const error = validateExamFile(file);

  return (
    <li
      className={`bg-background-primary flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left ${error ? "border-red-300" : "border-gray-200"}`}
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-md ${error ? "bg-red-50 text-red-600" : "bg-background-default text-background-accent"}`}
      >
        {error ? <FiAlertCircle size={18} /> : <FiFileText size={18} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-text-default mb-0 truncate text-sm font-medium">
          {file.name}
        </p>
        <p
          className={`mb-0 text-xs ${error ? "text-red-600" : "text-text-paragraph"}`}
        >
          {error ?? formatFileSize(file.size)}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Retirer ${file.name}`}
        className="text-text-paragraph cursor-pointer rounded p-1 hover:bg-gray-100"
      >
        <FiX size={18} />
      </button>
    </li>
  );
}
