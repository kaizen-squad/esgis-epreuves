import type { NextConfig } from "next";
import { buildContentSecurityPolicy } from "./src/lib/security-headers";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: buildContentSecurityPolicy({
      r2AccountId: process.env.R2_ACCOUNT_ID ?? "",
      isDev: process.env.NODE_ENV === "development",
      localStorageOrigin: process.env.R2_ENDPOINT
        ? new URL(process.env.R2_ENDPOINT).origin
        : undefined,
    }),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Acces au serveur de dev depuis un telephone sur le meme Wi-Fi (IP locale, change selon le
  // bail DHCP) : sans ça, Next.js bloque les requetes cross-origin vers les assets de dev (JS,
  // HMR), ce qui empeche l'hydratation cote client. Ignore en production.
  allowedDevOrigins: ["192.168.1.*"],
  // Rendu des apercus de PDF : binaire natif et fichiers charges a l'execution (worker, polices),
  // que le traçage automatique des fichiers deployes ne voit pas.
  serverExternalPackages: ["pdfjs-dist", "@napi-rs/canvas"],
  outputFileTracingIncludes: {
    "/api/exams/*/preview": [
      "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
      "./node_modules/pdfjs-dist/standard_fonts/**/*",
      "./node_modules/pdfjs-dist/wasm/**/*",
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  experimental: {
    // Ajout en lot d'epreuves (#56, uploadExamsBatch) : jusqu'a MAX_BATCH_FILES (4) fichiers de
    // 900 Ko (src/features/exams/schemas.ts) depasse la limite par defaut (1 Mo) d'une Server
    // Action Next.js. Reste nettement sous les 4,5 Mo imposes par Vercel pour le corps d'une
    // requete, quelle que soit cette configuration.
    serverActions: {
      bodySizeLimit: "4mb",
    },
    // Desactive (#161) : ce cache fichier a survecu a un changement de code entre deux builds
    // Vercel (meme cache de build restaure "source: branch"), servant en prod une page statique
    // (`/`, revalidate=60) compilee avant le correctif au lieu de la recompiler.
    turbopackFileSystemCacheForBuild: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
