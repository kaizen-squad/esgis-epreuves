import Link from "next/link";
import { FiSettings } from "@/components/icons";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LogoutButton from "@/components/layout/LogoutButton";
import { bdeNavLinks } from "./constants/navLinks";
import { requireBdeSession } from "./lib/requireBdeSession";

/** Mise en page commune a toutes les pages de l'espace BDE, reservee aux sessions ouvertes. */
export default async function BdeLayout({ children }: LayoutProps<"/">) {
  await requireBdeSession();

  return (
    // Meme classeur que l'espace public (voir `(public)/layout.tsx`).
    <div className="bg-background-secondary flex min-h-dvh flex-col">
      <Navbar
        links={bdeNavLinks}
        endSlot={
          // Reglages a cote de la deconnexion, pas en onglet : un quatrieme onglet ne tient
          // plus sur 320px, et ce reglage rare n'a pas sa place dans la navigation principale.
          <div className="flex items-center gap-1">
            <Link
              href="/bde/reglages"
              className="text-text-default flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
            >
              Réglages <FiSettings aria-hidden="true" />
            </Link>
            <LogoutButton />
          </div>
        }
        homeHref="/bde/accueil"
      />
      <main className="binder-sheet bg-background-primary mx-1.5 -mt-px flex-1 rounded-3xl px-2.5 py-10 lg:mx-4 lg:rounded-4xl lg:px-6">
        {children}
      </main>
      <Footer links={bdeNavLinks} />
    </div>
  );
}
