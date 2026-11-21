import AdminPageHeader from "../../../components/AdminPageHeader";
import { requireAdminSession } from "../../../lib/requireAdminSession";
import MemberForm from "../components/MemberForm";

export default async function AddMemberPage() {
  await requireAdminSession();

  return (
    <>
      <AdminPageHeader
        title="Ajouter un membre du BDE"
        description="Créez le compte qui permettra à ce membre de déposer et gérer les épreuves."
      />
      <MemberForm />
    </>
  );
}
