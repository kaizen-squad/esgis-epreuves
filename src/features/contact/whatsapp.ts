/**
 * Seul constructeur de lien WhatsApp du site (contact du BDE, partage d'une epreuve) : si le
 * format de wa.me change, c'est ici et nulle part ailleurs. Module pur, utilisable cote client.
 * Sans numero, wa.me reste valide et laisse choisir le destinataire.
 */
export function whatsappHref(text: string, phone?: string | null): string {
  const digits = phone ? phone.replace(/^\+/, "") : "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
