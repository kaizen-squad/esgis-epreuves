import { FiCheck, FiX } from "react-icons/fi";

export type ExamFormStep = "form" | "saving" | "result";
export type ExamFormOutcome = "success" | "failure";

const STEPS: { id: ExamFormStep; label: string }[] = [
  { id: "form", label: "Informations" },
  { id: "saving", label: "Enregistrement" },
  { id: "result", label: "Résultat" },
];

/**
 * Ligne de suivi en haut du formulaire d'ajout : chaque etape atteinte est marquee, la ligne entre
 * deux etapes se remplit quand la suivante est atteinte. La derniere etape prend la couleur du
 * resultat (succes ou echec).
 */
export default function ExamFormStepper({
  current,
  outcome,
}: {
  current: ExamFormStep;
  outcome?: ExamFormOutcome;
}) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <ol className="mb-10 flex items-start" aria-label="Progression de l'ajout">
      {STEPS.map((step, index) => {
        const reached = index <= currentIndex;
        const done = index < currentIndex;
        const isLast = index === STEPS.length - 1;
        const failed = isLast && reached && outcome === "failure";
        const succeeded = isLast && reached && outcome === "success";

        const circleClass = failed
          ? "border-red-600 bg-red-600 text-white"
          : succeeded
            ? "border-green-600 bg-green-600 text-white"
            : reached
              ? "border-background-accent bg-background-accent text-text-primary"
              : "border-gray-300 bg-background-primary text-text-paragraph";

        return (
          <li
            key={step.id}
            className={`flex items-start ${isLast ? "" : "flex-1"}`}
            aria-current={index === currentIndex ? "step" : undefined}
          >
            <div className="flex w-24 flex-col items-center gap-2 text-center">
              <span
                className={`flex size-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${circleClass}`}
              >
                {done || succeeded ? (
                  <FiCheck size={18} />
                ) : failed ? (
                  <FiX size={18} />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={`text-sm ${reached ? "text-text-secondary font-medium" : "text-text-paragraph"}`}
              >
                {step.label}
              </span>
            </div>
            {isLast ? null : (
              <div className="mt-4 h-0.5 flex-1 overflow-hidden rounded bg-gray-300">
                <div
                  className={`bg-background-accent h-full transition-all duration-500 ${done ? "w-full" : "w-0"}`}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
