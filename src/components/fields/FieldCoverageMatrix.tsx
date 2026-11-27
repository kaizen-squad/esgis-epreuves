import Link from "next/link";
import { FiCheckCircle } from "react-icons/fi";
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
        <h2 className="text-text-secondary text-xl font-semibold">{heading}</h2>
        <p className="text-text-paragraph text-sm">
          Aucune matière active pour cette filière.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-text-secondary text-xl font-semibold">{heading}</h2>
        {gaps === 0 ? (
          <p className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
            <FiCheckCircle size={16} /> Tout est couvert
          </p>
        ) : (
          <p className="text-text-paragraph text-sm">
            {gaps} matière{gaps > 1 ? "s" : ""} sans épreuve
          </p>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {levels.map((level) => (
          <div
            key={level.levelName}
            className="rounded-card border border-gray-200 p-4"
          >
            <p className="text-text-secondary mb-2 font-semibold">
              {level.levelName}
            </p>
            <ul className="flex flex-col gap-1.5">
              {level.subjects.map((subject) => {
                const isGap = subject.examCount === 0;
                // Une lacune ouvre l'ajout prerempli ; sinon on pointe vers les epreuves
                // existantes de cette matiere (#174). Bleu plutot que rouge : une tache a faire,
                // pas une erreur.
                const href = isGap
                  ? `/bde/epreuves/ajouter?fieldId=${fieldId}&levelId=${subject.levelId}&subjectId=${subject.subjectId}`
                  : `/bde/catalogue?subjectId=${subject.subjectId}`;
                return (
                  <li key={subject.subjectId}>
                    {/* Pas de `title` : le texte du lien porte deja le nom complet (la
                        troncature est seulement visuelle, via `truncate`), un `title`
                        identique se serait fait lire deux fois par un lecteur d'ecran. */}
                    <Link
                      href={href}
                      className={`rounded-control flex items-center justify-between gap-2 px-2 py-1 text-sm hover:underline ${
                        isGap ? "bg-blue-50 text-blue-700" : "text-text-default"
                      }`}
                    >
                      <span className="truncate">{subject.subjectName}</span>
                      <span className="shrink-0 font-medium">
                        {isGap ? "Aucune épreuve" : subject.examCount}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
