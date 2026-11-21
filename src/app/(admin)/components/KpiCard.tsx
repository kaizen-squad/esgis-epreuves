import type { IconType } from "react-icons";

/** Indicateur du tableau de bord : libelle, valeur et precision. */
export default function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: IconType;
}) {
  return (
    <div className="bg-background-primary flex items-start justify-between gap-4 rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="min-w-0">
        <p className="text-text-paragraph mb-2 text-sm font-medium">{label}</p>
        <p className="text-text-secondary mb-1 text-3xl font-semibold tabular-nums">
          {value.toLocaleString("fr-FR")}
        </p>
        <p className="text-text-paragraph mb-0 text-xs">{hint}</p>
      </div>
      <span className="bg-background-default text-background-accent flex size-11 shrink-0 items-center justify-center rounded-lg">
        <Icon size={20} />
      </span>
    </div>
  );
}
