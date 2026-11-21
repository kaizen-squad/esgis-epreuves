/** Message d'erreur sous un champ, relie au champ par `aria-describedby="<name>-error"`. */
export default function FieldError({
  name,
  error,
}: {
  name: string;
  error?: string;
}) {
  if (!error) return null;
  return (
    <p id={`${name}-error`} className="mb-0 text-sm text-red-600">
      {error}
    </p>
  );
}
