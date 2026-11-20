import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { navLinks } from "./constants/navLinks";

/** Mise en page commune a toutes les pages publiques (accueil, catalogue, filieres). */
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar links={navLinks} />
      <main className="flex-1 py-10">{children}</main>
      <Footer links={navLinks} />
    </div>
  );
}
