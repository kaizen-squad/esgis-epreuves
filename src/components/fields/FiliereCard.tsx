"use client";

import Image from "next/image";
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
  className,
}: FiliereProps) => {
  return (
    <div className={`${className} @container relative aspect-square w-full`}>
      <div className="text-text-primary absolute inset-x-[20%] top-[52%] z-10">
        <p className="mb-2 text-[clamp(0.875rem,7cqw,1rem)] font-semibold uppercase">
          {label}
        </p>
        <p className="text-lg font-medium text-gray-400">Épreuves</p>
      </div>
      <Image
        src="/images/filierecard.svg"
        alt="Filiere Carte"
        className="z-0 object-contain"
        fill
        loading="eager"
      />
      <div className="text-text-primary absolute inset-x-[20%] bottom-[3%] flex items-center justify-between md:bottom-[5%]">
        <div>
          <p className="whitespace-nowrap">
            <span className="text-[clamp(1.5rem,12cqw,2.5rem)] font-semibold">
              {examCount}{" "}
            </span>
            <span>fichiers</span>
          </p>
        </div>
        <Link
          href={href}
          className="cursor-pointer transition-all ease-in-out hover:scale-105"
        >
          <FiArrowRightCircle
            className="bg-background-accent text-text-default rounded-full"
            size={40}
          />
        </Link>
      </div>
    </div>
  );
};

export default FiliereCard;
