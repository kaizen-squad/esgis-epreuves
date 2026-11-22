import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon genere (convention de fichier Next), remplace l'ancien favicon.ico sans lien avec l'ESGIS ou le BDE. */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#c41c2d",
        color: "#ffffff",
        fontSize: 38,
        fontWeight: 700,
        fontFamily: "sans-serif",
        borderRadius: 14,
      }}
    >
      A
    </div>,
    size,
  );
}
