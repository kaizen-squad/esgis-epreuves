import { notFound } from "next/navigation";
import {
  getAcademicYears,
  getFieldExams,
  getFieldLevelOptionNames,
  getSubjectCoverage,
} from "@/features/exams/queries";
import {
  getLevelById,
  getLevels,
  getOptions,
  getSubjects,
} from "@/features/referentials/queries";
import {
  toExamFilters,
  type CatalogueSearchParams,
} from "@/components/exams/catalogueFilters";
import Research from "@/components/exams/Research";
import { toExamCardProps } from "@/components/exams/toExamCardProps";
import FieldBreadcrumb from "@/components/fields/FieldBreadcrumb";
import { fieldPageTitle } from "@/components/fields/fieldLabel";
import FiliereCatalogueSection from "@/components/fields/FiliereCatalogueSection";
import CTACatalogue from "@/components/home/CTACatalogue";
import { catalogueHref, type SpaceBasePath } from "@/components/layout/spaces";
import ImageHandler from "@/components/ui/ImageHandler";

/**
 * Page d'une filiere (#53), utilisee par l'espace public (le pendant BDE affiche
 * `FieldCoverageMatrix`, pas ce composant). `basePath` garde la recherche, le catalogue cible et
 * le registre (tu/vous) coherents avec l'espace appelant.
 */
export default async function FieldExamsView({
  fieldId,
  searchParams,
  basePath,
}: {
  fieldId: string;
  searchParams: CatalogueSearchParams;
  basePath: SpaceBasePath;
}) {
  const filters = toExamFilters(searchParams);
  const levelId = filters.levelId;

  const [result, level, levels, subjects, options, coverage] =
    await Promise.all([
      getFieldExams(fieldId, filters),
      levelId ? getLevelById(levelId) : null,
      getLevels(),
      getSubjects(),
      getOptions(),
      getSubjectCoverage(fieldId),
    ]);
  if (!result) notFound();

  // #147 : nombre d'epreuves par matiere dans le filtre, deduit de la couverture deja calculee
  // pour cette filiere (getSubjectCoverage), sans nouvelle requete.
  const examCountsBySubjectId = Object.fromEntries(
    coverage.map((entry) => [entry.subjectId, entry.examCount]),
  );

  const [optionNames, academicYears] = await Promise.all([
    level ? getFieldLevelOptionNames(result.field.id, level.id) : [],
    getAcademicYears(result.field.id),
  ]);
  const title = fieldPageTitle(
    result.field.name,
    result.field.shortName,
    level?.name ?? null,
    optionNames,
  );
  const spaceCatalogue = catalogueHref(basePath);
  const contextualCatalogueHref = `${spaceCatalogue}?fieldId=${result.field.id}`;

  return (
    <>
      <div>
        <FieldBreadcrumb
          fieldName={result.field.name}
          fieldShortName={result.field.shortName}
          basePath={basePath}
        />
        <h1 className="head-title text-center">Épreuves : {title}</h1>
        <p className="mb-6 text-center">
          Recherche rapidement un sujet spécifique et télécharge le fichier en
          un instant. Notre interface fluide simplifie tes révisions avant
          l&apos;examen.
        </p>
        <Research catalogueHref={contextualCatalogueHref} />
      </div>
      <ImageHandler
        className="md:hidden"
        image_url="/images/accueil_span_page.jpeg"
        image_alt="Image d'en-tête de la filière"
        image_className="object-cover object-top"
      />
      <FiliereCatalogueSection
        levels={levels}
        exams={result.exams.exams.map(toExamCardProps)}
        total={result.exams.total}
        page={result.exams.page}
        pageSize={result.exams.pageSize}
        filterOptions={{
          // Filiere fixee par la page : pas de filtre filiere, matieres de cette filiere seulement.
          fields: null,
          levels,
          subjects: subjects.filter(
            (subject) => subject.fieldId === result.field.id,
          ),
          options: options.filter(
            (option) => option.fieldId === result.field.id,
          ),
          academicYears,
          examCountsBySubjectId,
        }}
      />
      <CTACatalogue catalogueHref={spaceCatalogue} />
    </>
  );
}
