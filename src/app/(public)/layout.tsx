import Navbar from "./components/navbar/components/Navbar";
import Footer from "./components/footer/components/Footer";

/** Mise en page commune a toutes les pages publiques (accueil, catalogue, filieres). */
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1 py-10">{children}</main>
      <Footer />
    </div>
  );
}
