import { FiDownload, FiEye, FiUsers } from "react-icons/fi";
import { countBdeMembers, getBdeMembers } from "@/features/members/queries";
import { MEMBERS_PAGE_SIZE, parsePage } from "@/features/members/schemas";
import AddMemberLink from "../components/AddMemberLink";
import AdminPageHeader from "../components/AdminPageHeader";
import KpiCard from "../components/KpiCard";
import MembersEmptyState from "../components/MembersEmptyState";
import MembersTable from "../components/MembersTable";
import MemberSearch from "../components/MemberSearch";
import Pagination from "../components/Pagination";
import { requireAdminSession } from "../lib/requireAdminSession";

// TODO: le backend ne mesure encore ni les telechargements ni les visites : valeurs en dur en
// attendant un suivi (compteur sur /api/exams/[slug]?dl=1, analytics).
const DOWNLOADS_PLACEHOLDER = 1248;
const VISITS_PLACEHOLDER = 8930;

export default async function AdminDashboardPage({
  searchParams,
}: PageProps<"/admin">) {
  await requireAdminSession();
  const params = await searchParams;
  const search = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";

  const [memberCount, result] = await Promise.all([
    countBdeMembers(),
    getBdeMembers({ search, page: parsePage(params.page) }),
  ]);
  const { members, total, page, pageCount } = result;
  const first = (page - 1) * MEMBERS_PAGE_SIZE + 1;
  const last = first + members.length - 1;

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Suivez l'activité de la plateforme et gérez les comptes du BDE."
      />

      <section
        aria-label="Indicateurs"
        className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <KpiCard
          label="Téléchargements"
          value={DOWNLOADS_PLACEHOLDER}
          hint="Épreuves téléchargées sur la plateforme"
          icon={FiDownload}
        />
        <KpiCard
          label="Visites totales"
          value={VISITS_PLACEHOLDER}
          hint="Visites depuis la mise en ligne"
          icon={FiEye}
        />
        <KpiCard
          label="Membres du BDE"
          value={memberCount}
          hint="Comptes autorisés à déposer des épreuves"
          icon={FiUsers}
        />
      </section>

      <section className="bg-background-primary overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-text-secondary mb-0 text-lg font-semibold">
              Membres du BDE
            </h2>
            <p className="text-text-paragraph mb-0 text-sm">
              Comptes ajoutés, du plus récent au plus ancien.
            </p>
          </div>
          {memberCount > 0 ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <MemberSearch />
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
                  {first}–{last} sur {total} membre{total > 1 ? "s" : ""}
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
