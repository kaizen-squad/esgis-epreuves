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

  return (
    <ol
      aria-label="Cote de l'épreuve"
      className={`flex flex-wrap items-center gap-1 ${className ?? ""}`}
    >
      {coteSegments(fields).map((segment, index) => {
        const param = LINK_PARAM[segment.key];
        const id = ids[segment.key];
        const href =
          param && id ? `${base}?${param}=${encodeURIComponent(id)}` : null;

        return (
          <li key={segment.key} className="flex min-w-0 items-center gap-1">
            {index > 0 ? <span aria-hidden="true">:</span> : null}
            {href ? (
              <Link
                href={href}
                aria-label={`${segment.name} (${segment.label})`}
                className="truncate hover:underline focus-visible:underline"
              >
                {segment.name}
              </Link>
            ) : (
              <span className="truncate">{segment.name}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
