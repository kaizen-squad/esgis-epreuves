"use client";

import { useFormStatus } from "react-dom";
import { CgSpinner } from "react-icons/cg";
import { FiLogOut } from "react-icons/fi";
import { logout } from "@/features/auth/actions";

function SubmitButton({ className = "mx-auto" }: { className?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`text-text-default flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      Se déconnecter
      {pending ? <CgSpinner className="animate-spin" /> : <FiLogOut />}
    </button>
  );
}

/**
 * Bouton de deconnexion des espaces BDE (barre de navigation) et Admin (bas de la barre laterale).
 * Appelle l'action `logout` existante (session locale fermee, puis redirection vers /login).
 */
export default function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logout}>
      <SubmitButton className={className} />
    </form>
  );
}
