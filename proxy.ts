import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const ok = await verifyAuthToken(request.cookies.get(AUTH_COOKIE)?.value);
  if (ok) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/img/")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Everything except the login page, the keep-alive cron, Next internals, static icons and Rope's art in /public/rope.
    "/((?!login|api/keepalive|_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|rope/).*)",
  ],
};
