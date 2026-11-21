import { CgSpinner } from "react-icons/cg";

/** Etape d'attente pendant l'enregistrement du lot (verification, insertion, depot du fichier). */
export default function AddExamSaving({ fileCount }: { fileCount: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-background-default flex flex-col items-center gap-4 rounded-lg px-6 py-16 text-center"
    >
      <CgSpinner className="text-background-accent animate-spin" size={48} />
      <h3 className="text-text-secondary text-xl font-semibold">
        Publication en cours…
      </h3>
      <p className="text-text-paragraph mb-0">
        {fileCount > 1
          ? `Vos ${fileCount} fichiers sont vérifiés puis enregistrés.`
          : "Votre fichier est vérifié puis enregistré."}{" "}
        Ne quittez pas cette page.
      </p>
    </div>
  );
}
