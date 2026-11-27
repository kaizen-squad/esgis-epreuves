import Link from "next/link";
import { FiUserPlus } from "react-icons/fi";

export default function AddMemberLink() {
  return (
    <Link href="/admin/membres/ajouter" className="btn-primary w-fit shrink-0">
      <FiUserPlus /> Ajouter un membre
    </Link>
  );
}
