import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "vouchr-default-secret-key-that-is-very-long"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let static assets and API routes pass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If clear parameter is present, wipe out the session cookie and redirect to clean login
  if (request.nextUrl.searchParams.has("clear")) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session");
    return response;
  }

  const session = request.cookies.get("session")?.value;

  // Unauthenticated users
  if (!session) {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login?clear=1", request.url));
    }
    return NextResponse.next();
  }

  // Authenticated users
  try {
    const { payload } = await jwtVerify(session, JWT_SECRET);
    const role = payload.role as string;

    // Redirect away from login page if already authenticated
    if (pathname === "/login") {
      if (role === "EMPLOYEE") {
        return NextResponse.redirect(new URL("/dashboard/employee", request.url));
      }
      if (role === "DIRECTOR") {
        return NextResponse.redirect(new URL("/dashboard/director", request.url));
      }
      if (role === "ACCOUNTS") {
        return NextResponse.redirect(new URL("/dashboard/accounts", request.url));
      }
    }

    // Role check
    if (pathname.startsWith("/dashboard/employee") && role !== "EMPLOYEE") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/dashboard/director") && role !== "DIRECTOR") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/dashboard/accounts") && role !== "ACCOUNTS") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch (error) {
    console.error("Middleware auth error:", error);
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
