import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard")
    || req.nextUrl.pathname.startsWith("/works")
    || req.nextUrl.pathname.startsWith("/admin")
    || req.nextUrl.pathname.startsWith("/suppliers")
    || req.nextUrl.pathname.startsWith("/accounting");

  // Si NO hay token y es una ruta privada → mandar al login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Si SÍ hay token y va al login → mandarlo al dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/works/:path*",
    "/admin/:path*",
    "/suppliers/:path*",
    "/accounting/:path*",
    "/login",
  ],
};
