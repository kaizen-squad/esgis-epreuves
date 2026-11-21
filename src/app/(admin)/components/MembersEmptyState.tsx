import { FiUsers } from "react-icons/fi";
import AddMemberLink from "./AddMemberLink";

/** Tableau de bord sans aucun membre BDE : invite a creer le premier compte. */
export default function MembersEmptyState() {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="bg-background-default text-background-accent mb-5 flex size-16 items-center justify-center rounded-full">
        <FiUsers size={28} />
      </span>
      <h3 className="text-text-secondary mb-2 text-lg font-semibold">
        Aucun membre du BDE pour l&apos;instant
      </h3>
      <p className="text-text-paragraph mb-6 max-w-md text-sm">
        Les comptes que vous créez apparaîtront ici. Chaque membre pourra se
        connecter pour déposer et gérer les épreuves.
      </p>
      <AddMemberLink />
    </div>
  );
}
