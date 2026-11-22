import Link from "next/link";
import { FiArrowRightCircle } from "react-icons/fi";

interface FiliereProps {
  className?: string;
  data: {
    label: string;
    examCount: number;
    href: string;
  };
}

const FiliereCard = ({
  data: { label, examCount, href },
  // "flex" (ou son equivalent responsive) vient toujours d'ici, jamais aussi du gabarit ci-dessous :
  // deux classes d'affichage sans prefixe sur le meme element se disputeraient la cascade.
  className = "flex",
}: FiliereProps) => {
  return (
    <Link
      href={href}
      className={`${className} bg-background-primary items-center justify-between gap-4 rounded-xl border border-gray-200 p-5 shadow-sm transition-colors hover:border-gray-300`}
    >
      <div className="min-w-0">
        <p className="text-text-secondary truncate text-lg font-semibold uppercase">
          {label}
        </p>
        <p className="text-text-paragraph text-sm">
          {examCount} fichier{examCount > 1 ? "s" : ""}
        </p>
      </div>
      <FiArrowRightCircle
        className="bg-background-accent text-text-default shrink-0 rounded-full"
        size={32}
      />
    </Link>
  );
};

export default FiliereCard;
