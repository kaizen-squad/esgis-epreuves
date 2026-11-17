import { notFound } from "next/navigation";
import {
  getFieldExams,
  getFieldLevelOptionNames,
} from "@/features/exams/queries";
import { getLevelById } from "@/features/referentials/queries";
import Research from "../../accueil/components/Research";
import ImageHandler from "../../components/ImageHandler";
import FiliereCatalogueSection from "../components/FiliereCatalogueSection";
import PublicLayout from "../../components/PublicLayout";
import CTACatalogue from "../../accueil/components/CTACatalogue";
import { toEpreuveCardProps } from "../../accueil/components/toEpreuveCardProps";
import { fieldPageTitle } from "../../utils/fieldLabel";

type FilierePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ levelId?: string | string[] }>;
};

export default async function FilierePage({
  params,
  searchParams,
}: FilierePageProps) {
  const { id } = await params;
  const { levelId: rawLevelId } = await searchParams;
  const levelId = typeof rawLevelId === "string" ? rawLevelId : undefined;

  const [result, level] = await Promise.all([
    getFieldExams(id, { levelId }),
    levelId ? getLevelById(levelId) : null,
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
    <PublicLayout>
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
      />
      <CTACatalogue />
    </PublicLayout>
  );
}
