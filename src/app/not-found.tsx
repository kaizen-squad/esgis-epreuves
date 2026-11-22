import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="head-title">Cote introuvable</h1>
      <p className="text-text-paragraph">
        Cette page n&apos;existe pas, ou plus.
      </p>
      <Link
        href="/"
        className="bg-background-accent text-text-primary rounded-control px-4 py-2"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
