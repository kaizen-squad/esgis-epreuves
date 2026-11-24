import { redirect } from "next/navigation";
import { getCurrentProfileStatus } from "@/features/members/queries";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "@/features/auth/ui/LoginForm";
import Image from "next/image";

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
    <main className="relative flex h-dvh flex-col md:h-screen md:flex-row">
      <div className="relative h-[42dvh] w-full shrink-0 md:h-auto md:flex-1">
        <Image
          src="/images/resume_image2.png"
          alt="Connexion Image"
          fill
          priority
          className="object-cover"
        />
      </div>

      <div className="bg-background-primary relative z-10 -mt-6 flex w-full flex-1 flex-col justify-center rounded-t-4xl px-2 pt-8 pb-6 max-md:overflow-y-auto md:mt-0 md:flex-1 md:rounded-none md:px-0 md:pt-0">
        <div className="mx-auto h-fit w-full md:w-130">
          <h1 className="section-title text-center lg:text-start">
            Bienvenue ...
          </h1>
          <p className="text-text-default mb-8 text-center font-medium lg:text-start">
            Entrez vos données pour accéder à votre compte
          </p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
