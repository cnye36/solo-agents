import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get("sb-access-token");

  const isProtectedRoute =
    pathname.startsWith("/chat") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/integrations") ||
    pathname.startsWith("/files") ||
    pathname.startsWith("/preferences") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/onboarding");

  if (isProtectedRoute && !accessToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|css|js|json|xml|txt)$).*)",
  ],
};
