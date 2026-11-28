import { redirect } from "next/navigation";
import { getCurrentProfileStatus } from "@/features/members/queries";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "@/features/auth/ui/LoginForm";

export default async function LoginPage() {
  const status = await getCurrentProfileStatus();
  if (status?.isActive) {
    redirect(status.role === "ADMIN" ? "/admin" : "/bde/accueil");
  }
  if (status && !status.isActive) {
    // Ne pas rediriger (contrairement au cas actif ci-dessus) : sans ca, cette page et la garde
    // BDE/Admin se renverraient la main indefiniment pour un compte desactive apres sa connexion
    // (#164). `signOut` revoque la session cote GoTrue (refus a son prochain refresh) mais ne
    // supprime pas le cookie deja pose ; le jeton d'acces courant reste valide jusqu'a son
    // expiration (~1h), fenetre deja couverte par la verification du statut a chaque page.
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "local" });
  }

  return (
    <main className="flex min-h-dvh flex-col md:flex-row">
      <div className="bg-background-secondary flex shrink-0 items-center justify-center px-6 py-10 md:w-[38%] md:py-0">
        <div className="max-w-sm">
          <p className="text-text-primary text-2xl font-extrabold md:text-3xl">
            Alexandria<span className="text-background-accent">.</span>
          </p>
          <p className="text-text-primary/60 mt-3 text-sm font-medium md:text-base">
            Dépôt et consultation des épreuves de l&apos;ESGIS. Accès réservé à
            l&apos;administration et au BDE.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center px-6 py-10 md:py-0">
        <div className="w-full max-w-sm">
          <h1 className="section-title">Connexion</h1>
          <p className="text-text-paragraph mb-8">
            Entrez vos identifiants pour accéder à votre espace.
          </p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
