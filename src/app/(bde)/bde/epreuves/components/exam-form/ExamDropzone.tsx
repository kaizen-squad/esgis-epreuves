"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";
import { FiCloud } from "react-icons/fi";
import { ACCEPTED_FILE_TYPES } from "./examForm";
import FieldError from "./FieldError";

/**
 * Zone de depot de PDF : glisser-deposer, ou clic sur « Importez » qui ouvre l'input fichier
 * cache. Les fichiers choisis sont remontes via `onFiles` ; leurs cartes s'affichent dans la zone
 * (`children`).
 */
export default function ExamDropzone({
  multiple = false,
  hint,
  error,
  errorName,
  onFiles,
  children,
}: {
  multiple?: boolean;
  /** Limites affichees sous l'invite (nombre, taille). */
  hint: string;
  error?: string;
  /** Nom du champ pour l'id du message d'erreur. */
  errorName: string;
  onFiles: (files: File[]) => void;
  children?: ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const files = Array.from(list);
    onFiles(multiple ? files : files.slice(0, 1));
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    // Permet de re-selectionner le meme fichier apres l'avoir retire.
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        tabIndex={-1}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${errorName}-error` : undefined}
        className={`rounded-control flex flex-col items-center gap-2 border-2 border-dashed px-6 py-8 text-center transition-colors ${dragging ? "border-background-partial bg-background-partial/5" : error ? "border-error" : "bg-background-default border-border-control"}`}
      >
        {/* Toute l'invite (pas seulement le mot "Importez") est un vrai bouton, entierement
            cliquable et focusable (#172) ; l'etat invalide reste porte par le conteneur (role
            implicite d'un bouton non compatible avec aria-invalid). */}
        <button
          type="button"
          onClick={openPicker}
          className="rounded-control flex w-full cursor-pointer flex-col items-center gap-2 outline-none focus-visible:underline"
        >
          <FiCloud size={28} className="text-background-accent" />
          <span>
            {/* Le glisser-deposer n'existe pas au toucher : l'invite correspondante est masquee
                sur mobile, seule l'action "Importez" y reste pertinente (#172). */}
            <span className="hidden sm:inline">
              {multiple
                ? "Glissez vos fichiers ici ou "
                : "Glissez votre fichier ici ou "}
            </span>
            <span className="text-background-accent font-semibold underline">
              {multiple ? "Importez vos fichiers" : "Importez votre fichier"}
            </span>
          </span>
          <span className="text-text-paragraph text-sm">{hint}</span>
        </button>
        <FieldError name={errorName} error={error} />

        {children}
      </div>
      <p className="text-text-paragraph mb-0 text-sm">
        Seul le format PDF est supporté.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        multiple={multiple}
        onChange={handleInput}
        className="hidden"
      />
    </>
  );
}
