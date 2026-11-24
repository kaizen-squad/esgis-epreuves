import { Suspense } from "react";
import CTACatalogue from "@/components/home/CTACatalogue";
import Research from "@/components/exams/Research";
import FieldDirectory from "@/components/fields/FieldDirectory";
import FieldDirectorySkeleton from "@/components/fields/FieldDirectorySkeleton";

/** Pas de searchParams/cookies/headers ici : rendu statique avec la meme fenetre que le cache de donnees (#157). */
export const revalidate = 60;

/**
 * Page dediee aux filieres : le repertoire complet (une rangee par filiere, une fiche par niveau),
 * distinct de la grille compacte de l'accueil qui reste un raccourci.
 */
const Filieres = () => {
  return (
    <>
      <header className="mx-auto mb-8 grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-6 lg:mb-10 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-end">
        <div>
          <h1 className="head-title mb-4">
            Choisis ta filière, puis ton niveau
          </h1>
          <p className="text-text-paragraph max-w-2xl text-pretty">
            Chaque fiche correspond à un niveau : les matières dont on a déjà
            des épreuves, et les années couvertes. Ouvre la fiche de ton niveau
            pour voir ses épreuves.
          </p>
        </div>
        <Research inline />
      </header>
      <Suspense fallback={<FieldDirectorySkeleton />}>
        <FieldDirectory />
      </Suspense>
      <CTACatalogue />
    </>
  );
};

export default Filieres;
