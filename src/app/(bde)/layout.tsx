import Navbar from "@/app/(public)/components/navbar/components/Navbar";
import Footer from "@/app/(public)/components/footer/components/Footer";
import { bdeNavLinks } from "./constants/navLinks";

/** Mise en page commune a toutes les pages de l'espace BDE. */
export default function BdeLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar links={bdeNavLinks} />
      <main className="flex-1 py-10">{children}</main>
      <Footer links={bdeNavLinks} />
    </div>
  );
}
