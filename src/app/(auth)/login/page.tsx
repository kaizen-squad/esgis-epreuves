import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "@/features/auth/ui/LoginForm";
import Image from "next/image";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data) {
    redirect("/accueil");
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
