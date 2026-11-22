import Link from "next/link";
import { fieldDisplayName } from "@/components/fields/fieldLabel";
import { filieresHref, type SpaceBasePath } from "@/components/layout/spaces";

/** Fil d'Ariane de la page d'une filiere (R-14), dans l'esprit d'une cote d'archive. */
export default function FieldBreadcrumb({
  fieldName,
  basePath,
}: {
  fieldName: string;
  basePath: SpaceBasePath;
}) {
  return (
    <ol
      aria-label="Fil d'Ariane"
      className="text-text-paragraph mb-3 flex items-center gap-1 text-sm"
    >
      <li className="flex items-center gap-1">
        <Link href={filieresHref(basePath)} className="hover:underline">
          Filières
        </Link>
      </li>
      <li className="flex items-center gap-1">
        <span aria-hidden="true">:</span>
        <span className="text-text-default font-medium">
          {fieldDisplayName(fieldName)}
        </span>
      </li>
    </ol>
  );
}
