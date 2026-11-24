import type { Metadata } from "next";
import { requireBdeSession } from "@/app/(bde)/lib/requireBdeSession";
import { getBdeWhatsappNumber } from "@/features/contact/queries";
import WhatsappNumberForm from "./components/WhatsappNumberForm";

export const metadata: Metadata = { title: "Réglages · Espace BDE" };

/** Reglages du site public modifiables par le BDE, sans toucher au code. */
export default async function BDEReglagesPage() {
  await requireBdeSession();
  const whatsappNumber = await getBdeWhatsappNumber();

  return (
    <div className="mx-auto max-w-2xl px-2 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="head-title">Réglages</h1>
        <p className="text-text-default text-pretty">
          Ce que les visiteurs du site public voient de vous, modifiable ici à
          tout moment.
        </p>
      </div>
      <WhatsappNumberForm initialNumber={whatsappNumber} />
    </div>
  );
}
