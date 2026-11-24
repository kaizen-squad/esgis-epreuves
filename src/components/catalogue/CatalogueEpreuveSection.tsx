import { getAcademicYears, getExams } from "@/features/exams/queries";
import {
  getFields,
  getLevels,
  getSubjects,
} from "@/features/referentials/queries";
import CatalogueEpreuves from "@/components/catalogue/CatalogueEpreuve";
import { toExamCardProps } from "@/components/exams/toExamCardProps";
import {
  toExamFilters,
  type CatalogueSearchParams,
} from "@/components/exams/catalogueFilters";

const CatalogueEpreuveSection = async ({
  searchParams,
  manageable = false,
  forcedCreatedBy,
}: {
  searchParams: CatalogueSearchParams;
  /** Espace BDE : cartes avec menu de gestion. */
  manageable?: boolean;
  /**
   * Deposant impose cote serveur, jamais lu depuis `searchParams` (#174, "Mes versements") :
   * contrairement aux autres filtres, celui-ci ne doit jamais dependre de l'URL.
   */
  forcedCreatedBy?: string;
}) => {
  const [result, fields, levels, subjects, academicYears] = await Promise.all([
    getExams({ ...toExamFilters(searchParams), createdBy: forcedCreatedBy }),
    getFields(),
    getLevels(),
    getSubjects(),
    getAcademicYears(),
  ]);

  return (
    <section className="mx-auto mb-20 w-full max-w-7xl px-4 lg:px-6">
      <CatalogueEpreuves
        data={result.exams.map(toExamCardProps)}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        filterOptions={{ fields, levels, subjects, academicYears }}
        manageable={manageable}
      />
    </section>
  );
};

export default CatalogueEpreuveSection;
