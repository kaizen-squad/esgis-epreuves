"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheck, FiShare2 } from "react-icons/fi";

const COPIED_MS = 2500;

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

/** « Partager l'épreuve » : copie le lien direct vers sa page de consultation. */
export default function ShareExamButton({ path }: { path: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = async () => {
    const copied = await copyText(new URL(path, window.location.origin).href);
    setStatus(copied ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), COPIED_MS);
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-3 font-medium transition-colors ${status === "copied" ? "border-green-600 bg-green-50 text-green-700" : "text-text-default border-gray-300 hover:bg-gray-50"}`}
      >
        {status === "copied" ? <FiCheck size={18} /> : <FiShare2 size={18} />}
        {status === "copied" ? "Lien copié !" : "Partager l'épreuve"}
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
