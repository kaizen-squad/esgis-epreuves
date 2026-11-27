import fs from "node:fs";
import path from "node:path";

/**
 * Logo Kaizen en data URI : `next/og` (satori) ne sait pas resoudre un chemin `/public`, il lui
 * faut une image deja chargee (data URI ou URL absolue). Lu une seule fois au chargement du
 * module (cote serveur), jamais par requete.
 */
const kaizenLogoDataUri = `data:image/png;base64,${fs
  .readFileSync(path.join(process.cwd(), "public/images/kaizen-logo.png"))
  .toString("base64")}`;

/** Credit "By Kaizen" en coin d'une image opengraph (meme logo que le pied de page du site). */
export function KaizenCredit() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        right: 48,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ fontSize: 24, fontWeight: 600, color: "#ffffff" }}>
        By
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element -- satori (next/og) ne rend que des <img>, jamais next/image */}
      <img src={kaizenLogoDataUri} width={132} height={27} alt="Kaizen" />
    </div>
  );
}
