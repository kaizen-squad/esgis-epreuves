import BdeHeader from "./components/BdeHeader";
import { requireBdeSession } from "./lib/requireBdeSession";

/**
 * Mise en page commune a toutes les pages de l'espace BDE, reservee aux sessions ouvertes.
 * Header propre a l'outil (#175), pas le nav/footer de consultation de l'espace public : pas de
 * footer du tout ici, un back-office n'a rien a y mettre.
 */
export default async function BdeLayout({ children }: LayoutProps<"/">) {
  await requireBdeSession();

  return (
    <div className="bg-background-default flex min-h-dvh flex-col">
      <BdeHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
