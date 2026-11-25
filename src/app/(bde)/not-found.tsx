import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page introuvable · Espace BDE" };

export default function BdeNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="section-title">Page introuvable</h1>
      <p className="text-text-paragraph">
        Aucune épreuve versée sous cette cote, ou la page demandée n&apos;existe
        plus.
      </p>
      <Link
        href="/bde/accueil"
        className="bg-background-accent text-text-primary rounded-control px-4 py-2"
      >
        Retour à l&apos;accueil BDE
      </Link>
    </div>
  );
}
