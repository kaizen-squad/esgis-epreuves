import { notFound } from "next/navigation";
import {
  getAcademicYears,
  getFieldExams,
  getFieldLevelOptionNames,
} from "@/features/exams/queries";
import {
  getLevelById,
  getLevels,
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
 * Page d'une filiere (#53), partagee par l'espace public et l'espace BDE : en-tete, recherche et
 * catalogue filtre sur la filiere. `basePath` garde la recherche et les liens dans l'espace ;
 * cote BDE (`"/bde"`), les cartes ont le menu de gestion.
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

  const [result, level, levels, subjects] = await Promise.all([
    getFieldExams(fieldId, filters),
    levelId ? getLevelById(levelId) : null,
    getLevels(),
    getSubjects(),
  ]);
  if (!result) notFound();

  const [optionNames, academicYears] = await Promise.all([
    level ? getFieldLevelOptionNames(result.field.id, level.id) : [],
    getAcademicYears(result.field.id),
  ]);
  const title = fieldPageTitle(
    result.field.name,
    level?.name ?? null,
    optionNames,
  );
  const spaceCatalogue = catalogueHref(basePath);
  const contextualCatalogueHref = `${spaceCatalogue}?fieldId=${result.field.id}`;

  return (
    <>
      <div>
        <FieldBreadcrumb fieldName={result.field.name} basePath={basePath} />
        <h1 className="head-title text-center">Épreuves : {title}</h1>
        <p className="mb-6 text-center">
          Recherchez rapidement un sujet spécifique et téléchargez le fichier en
          un instant. Notre interface fluide simplifie vos révisions avant
          l&apos;examen.
        </p>
        <Research catalogueHref={contextualCatalogueHref} />
      </div>
      <ImageHandler
        className="md:hidden"
        image_url="/images/accueil_span_page.jpeg"
        image_alt="Filière image en-tête"
        image_className="object-cover object-top"
      />
      <FiliereCatalogueSection
        levels={levels}
        exams={result.exams.exams.map(toExamCardProps)}
        total={result.exams.total}
        page={result.exams.page}
        pageSize={result.exams.pageSize}
        manageable={basePath === "/bde"}
        filterOptions={{
          // Filiere fixee par la page : pas de filtre filiere, matieres de cette filiere seulement.
          fields: null,
          levels,
          subjects: subjects.filter(
            (subject) => subject.fieldId === result.field.id,
          ),
          academicYears,
        }}
      />
      <CTACatalogue catalogueHref={spaceCatalogue} />
    </>
  );
}
