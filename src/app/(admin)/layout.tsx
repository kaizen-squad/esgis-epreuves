import AdminSidebar from "./components/AdminSidebar";
import { requireAdminSession } from "./lib/requireAdminSession";

/** Mise en page de l'espace Admin : barre laterale de navigation et contenu a droite. */
export default async function AdminLayout({ children }: LayoutProps<"/">) {
  await requireAdminSession();

  return (
    <div className="bg-background-default min-h-dvh lg:flex">
      <AdminSidebar />
      <main className="min-w-0 flex-1 px-4 py-8 md:px-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
