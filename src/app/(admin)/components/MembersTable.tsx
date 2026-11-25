import Link from "next/link";
import { FiEdit2 } from "react-icons/fi";
import { setBdeMemberActive } from "@/features/members/actions";
import type { BdeMember } from "@/features/members/types";
import ActiveToggleButton from "./ActiveToggleButton";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function initials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

/**
 * Liste des membres BDE : nom, email, date d'ajout, activité (#166), statut écrit en toutes
 * lettres et actions (modifier, activer / désactiver). Les membres désactivés arrivent en bas
 * (tri de la requête) et sont grisés.
 */
export default function MembersTable({
  members,
  search,
}: {
  members: BdeMember[];
  search: string;
}) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="from-background-primary pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l to-transparent sm:hidden"
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="bg-background-default text-text-paragraph text-xs uppercase">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">
                Nom &amp; prénoms
              </th>
              <th scope="col" className="px-5 py-3 font-medium">
                Email
              </th>
              <th scope="col" className="px-5 py-3 font-medium">
                Date d&apos;ajout
              </th>
              <th scope="col" className="px-5 py-3 font-medium">
                Activité
              </th>
              <th scope="col" className="px-5 py-3 font-medium">
                Statut
              </th>
              <th scope="col" className="px-5 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-text-paragraph px-5 py-12 text-center"
                >
                  Aucun membre ne correspond à « {search} ».{" "}
                  <Link
                    href="/admin"
                    className="text-background-accent font-medium underline"
                  >
                    Effacer la recherche
                  </Link>
                </td>
              </tr>
            ) : (
              members.map((member) => {
                const name = member.fullName || member.email;
                return (
                  <tr
                    key={member.id}
                    className={
                      member.isActive
                        ? "hover:bg-background-default/60"
                        : "bg-gray-50 text-gray-600"
                    }
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${member.isActive ? "bg-background-partial text-text-primary" : "bg-gray-200 text-gray-500"}`}
                        >
                          {initials(member.fullName) || "?"}
                        </span>
                        <span
                          className={`font-medium ${member.isActive ? "text-text-default" : "text-gray-500"}`}
                        >
                          {member.fullName || "Sans nom"}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-5 py-3 ${member.isActive ? "text-text-paragraph" : ""}`}
                    >
                      {member.email}
                    </td>
                    <td
                      className={`px-5 py-3 whitespace-nowrap ${member.isActive ? "text-text-paragraph" : ""}`}
                    >
                      <time dateTime={member.createdAt}>
                        {dateFormat.format(new Date(member.createdAt))}
                      </time>
                    </td>
                    <td
                      className={`px-5 py-3 whitespace-nowrap ${member.isActive ? "text-text-paragraph" : ""}`}
                    >
                      {member.examCount} épreuve
                      {member.examCount > 1 ? "s" : ""}
                      {member.lastDepositAt ? (
                        <>
                          {" "}
                          ·{" "}
                          <time dateTime={member.lastDepositAt}>
                            {dateFormat.format(new Date(member.lastDepositAt))}
                          </time>
                        </>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      {member.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                          <span
                            aria-hidden
                            className="size-1.5 rounded-full bg-green-600"
                          />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600">
                          <span
                            aria-hidden
                            className="size-1.5 rounded-full bg-gray-500"
                          />
                          Désactivé
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/membres/${member.id}/modifier`}
                          aria-label={`Modifier ${name}`}
                          className="text-text-default rounded-control flex items-center gap-1.5 border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                        >
                          <FiEdit2 size={13} /> Modifier
                        </Link>
                        <ActiveToggleButton
                          id={member.id}
                          name={name}
                          isActive={member.isActive}
                          setActive={setBdeMemberActive}
                          title={
                            member.isActive
                              ? "Désactiver ce membre ?"
                              : "Activer ce membre ?"
                          }
                          description={
                            member.isActive ? (
                              <p className="mb-0">
                                <strong>{name}</strong> ne pourra plus se
                                connecter ni gérer les épreuves. Les épreuves
                                déjà déposées restent en ligne. Vous pourrez
                                réactiver ce compte à tout moment.
                              </p>
                            ) : (
                              <p className="mb-0">
                                <strong>{name}</strong> pourra de nouveau se
                                connecter avec ses identifiants actuels et gérer
                                les épreuves.
                              </p>
                            )
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
