type Choice = { label: string; value: string };

/**
 * Choix exclusif en radios, presente comme `SegmentedFilter` (session, type d'evaluation des
 * filtres du catalogue) : l'option cochee prend le fond accent.
 */
export default function ChoiceGroup({
  name,
  legend,
  choices,
  value,
  onChange,
  error,
}: {
  name: string;
  legend: string;
  choices: Choice[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const errorId = `${name}-error`;

  return (
    <fieldset
      className="flex flex-col gap-1"
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="mb-1 font-medium">{legend}</legend>
      <div
        className={`bg-background-default rounded-control flex gap-3 p-2 ${error ? "ring-error ring-1" : ""}`}
      >
        {choices.map((choice) => (
          <label
            key={choice.value}
            className="bg-background-primary has-checked:border-background-accent has-checked:bg-background-accent has-checked:text-text-primary has-focus-visible:ring-background-accent shadow-card border-border-default hover:border-muted/50 rounded-control flex min-w-0 flex-1 cursor-pointer border p-1 py-3 text-center transition-colors has-focus-visible:ring-2"
          >
            <input
              type="radio"
              name={name}
              value={choice.value}
              checked={value === choice.value}
              onChange={() => onChange(choice.value)}
              className="sr-only"
            />
            <span className="w-full truncate text-sm">{choice.label}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={errorId} className="text-error mb-0 text-sm">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
