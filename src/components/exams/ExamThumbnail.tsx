"use client";

import Image from "next/image";
import { useState } from "react";
import { FiFileText } from "react-icons/fi";

/**
 * Apercu d'un fichier sur une carte : le haut de sa premiere page, deja a la bonne taille (route
 * `/api/exams/[slug]/preview`, pas d'optimisation). L'icone de fond reste seule tant que l'apercu
 * charge, ou s'il est indisponible. Decoratif : le titre de l'epreuve suit sur la carte.
 */
export default function ExamThumbnail({ src }: { src: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  return (
    <>
      <FiFileText
        size={40}
        aria-hidden
        className="absolute inset-0 m-auto text-gray-300"
      />
      {failedSrc === src ? null : (
        <Image
          ref={(image) => {
            // Echec survenu avant l'hydratation : `onError` n'a pas ete appele.
            if (image?.complete && image.naturalWidth === 0) setFailedSrc(src);
          }}
          src={src}
          alt=""
          fill
          unoptimized
          onError={() => setFailedSrc(src)}
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      )}
    </>
  );
}
