import FiliereCard, {
  type FiliereCardData,
} from "@/components/fields/FiliereCard";
import { GRID_CLASS, TRAY_CLASS } from "@/components/fields/filieresLayout";

interface FiliereCategoryProps {
  title: string;
  cards: (FiliereCardData & { key: string })[];
}

/** Une filiere : son titre, puis ses intercalaires (un par niveau) ranges dans leur logement. */
const FiliereCategory = ({ title, cards }: FiliereCategoryProps) => {
  const fileCount = cards.reduce((sum, card) => sum + card.examCount, 0);

  return (
    <section className="mb-12">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-1">
        <h2 className="text-text-secondary text-2xl font-semibold text-balance md:text-3xl">
          {title}
        </h2>
        <p className="text-text-paragraph text-sm">
          {cards.length} niveau{cards.length > 1 ? "x" : ""}, {fileCount}{" "}
          fichier{fileCount > 1 ? "s" : ""}
        </p>
      </div>
      <div className={TRAY_CLASS}>
        <div className={GRID_CLASS}>
          {cards.map(({ key, ...card }, index) => (
            <FiliereCard data={card} step={index} key={key} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FiliereCategory;
