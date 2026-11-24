import { useEffect } from "react";
import { CgSpinner } from "react-icons/cg";

/** Etape d'attente pendant l'enregistrement (verification, ecriture en base, depot du fichier). */
export default function ExamFormSaving({
  title,
  description,
  entries,
}: {
  title: string;
  description: string;
  /**
   * Noms des fichiers du lot en cours d'envoi (#172) : chacun a sa propre ligne, faute d'une
   * vraie progression en octets que l'action serveur ne remonte pas.
   * ponytail: indication par fichier, pas un pourcentage reel ; a revoir si l'upload passe par
   * une URL presignee avec suivi XHR.
   */
  entries?: string[];
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
      {entries && entries.length > 1 ? (
        <ul className="mt-2 flex w-full max-w-sm flex-col gap-1.5 text-left">
          {entries.map((name) => (
            <li
              key={name}
              className="bg-background-primary flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
            >
              <CgSpinner
                className="text-background-accent shrink-0 animate-spin"
                size={14}
              />
              <span className="truncate">{name}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
