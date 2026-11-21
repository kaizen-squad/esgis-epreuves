import Link from "next/link";
import { FiUserPlus } from "react-icons/fi";

export default function AddMemberLink() {
  return (
    <Link
      href="/admin/membres/ajouter"
      className="bg-background-accent text-text-primary flex w-fit shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
    >
      <FiUserPlus /> Ajouter un membre
    </Link>
  );
}
