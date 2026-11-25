import BdeSidebar from "./components/BdeSidebar";
import { requireBdeSession } from "./lib/requireBdeSession";

/**
 * Mise en page commune a toutes les pages de l'espace BDE, reservee aux sessions ouvertes.
 * Sidebar propre a l'outil, pas le nav/footer de consultation de l'espace public : pas de footer
 * du tout ici, un back-office n'a rien a y mettre.
 */
export default async function BdeLayout({ children }: LayoutProps<"/">) {
  await requireBdeSession();

  return (
    <div className="bg-background-default min-h-dvh lg:flex">
      <BdeSidebar />
      <main className="min-w-0 flex-1 px-4 py-8 md:px-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
