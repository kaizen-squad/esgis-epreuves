import Link from "next/link";
import { fieldDisplayName } from "@/components/fields/fieldLabel";
import { catalogueHref, type SpaceBasePath } from "@/components/layout/spaces";
import { coteSubject } from "@/components/exams/examCote";

export type CoteProps = {
  field: string;
  fieldId: string;
  level: string;
  levelId: string;
  subject: string;
  subjectId: string;
  academicYear: string;
  /** Espace courant (public ou BDE) : garde chaque segment dans le bon catalogue. */
  basePath: SpaceBasePath;
  className?: string;
};

/**
 * Cote d'une épreuve (R-03), dans l'esprit d'une fiche d'archive : chaque segment est un lien
 * vers le catalogue filtré sur ce seul critère. Le type d'épreuve n'est pas un segment, faute de
 * filtre dédié dans le catalogue a lui seul.
 */
export default function Cote({
  field,
  fieldId,
  level,
  levelId,
  subject,
  subjectId,
  academicYear,
  basePath,
  className,
}: CoteProps) {
  const base = catalogueHref(basePath);
  const segments = [
    {
      label: "Filière",
      name: fieldDisplayName(field),
      href: `${base}?fieldId=${encodeURIComponent(fieldId)}`,
    },
    {
      label: "Niveau",
      name: level,
      href: `${base}?levelId=${encodeURIComponent(levelId)}`,
    },
    {
      label: "Matière",
      name: coteSubject(subject),
      href: `${base}?subjectId=${encodeURIComponent(subjectId)}`,
    },
    {
      label: "Année académique",
      name: academicYear,
      href: `${base}?academicYear=${encodeURIComponent(academicYear)}`,
    },
  ];

  return (
    <ol
      aria-label="Cote de l'épreuve"
      className={`flex flex-wrap items-center gap-1 ${className ?? ""}`}
    >
      {segments.map((segment, index) => (
        <li key={segment.label} className="flex items-center gap-1">
          {index > 0 ? <span aria-hidden="true">:</span> : null}
          <Link
            href={segment.href}
            aria-label={`${segment.label} : ${segment.name}`}
            className="hover:underline focus-visible:underline"
          >
            {segment.name}
          </Link>
        </li>
      ))}
    </ol>
  );
}
