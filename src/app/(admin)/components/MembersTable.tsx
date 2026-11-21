import Link from "next/link";
import { FiEdit2 } from "react-icons/fi";
import type { BdeMember } from "@/features/members/types";

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

/** Liste des membres BDE : nom, email, date d'ajout et action de modification. */
export default function MembersTable({
  members,
  search,
}: {
  members: BdeMember[];
  search: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm">
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
            <th scope="col" className="px-5 py-3 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {members.length === 0 ? (
            <tr>
              <td
                colSpan={4}
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
            members.map((member) => (
              <tr key={member.id} className="hover:bg-background-default/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="bg-background-partial text-text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                    >
                      {initials(member.fullName) || "?"}
                    </span>
                    <span className="text-text-default font-medium">
                      {member.fullName || "—"}
                    </span>
                  </div>
                </td>
                <td className="text-text-paragraph px-5 py-3">
                  {member.email}
                </td>
                <td className="text-text-paragraph px-5 py-3 whitespace-nowrap">
                  <time dateTime={member.createdAt}>
                    {dateFormat.format(new Date(member.createdAt))}
                  </time>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end">
                    <Link
                      href={`/admin/membres/${member.id}/modifier`}
                      aria-label={`Modifier ${member.fullName}`}
                      className="text-text-default flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                    >
                      <FiEdit2 size={13} /> Modifier
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
