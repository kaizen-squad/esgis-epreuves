import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LogoutButton from "@/components/layout/LogoutButton";
import { bdeNavLinks } from "./constants/navLinks";

/** Mise en page commune a toutes les pages de l'espace BDE. */
export default function BdeLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar links={bdeNavLinks} endSlot={<LogoutButton />} />
      <main className="flex-1 py-10">{children}</main>
      <Footer links={bdeNavLinks} />
    </div>
  );
}
