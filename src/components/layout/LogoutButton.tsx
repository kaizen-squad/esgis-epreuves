import { FiLogOut } from "react-icons/fi";

/** Bouton de deconnexion de l'espace BDE, affiche a droite de la barre de navigation. */
export default function LogoutButton() {
  return (
    <form>
      <button
        type="submit"
        className="text-text-default mx-auto flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
      >
        Se déconnecter <FiLogOut />
      </button>
    </form>
  );
}
