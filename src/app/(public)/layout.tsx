import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { navLinks } from "./constants/navLinks";

/**
 * Mise en page commune a toutes les pages publiques (accueil, catalogue, filieres) : la
 * couverture marine du classeur encadre la feuille de la page, accrochee a son onglet actif
 * (`-mt-px` : aucun jour entre la languette et la feuille). Retraits + marges internes gardent
 * le contenu au meme alignement qu'avant (16px sur mobile, 40px sur desktop).
 */
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="bg-background-secondary flex min-h-dvh flex-col">
      <Navbar links={navLinks} />
      <main className="binder-sheet bg-background-primary mx-1.5 -mt-px flex-1 rounded-3xl px-2.5 py-10 lg:mx-4 lg:rounded-4xl lg:px-6">
        {children}
      </main>
      <Footer links={navLinks} />
    </div>
  );
}
