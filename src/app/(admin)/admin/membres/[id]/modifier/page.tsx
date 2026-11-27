import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setBdeMemberActive } from "@/features/members/actions";
import { getBdeMemberCached } from "@/features/members/queries";
import AdminPageHeader from "../../../../components/AdminPageHeader";
import ActiveToggleButton from "../../../../components/ActiveToggleButton";
import { requireAdminSession } from "../../../../lib/requireAdminSession";
import MemberForm from "../../components/MemberForm";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export async function generateMetadata({
  params,
}: PageProps<"/admin/membres/[id]/modifier">): Promise<Metadata> {
  const member = await getBdeMemberCached((await params).id);
  const name = member ? member.fullName || member.email : "membre introuvable";
  return { title: `Modifier ${name} · Admin` };
}

export default async function EditMemberPage({
  params,
}: PageProps<"/admin/membres/[id]/modifier">) {
  await requireAdminSession();
  const { id } = await params;
  const member = await getBdeMemberCached(id);
  if (!member) notFound();

  const name = member.fullName || member.email;
  const activity = member.lastDepositAt
    ? `${member.examCount} épreuve${member.examCount > 1 ? "s" : ""} versée${member.examCount > 1 ? "s" : ""}, dernier dépôt le ${dateFormat.format(new Date(member.lastDepositAt))}.`
    : "Aucune épreuve versée pour l'instant.";

  return (
    <>
      <AdminPageHeader
        title="Modifier un membre du BDE"
        description={`Mettez à jour le compte de ${name}. ${activity}`}
        action={
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                member.isActive
                  ? "bg-success/10 text-success"
                  : "bg-muted/15 text-muted"
              }`}
            >
              <span
                aria-hidden
                className={`size-1.5 rounded-full ${member.isActive ? "bg-success" : "bg-muted"}`}
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
