import { connection } from "next/server";
import { getFieldCategories } from "@/features/exams/queries";
import { toFiliereCardData } from "@/components/fields/fieldLabel";
import FiliereCategory from "./FiliereCategory";

const FIliereCategories = async () => {
  await connection();
  const categories = await getFieldCategories();

  if (categories.length === 0) {
    return (
      <div className="mx-auto mb-10 max-w-7xl px-6">
        <p className="text-text-paragraph text-center">
          Aucune filière n&apos;a encore été ajoutée.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-10 max-w-7xl px-6">
      {categories.map((category) => (
        <FiliereCategory
          key={category.fieldId}
          title={category.fieldName}
          cards={category.levels.map((summary) => ({
            key: summary.levelId,
            ...toFiliereCardData(summary),
          }))}
        />
      ))}
    </div>
  );
};

export default FIliereCategories;
