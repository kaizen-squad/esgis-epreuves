import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="head-title">Cote introuvable</h1>
      <p className="text-text-paragraph">
        Ce membre, ce référentiel ou cette page n&apos;existe pas, ou plus.
      </p>
      <Link
        href="/admin"
        className="bg-background-accent text-text-primary rounded-control px-4 py-2"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
}
