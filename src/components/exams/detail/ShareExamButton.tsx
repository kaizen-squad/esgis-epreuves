"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheck, FiCopy, FiMessageCircle, FiShare2 } from "react-icons/fi";
import { whatsappHref } from "@/features/contact/whatsapp";

const COPIED_MS = 2500;

const ACTION_BUTTON_CLASS =
  "text-text-default flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 font-medium transition-colors hover:bg-gray-50";

/** Copie dans le presse-papiers, avec repli pour un contexte non securise (http sur le reseau local). */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  }
}

/**
 * Partage de l'epreuve (R-10) : feuille de partage native sur mobile (`navigator.share`, limite
 * aux appareils a pointeur grossier : un Chrome ou Safari desktop l'expose aussi, mais le repli
 * WhatsApp/copie est celui vise pour desktop), sinon sur desktop un lien WhatsApp pre-rempli et
 * la copie du lien, le canal reel des etudiants etant WhatsApp mobile. L'URL absolue et la
 * disponibilite de `navigator.share` ne sont connues qu'au montage (cote client) : `shareUrl`
 * reste `null` le temps de ce premier effet.
 */
export default function ShareExamButton({
  path,
  title,
}: {
  path: string;
  title: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);
  // Indetermine jusqu'au premier effet : rien n'est rendu avant, pour ne pas afficher le mauvais
  // variant (WhatsApp/copie) une fraction de seconde avant qu'il ne bascule sur le partage natif.
  const [ready, setReady] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // Detection cote client uniquement (URL absolue, capacite navigator.share sur un appareil
    // tactile) : rien de tout cela ne peut se resoudre pendant le rendu, cote serveur compris.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShareUrl(new URL(path, window.location.origin).href);
    setCanShare(
      typeof navigator.share === "function" &&
        window.matchMedia("(pointer: coarse)").matches,
    );
    setReady(true);
    return () => clearTimeout(timer.current);
  }, [path]);

  if (!ready) return null;

  const handleCopy = async () => {
    if (!shareUrl) return;
    const copied = await copyText(shareUrl);
    setStatus(copied ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), COPIED_MS);
  };

  const handleNativeShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.share({ title, url: shareUrl });
    } catch (error) {
      // Feuille fermee par l'utilisateur (AbortError) : rien a faire. Tout autre echec (droits,
      // contexte non securise) retombe sur la copie, pour ne pas laisser l'action sans effet.
      if (error instanceof Error && error.name === "AbortError") return;
      await handleCopy();
    }
  };

  if (canShare) {
    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={handleNativeShare}
          disabled={!shareUrl}
          className={ACTION_BUTTON_CLASS}
        >
          <FiShare2 size={18} /> Partager l&apos;épreuve
        </button>
        {status === "copied" ? (
          <p
            role="status"
            aria-live="polite"
            className="text-text-paragraph mb-0 text-center text-xs"
          >
            Lien copié : collez-le pour partager l&apos;épreuve.
          </p>
        ) : null}
      </div>
    );
  }

  const shareHref = shareUrl ? whatsappHref(`${title} ${shareUrl}`) : undefined;

  return (
    <div className="flex flex-col gap-2">
      <a
        href={shareHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!shareHref}
        className={`${ACTION_BUTTON_CLASS} ${!shareHref ? "pointer-events-none opacity-50" : ""}`}
      >
        <FiMessageCircle size={18} /> Partager sur WhatsApp
      </a>
      <button
        type="button"
        onClick={handleCopy}
        disabled={!shareUrl}
        className={`${ACTION_BUTTON_CLASS} ${status === "copied" ? "border-green-600 bg-green-50 text-green-700" : ""}`}
      >
        {status === "copied" ? <FiCheck size={18} /> : <FiCopy size={18} />}
        {status === "copied" ? "Lien copié !" : "Copier le lien"}
      </button>
      <p
        role="status"
        aria-live="polite"
        className="text-text-paragraph mb-0 min-h-[1lh] text-center text-xs"
      >
        {status === "copied"
          ? "Collez-le pour partager l'épreuve."
          : status === "failed"
            ? "Copie impossible : copiez l'adresse de la page."
            : ""}
      </p>
    </div>
  );
}
