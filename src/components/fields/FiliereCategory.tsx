import FiliereCard from "@/components/fields/FiliereCard";

type FiliereCardData = {
  label: string;
  examCount: number;
  href: string;
};

interface FiliereCategoryProps {
  title: string;
  cards: (FiliereCardData & { key: string })[];
}

const FiliereCategory = ({ title, cards }: FiliereCategoryProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-text-secondary text-3xl font-semibold">{title}</h3>
      <div className="grid w-full grid-cols-1 gap-4 py-0 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ key, ...card }) => (
          <FiliereCard data={card} key={key} />
        ))}
      </div>
    </div>
  );
};

export default FiliereCategory;
