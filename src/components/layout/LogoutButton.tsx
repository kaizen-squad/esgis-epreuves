"use client";

import { useFormStatus } from "react-dom";
import { CgSpinner } from "react-icons/cg";
import { FiLogOut } from "react-icons/fi";
import { logout } from "@/features/auth/actions";

const TONE_CLASS = {
  // Pastille blanche sur fond clair (bouton Reglages/Deconnexion du header BDE).
  light:
    "text-text-default border border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60",
  // Fond sombre (bas de la barre laterale Admin, #163) : meme forme, contraste inverse.
  dark: "text-text-primary border border-white/15 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60",
} as const;

function SubmitButton({
  className = "mx-auto",
  tone,
}: {
  className?: string;
  tone: keyof typeof TONE_CLASS;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${TONE_CLASS[tone]} ${className}`}
    >
      Se déconnecter
      {pending ? <CgSpinner className="animate-spin" /> : <FiLogOut />}
    </button>
  );
}

/**
 * Bouton de deconnexion des espaces BDE (barre de navigation, fond clair) et Admin (bas de la
 * barre laterale sombre, #163). Appelle l'action `logout` existante (session locale fermee, puis
 * redirection vers /login).
 */
export default function LogoutButton({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: keyof typeof TONE_CLASS;
}) {
  return (
    <form action={logout}>
      <SubmitButton className={className} tone={tone} />
    </form>
  );
}
