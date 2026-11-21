import { CgSpinner } from "react-icons/cg";

/** Etape d'attente pendant l'enregistrement (verification, ecriture en base, depot du fichier). */
export default function ExamFormSaving({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-background-default flex flex-col items-center gap-4 rounded-lg px-6 py-16 text-center"
    >
      <CgSpinner className="text-background-accent animate-spin" size={48} />
      <h3 className="text-text-secondary text-xl font-semibold">{title}</h3>
      <p className="text-text-paragraph mb-0">
        {description} Ne quittez pas cette page.
      </p>
    </div>
  );
}
