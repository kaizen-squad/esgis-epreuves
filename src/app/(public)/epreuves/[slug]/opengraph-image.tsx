import { ImageResponse } from "next/og";
import { examCote } from "@/components/exams/examCote";
import { getExamShareCard } from "@/features/exams/queries";
import { KaizenCredit } from "@/lib/og/kaizen-credit";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Aperçu généré pour le lien partagé d'une épreuve (R-10) : reprend la cote (R-03) en tête,
 * dans l'esprit d'une fiche d'archive, pour rester reconnaissable dans WhatsApp et les réseaux
 * même sans ouvrir le lien. Épreuve introuvable : image générique de secours.
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const exam = await getExamShareCard((await params).slug);

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 20,
        padding: "0 80px",
        background: "#1d1d28",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <KaizenCredit />
      {exam ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              letterSpacing: 2,
              color: "#c41c2d",
              textTransform: "uppercase",
            }}
          >
            {examCote(exam)}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {exam.title}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700 }}>
          Alexandria.
        </div>
      )}
      <div style={{ display: "flex", fontSize: 28, color: "#9b9bab" }}>
        Alexandria, une initiative du BDE ESGIS
      </div>
    </div>,
    size,
  );
}
