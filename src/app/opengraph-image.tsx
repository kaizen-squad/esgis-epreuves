import { ImageResponse } from "next/og";
import { KaizenCredit } from "@/lib/og/kaizen-credit";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Alexandria, une initiative du BDE ESGIS";

/**
 * Image de partage par defaut (convention de fichier Next), heritee par toute page qui n'en
 * declare pas de plus specifique (ex. la fiche d'une epreuve).
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        background: "#1d1d28",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 96, fontWeight: 700 }}>Alexandria.</div>
      <div style={{ fontSize: 32, color: "#c41c2d" }}>
        Une initiative du BDE ESGIS
      </div>
      <KaizenCredit />
    </div>,
    size,
  );
}
