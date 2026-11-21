import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LogoutButton from "@/components/layout/LogoutButton";
import { bdeNavLinks } from "./constants/navLinks";
import { requireBdeSession } from "./lib/requireBdeSession";

/** Mise en page commune a toutes les pages de l'espace BDE, reservee aux sessions ouvertes. */
export default async function BdeLayout({ children }: LayoutProps<"/">) {
  await requireBdeSession();

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar
        links={bdeNavLinks}
        endSlot={<LogoutButton />}
        homeHref="/bde/accueil"
      />
      <main className="flex-1 py-10">{children}</main>
      <Footer links={bdeNavLinks} />
    </div>
  );
}
