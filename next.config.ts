import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
