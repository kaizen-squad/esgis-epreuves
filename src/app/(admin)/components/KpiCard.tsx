import type { IconType } from "react-icons";

const TONE_CLASS = {
  accent: "bg-background-default text-background-accent",
  positive: "bg-green-50 text-green-600",
  negative: "bg-red-50 text-red-600",
} as const;

/** Indicateur de la page Membres : libelle, valeur et precision. */
export default function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "accent",
}: {
  label: string;
  value: number;
  hint: string;
  icon: IconType;
  /** Couleur du badge d'icone, pour distinguer deux KPI opposes (ex. actifs/desactives). */
  tone?: keyof typeof TONE_CLASS;
}) {
  return (
    <div className="bg-background-primary rounded-card shadow-card flex items-start justify-between gap-4 border border-gray-200 p-5">
      <div className="min-w-0">
        <p className="text-text-paragraph mb-2 text-sm font-medium">{label}</p>
        <p className="text-text-secondary mb-1 text-3xl font-semibold tabular-nums">
          {value.toLocaleString("fr-FR")}
        </p>
        <p className="text-text-paragraph mb-0 text-xs">{hint}</p>
      </div>
      <span
        className={`rounded-control flex size-11 shrink-0 items-center justify-center ${TONE_CLASS[tone]}`}
      >
        <Icon size={20} />
      </span>
    </div>
  );
}
