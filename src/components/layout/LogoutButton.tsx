"use client";

import { useFormStatus } from "react-dom";
import { CgSpinner } from "react-icons/cg";
import { FiLogOut } from "react-icons/fi";
import { logout } from "@/features/auth/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="text-text-default mx-auto flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      Se déconnecter
      {pending ? <CgSpinner className="animate-spin" /> : <FiLogOut />}
    </button>
  );
}

/**
 * Bouton de deconnexion de l'espace BDE, affiche a droite de la barre de navigation. Appelle
 * l'action `logout` existante (session locale fermee, puis redirection vers /login).
 */
export default function LogoutButton() {
  return (
    <form action={logout}>
      <SubmitButton />
    </form>
  );
}
