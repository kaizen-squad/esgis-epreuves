/**
 * CSP fixe (#26) : construite une fois au build a partir des variables d'environnement
 * (voir next.config.ts), pas par requete via un nonce. `'unsafe-inline'` sur script-src
 * reste necessaire : l'App Router injecte le payload RSC dans des <script> inline a
 * chaque rendu, nonce ou pas tant que le proxy ne force pas le rendu dynamique partout.
 *
 * Seul R2 est autorise (frame-src, pour la redirection 307 de /api/exams/[slug] vers une
 * URL presignee, potentiellement affichee dans un iframe cote front). Supabase et R2 ne
 * sont pas ajoutes a connect-src/img-src : aucun code navigateur ne les contacte
 * directement pour l'instant (src/lib/supabase/client.ts n'est importe nulle part) ; a
 * ajouter le jour ou un composant client en a reellement besoin.
 */
export function buildContentSecurityPolicy(env: {
  r2AccountId: string;
  isDev: boolean;
}): string {
  const r2Origins = env.r2AccountId
    ? `https://${env.r2AccountId}.r2.cloudflarestorage.com https://*.${env.r2AccountId}.r2.cloudflarestorage.com`
    : "";

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${env.isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    `frame-src 'self' ${r2Origins}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ];

  return directives
    .map((directive) => directive.replace(/\s+/g, " ").trim())
    .join("; ");
}
