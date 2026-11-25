import { notFound } from "next/navigation";
import { setBdeMemberActive } from "@/features/members/actions";
import { getBdeMember } from "@/features/members/queries";
import AdminPageHeader from "../../../../components/AdminPageHeader";
import ActiveToggleButton from "../../../../components/ActiveToggleButton";
import { requireAdminSession } from "../../../../lib/requireAdminSession";
import MemberForm from "../../components/MemberForm";

export default async function EditMemberPage({
  params,
}: PageProps<"/admin/membres/[id]/modifier">) {
  await requireAdminSession();
  const { id } = await params;
  const member = await getBdeMember(id);
  if (!member) notFound();

  const name = member.fullName || member.email;

  return (
    <>
      <AdminPageHeader
        title="Modifier un membre du BDE"
        description={`Mettez à jour le compte de ${name}.`}
        action={
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                member.isActive
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              <span
                aria-hidden
                className={`size-1.5 rounded-full ${member.isActive ? "bg-green-600" : "bg-gray-500"}`}
              />
              {member.isActive ? "Actif" : "Désactivé"}
            </span>
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
                    <strong>{name}</strong> ne pourra plus se connecter ni gérer
                    les épreuves. Les épreuves déjà déposées restent en ligne.
                    Vous pourrez réactiver ce compte à tout moment.
                  </p>
                ) : (
                  <p className="mb-0">
                    <strong>{name}</strong> pourra de nouveau se connecter avec
                    ses identifiants actuels et gérer les épreuves.
                  </p>
                )
              }
            />
          </div>
        }
      />
      <MemberForm member={member} />
    </>
  );
}
