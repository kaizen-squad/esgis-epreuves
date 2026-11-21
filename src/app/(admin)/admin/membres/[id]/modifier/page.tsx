import { notFound } from "next/navigation";
import { getBdeMember } from "@/features/members/queries";
import AdminPageHeader from "../../../../components/AdminPageHeader";
import { requireAdminSession } from "../../../../lib/requireAdminSession";
import MemberForm from "../../components/MemberForm";

export default async function EditMemberPage({
  params,
}: PageProps<"/admin/membres/[id]/modifier">) {
  await requireAdminSession();
  const { id } = await params;
  const member = await getBdeMember(id);
  if (!member) notFound();

  return (
    <>
      <AdminPageHeader
        title="Modifier un membre du BDE"
        description={`Mettez à jour le compte de ${member.fullName}.`}
      />
      <MemberForm member={member} />
    </>
  );
}
