import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Protection de /admin : redirection vers /login si la session Supabase est absente ou
 * expirée. Confort uniquement, la RLS (private.has_role) reste le vrai verrou : chaque
 * écriture revalide sa propre autorisation côté base. Le filtrage par chemin se fait par
 * `config.matcher` ci-dessous : si une session est absente, on est forcément sur /admin.
 */
export async function proxy(request: NextRequest) {
  const { response, hasSession } = await updateSession(request);
  if (hasSession) return response;

  const redirectResponse = NextResponse.redirect(
    new URL("/login", request.url),
  );
  response.cookies
    .getAll()
    .forEach((cookie) => redirectResponse.cookies.set(cookie));
  return redirectResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
