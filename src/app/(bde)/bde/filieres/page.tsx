import { requireBdeSession } from "@/app/(bde)/lib/requireBdeSession";
import { getFields } from "@/features/referentials/queries";
import FieldCoverageMatrix from "@/components/fields/FieldCoverageMatrix";

const BDEFilieresPage = async () => {
  await requireBdeSession();
  const fields = await getFields();

  return (
    <div className="mx-auto mb-16 max-w-7xl px-6">
      <div className="mb-8 text-center">
        <h1 className="head-title">Lacunes du fonds</h1>
        <p className="text-text-paragraph">
          Les matières sans épreuve archivée, filière par filière.
        </p>
      </div>

      {fields.length === 0 ? (
        <p className="text-text-paragraph text-center">
          Aucune filière n&apos;a encore été ajoutée.
        </p>
      ) : (
        fields.map((field) => (
          <FieldCoverageMatrix
            key={field.id}
            fieldId={field.id}
            fieldName={field.name}
          />
        ))
      )}
    </div>
  );
};

export default BDEFilieresPage;
