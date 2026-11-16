import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "@/features/auth/ui/LoginForm";
import Image from "next/image";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data) {
    redirect("/");
  }

  return (
    <main className="flex h-screen">
      <div className="flex flex-1 items-center justify-center">
        <div className="mx-auto h-fit w-full md:w-130">
          <h1 className="section-title">Bienvenue ...</h1>
          <p className="text-text-default mb-8 font-medium">
            Entrez vos données pour accéder à votre compte
          </p>
          <LoginForm />
        </div>
      </div>
      <div className="relative flex-1">
        <Image
          src="/images/resume_image2.png"
          alt="Connexion Image"
          fill
          className="h-full w-full"
        />
      </div>
    </main>
  );
}
