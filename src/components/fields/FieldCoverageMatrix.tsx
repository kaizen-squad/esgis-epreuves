import Link from "next/link";
import { getSubjectCoverage } from "@/features/exams/queries";

/** Groupe la couverture par niveau (trie par nom de niveau, puis de matiere dans chaque groupe). */
function groupByLevel(
  coverage: Awaited<ReturnType<typeof getSubjectCoverage>>,
) {
  const levels = new Map<
    string,
    { levelName: string; subjects: typeof coverage }
  >();
  for (const entry of coverage) {
    const level = levels.get(entry.levelId) ?? {
      levelName: entry.levelName,
      subjects: [],
    };
    level.subjects.push(entry);
    levels.set(entry.levelId, level);
  }
  return [...levels.values()].sort((a, b) =>
    a.levelName.localeCompare(b.levelName),
  );
}

/**
 * Matrice niveau x matiere d'une filiere (R-16) : les matieres sans epreuve archivee sont mises
 * en evidence, pour qu'un membre BDE sache quoi deposer en priorite.
 */
export default async function FieldCoverageMatrix({
  fieldId,
  fieldName,
  /** Vue d'ensemble (toutes filieres) : lien vers la matrice de cette filiere seule. Absent sur sa propre page. */
  href,
}: {
  fieldId: string;
  fieldName: string;
  href?: string;
}) {
  const coverage = await getSubjectCoverage(fieldId);
  const levels = groupByLevel(coverage);
  const gaps = coverage.filter((entry) => entry.examCount === 0).length;
  const heading = href ? (
    <Link href={href} className="hover:underline">
      {fieldName}
    </Link>
  ) : (
    fieldName
  );

  if (coverage.length === 0) {
    return (
      <div className="mb-10">
        <h3 className="text-text-secondary text-xl font-semibold">{heading}</h3>
        <p className="text-text-paragraph text-sm">
          Aucune matière active pour cette filière.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-text-secondary text-xl font-semibold">{heading}</h3>
        <p className="text-text-paragraph text-sm">
          {gaps === 0
            ? "Fonds complet"
            : `${gaps} matière${gaps > 1 ? "s" : ""} sans épreuve`}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {levels.map((level) => (
          <div
            key={level.levelName}
            className="rounded-xl border border-gray-200 p-4"
          >
            <p className="text-text-secondary mb-2 font-semibold">
              {level.levelName}
            </p>
            <ul className="flex flex-col gap-1.5">
              {level.subjects.map((subject) => (
                <li
                  key={subject.subjectId}
                  className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-sm ${
                    subject.examCount === 0
                      ? "bg-red-50 text-red-700"
                      : "text-text-default"
                  }`}
                >
                  <span className="truncate">{subject.subjectName}</span>
                  <span className="shrink-0 font-medium">
                    {subject.examCount === 0
                      ? "Aucune épreuve"
                      : subject.examCount}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
