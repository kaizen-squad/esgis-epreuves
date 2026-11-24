import Link from "next/link";
import { catalogueHref, type SpaceBasePath } from "@/components/layout/spaces";
import {
  coteSegments,
  type CoteFields,
  type CoteSegmentKey,
} from "@/components/exams/examCote";

export type CoteProps = CoteFields & {
  fieldId: string;
  levelId: string;
  subjectId: string;
  /** Espace courant (public ou BDE) : garde chaque segment dans le bon catalogue. */
  basePath: SpaceBasePath;
  className?: string;
};

/** Parametre de filtre du catalogue pour les segments qui en ont un (pas l'option, pas le type). */
const LINK_PARAM: Partial<Record<CoteSegmentKey, string>> = {
  field: "fieldId",
  level: "levelId",
  subject: "subjectId",
  academicYear: "academicYear",
};

/**
 * Cote d'une épreuve (R-03), dans l'esprit d'une fiche d'archive : chaque segment qui a un
 * filtre dédié (filière, niveau, matière, année) est un lien vers le catalogue filtré sur ce
 * seul critère. L'option et le type d'épreuve s'affichent, mais sans filtre dédié a eux seuls.
 * Les segments et leur ordre suivent `coteSegments`, pour ne jamais diverger d'`examCote`.
 */
export default function Cote({
  fieldId,
  levelId,
  subjectId,
  basePath,
  className,
  ...fields
}: CoteProps) {
  const base = catalogueHref(basePath);
  const ids: Partial<Record<CoteSegmentKey, string>> = {
    field: fieldId,
    level: levelId,
    subject: subjectId,
    academicYear: fields.academicYear ?? undefined,
  };

  const segments = coteSegments(fields);

  return (
    <ol
      aria-label="Cote de l'épreuve"
      className={`flex flex-wrap items-center gap-1 ${className ?? ""}`}
    >
      {segments.map((segment, index) => {
        const param = LINK_PARAM[segment.key];
        const id = ids[segment.key];
        const href =
          param && id ? `${base}?${param}=${encodeURIComponent(id)}` : null;
        const isLast = index === segments.length - 1;

        return (
          // Le separateur suit son segment plutot que de precedeer le suivant (#179) : un
          // retour a la ligne ne laisse plus jamais un ":" seul en debut de ligne. Plus de
          // `truncate`/`min-w-0` par segment : un nom coupe ("SÉCU...") venait de la, le
          // flex-wrap du <ol> suffit a passer a la ligne entre segments.
          <li key={segment.key} className="flex items-center gap-1">
            {href ? (
              <Link
                href={href}
                aria-label={`${segment.name} (${segment.label})`}
                className="hover:underline focus-visible:underline"
              >
                {segment.name}
              </Link>
            ) : (
              <span>{segment.name}</span>
            )}
            {isLast ? null : <span aria-hidden="true">:</span>}
          </li>
        );
      })}
    </ol>
  );
}
