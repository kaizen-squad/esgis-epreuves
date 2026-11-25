import type { Metadata } from "next";
import { FiUserCheck, FiUserX } from "react-icons/fi";
import {
  countActiveBdeMembers,
  countBdeMembers,
  getBdeMembers,
} from "@/features/members/queries";
import { MEMBERS_PAGE_SIZE, parsePage } from "@/features/members/schemas";
import AddMemberLink from "../components/AddMemberLink";
import AdminPageHeader from "../components/AdminPageHeader";
import KpiCard from "../components/KpiCard";
import MembersEmptyState from "../components/MembersEmptyState";
import MembersTable from "../components/MembersTable";
import MemberSearch from "../components/MemberSearch";
import Pagination from "../components/Pagination";
import { requireAdminSession } from "../lib/requireAdminSession";

export const metadata: Metadata = { title: "Membres · Admin" };

export default async function AdminMembersPage({
  searchParams,
}: PageProps<"/admin">) {
  await requireAdminSession();
  const params = await searchParams;
  const search = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";

  const [memberCount, activeCount, result] = await Promise.all([
    countBdeMembers(),
    countActiveBdeMembers(),
    getBdeMembers({ search, page: parsePage(params.page) }),
  ]);
  const { members, total, page, pageCount } = result;
  const first = (page - 1) * MEMBERS_PAGE_SIZE + 1;
  const last = first + members.length - 1;
  const inactiveCount = memberCount - activeCount;

  return (
    <>
      <AdminPageHeader
        title="Membres"
        description="Gérez les comptes des membres du BDE."
      />

      <section
        aria-label="Indicateurs"
        className="mb-10 grid gap-4 sm:grid-cols-2"
      >
        <KpiCard
          label="Membres actifs"
          value={activeCount}
          hint="Comptes autorisés à déposer des épreuves"
          icon={FiUserCheck}
          tone="positive"
        />
        <KpiCard
          label="Membres désactivés"
          value={inactiveCount}
          hint="Comptes bloqués, réactivables à tout moment"
          icon={FiUserX}
          tone="negative"
        />
      </section>

      <section className="bg-background-primary rounded-card shadow-card overflow-hidden border border-gray-200">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-text-secondary mb-0 text-lg font-semibold">
              Membres du BDE
            </h2>
            <p className="text-text-paragraph mb-0 text-sm">
              Membres actifs puis désactivés, du plus récent au plus ancien.
            </p>
          </div>
          {memberCount > 0 ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <MemberSearch resultCount={total} />
              <AddMemberLink />
            </div>
          ) : null}
        </div>

        {memberCount === 0 ? (
          <MembersEmptyState />
        ) : (
          <>
            <MembersTable members={members} search={search} />
            {total > 0 ? (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row">
                <p className="text-text-paragraph mb-0 text-sm">
                  {first} à {last} sur {total} membre{total > 1 ? "s" : ""}
                </p>
                <Pagination
                  page={page}
                  pageCount={pageCount}
                  params={search ? { q: search } : {}}
                />
              </div>
            ) : null}
          </>
        )}
      </section>
    </>
  );
}
