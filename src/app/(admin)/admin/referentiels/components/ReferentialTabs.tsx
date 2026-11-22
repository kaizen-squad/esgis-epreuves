import Link from "next/link";

const TABS = [
  { href: "/admin/referentiels/filieres", label: "Filières" },
  { href: "/admin/referentiels/niveaux", label: "Niveaux" },
  { href: "/admin/referentiels/matieres", label: "Matières" },
  { href: "/admin/referentiels/options", label: "Options" },
] as const;

/** Navigation entre les 4 referentiels geres par l'Admin. */
export default function ReferentialTabs({
  active,
}: {
  active: (typeof TABS)[number]["href"];
}) {
  return (
    <nav aria-label="Référentiels" className="mb-6 flex gap-2 overflow-x-auto">
      {TABS.map((tab) => {
        const current = tab.href === active;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={current ? "page" : undefined}
            className={`rounded-control shrink-0 px-3 py-2 text-sm font-medium transition-colors ${
              current
                ? "bg-background-accent text-text-primary"
                : "text-text-default hover:bg-background-default"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
