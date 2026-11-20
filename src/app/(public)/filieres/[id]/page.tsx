import { notFound } from "next/navigation";
import {
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
} from "../../utils/catalogueFilters";
import Research from "../../accueil/components/Research";
import ImageHandler from "../../components/ImageHandler";
import FiliereCatalogueSection from "../components/FiliereCatalogueSection";
import CTACatalogue from "../../accueil/components/CTACatalogue";
import { toEpreuveCardProps } from "../../accueil/components/toEpreuveCardProps";
import { fieldPageTitle } from "../../utils/fieldLabel";

type FilierePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<CatalogueSearchParams>;
};

export default async function FilierePage({
  params,
  searchParams,
}: FilierePageProps) {
  const { id } = await params;
  const filters = toExamFilters(await searchParams);
  const levelId = filters.levelId;

  const [result, level, levels, subjects] = await Promise.all([
    getFieldExams(id, filters),
    levelId ? getLevelById(levelId) : null,
    getLevels(),
    getSubjects(),
  ]);
  if (!result) notFound();

  const optionNames = level
    ? await getFieldLevelOptionNames(result.field.id, level.id)
    : [];
  const title = fieldPageTitle(
    result.field.name,
    level?.name ?? null,
    optionNames,
  );

  return (
    <>
      <div>
        <h1 className="head-title text-center">
          Découvrez les
          <br /> épreuves de la{" "}
          <span className="text-red-600 uppercase underline">{title}</span>
        </h1>
        <p className="text-center">
          Recherchez rapidement un sujet spécifique et téléchargez le fichier en
          un instant.
          <br />
          Notre interface fluide simplifie vos révisions avant l&apos;examen.
        </p>
        <Research />
      </div>
      <ImageHandler
        className="md:hidden"
        image_url="/images/accueil_span_page.jpeg"
        image_alt="Filière image en-tête"
        image_className="object-cover object-top"
      />
      <FiliereCatalogueSection
        exams={result.exams.exams.map(toEpreuveCardProps)}
        total={result.exams.total}
        filterOptions={{
          // Filiere fixee par la page : pas de filtre filiere, matieres de cette filiere seulement.
          fields: null,
          levels,
          subjects: subjects.filter(
            (subject) => subject.fieldId === result.field.id,
          ),
        }}
      />
      <CTACatalogue />
    </>
  );
}
