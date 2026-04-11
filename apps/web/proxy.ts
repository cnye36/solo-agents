import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Session refresh + cookie sync for Supabase SSR.
 *
 * Do not gate auth with a custom cookie name (e.g. `sb-access-token`). The
 * `@supabase/ssr` client stores chunked cookies like `sb-<ref>-auth-token`.
 * Wrong checks cause redirect loops or block navigation after sign-in.
 *
 * Protected routes enforce auth in route layouts via `getUser()`.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|css|js|json|xml|txt)$).*)",
  ],
};
