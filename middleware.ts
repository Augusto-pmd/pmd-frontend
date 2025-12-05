import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value || null;

  const pathname = req.nextUrl.pathname;

  const isLogin = pathname.startsWith("/login");
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/works") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/suppliers") ||
    pathname.startsWith("/accounting") ||
    pathname.startsWith("/rrhh") ||
    pathname.startsWith("/clients") ||
    pathname.startsWith("/documents") ||
    pathname.startsWith("/alerts") ||
    pathname.startsWith("/audit") ||
    pathname.startsWith("/cash") ||
    pathname.startsWith("/cashbox") ||
    pathname.startsWith("/cashboxes") ||
    pathname.startsWith("/roles") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/organigrama") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/incomes") ||
    pathname.startsWith("/expenses") ||
    pathname.startsWith("/contracts");

  // Permitir siempre el login
  if (isLogin) return NextResponse.next();

  // Si es ruta protegida y no hay token → login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/works/:path*",
    "/admin/:path*",
    "/suppliers/:path*",
    "/accounting/:path*",
    "/rrhh/:path*",
    "/clients/:path*",
    "/documents/:path*",
    "/alerts/:path*",
    "/audit/:path*",
    "/cash/:path*",
    "/cashbox/:path*",
    "/cashboxes/:path*",
    "/roles/:path*",
    "/users/:path*",
    "/organigrama/:path*",
    "/settings/:path*",
    "/incomes/:path*",
    "/expenses/:path*",
    "/contracts/:path*"
  ],
};
