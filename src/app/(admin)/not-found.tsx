import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page introuvable · Admin" };

export default function AdminNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="section-title">Page introuvable</h1>
      <p className="text-text-paragraph">
        Ce membre, ce référentiel ou cette page n&apos;existe pas, ou plus.
      </p>
      <Link href="/admin" className="btn-primary">
        Retour aux membres
      </Link>
    </div>
  );
}
