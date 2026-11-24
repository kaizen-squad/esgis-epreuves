import { useEffect } from "react";
import { CgSpinner } from "react-icons/cg";

/** Etape d'attente pendant l'enregistrement (verification, ecriture en base, depot du fichier). */
export default function ExamFormSaving({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  // "Ne quittez pas cette page" (texte ci-dessous) n'etait protege par rien (#171) : un vrai
  // `beforeunload` empeche une fermeture/rechargement accidentel pendant l'enregistrement.
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

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
