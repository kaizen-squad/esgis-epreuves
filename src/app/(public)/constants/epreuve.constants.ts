import EpreuveCard from "../components/EpreuveCard";

export const epreuvesMock: EpreuveCard[] = [
  {
    img_src: "/images/study.png",
    name: "Baccalauréat Mathématiques - Session Normale",
    year: 2025,
    matter: "Mathématiques",
    class: "Terminale",
    type: "Examen National",
  },
  {
    img_src: "/images/study.png",
    name: "Épreuve de Physique-Chimie",
    year: 2024,
    matter: "Physique-Chimie",
    class: "Terminale",
    type: "Baccalauréat",
  },
  {
    img_src: "/images/study.png",
    name: "Épreuve de Physique-Chimie",
    year: 2024,
    matter: "Physique-Chimie",
    class: "Terminale",
    type: "Baccalauréat",
  },
  {
    img_src: "/images/study.png",
    name: "Épreuve de Physique-Chimie",
    year: 2024,
    matter: "Physique-Chimie",
    class: "Terminale",
    type: "Baccalauréat",
  },
  {
    img_src: "/images/study.png",
    name: "Épreuve de Physique-Chimie",
    year: 2024,
    matter: "Physique-Chimie",
    class: "Terminale",
    type: "Baccalauréat",
  },
  {
    img_src: "/images/study.png",
    name: "Épreuve de Physique-Chimie",
    year: 2024,
    matter: "Physique-Chimie",
    class: "Terminale",
    type: "Baccalauréat",
  },
  {
    img_src: "/images/study.png",
    name: "Épreuve de Physique-Chimie",
    year: 2024,
    matter: "Physique-Chimie",
    class: "Terminale",
    type: "Baccalauréat",
  },
  {
    img_src: "/images/study.png",
    name: "Brevet des Collèges - Histoire, Géo & EMC",
    year: 2025,
    matter: "Histoire-Géographie",
    class: "3ème",
    type: "Brevet",
  },
  {
    img_src: "/images/study.png",
    name: "Évaluation Commune - NSI",
    year: 2026,
    matter: "Numérique et Sciences Informatiques",
    class: "Première",
    type: "Contrôle Continu",
  },
];

// Colonnes bornées entre 17rem et 20rem (= max-w-80 de EpreuveCard) :
// sur grand écran on ajoute des colonnes au lieu d'élargir les cartes.
export const EPREUVE_GRID_CLASSES =
  "grid grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),20rem))] gap-6";
