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
        className={`bg-background-default flex rounded p-1 ${error ? "ring-1 ring-red-400" : ""}`}
      >
        {choices.map((choice) => (
          <label
            key={choice.value}
            className="has-checked:bg-background-accent has-checked:text-text-primary has-focus-visible:ring-background-accent flex min-w-0 flex-1 cursor-pointer rounded p-1 py-3 text-center has-focus-visible:ring-2"
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
        <p id={errorId} className="mb-0 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
