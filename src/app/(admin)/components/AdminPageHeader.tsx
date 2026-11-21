import type { ReactNode } from "react";

/** En-tete commun aux pages Admin : titre, description et action optionnelle a droite. */
export default function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="section-title">{title}</h1>
        <p className="text-text-paragraph mb-0">{description}</p>
      </div>
      {action}
    </div>
  );
}
