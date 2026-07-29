import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, expectedAdminToken } from "@/lib/server/auth";

export const config = {
  matcher: ["/admin/:path*", "/api/fairs", "/api/fairs/:path*"],
};

const WRITE_METHODS = new Set(["POST", "PATCH", "DELETE"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always public: the login page itself, reading the calendar, and registering for a fair.
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname === "/api/fairs" && req.method === "GET") return NextResponse.next();
  if (pathname.endsWith("/register") && req.method === "POST") return NextResponse.next();

  const isAdminPage = pathname.startsWith("/admin");
  const isProtectedApi = pathname.startsWith("/api/fairs") && WRITE_METHODS.has(req.method);
  if (!isAdminPage && !isProtectedApi) return NextResponse.next();

  const expected = await expectedAdminToken();
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const authed = !!expected && token === expected;

  if (authed) return NextResponse.next();

  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Please log in as an organizer to make changes." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", req.url);
  return NextResponse.redirect(loginUrl);
}
