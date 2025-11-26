import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // ============================================
  // TEMPORALMENTE DESACTIVADO - ACCESO LIBRE
  // Para reactivar: descomentar el código abajo
  // ============================================
  return NextResponse.next();

  /* ========== CÓDIGO ORIGINAL (COMENTADO) ==========
  const { pathname } = request.nextUrl;

  // Public routes that bypass authentication
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/works",
    "/cashboxes",
    "/expenses",
    "/incomes",
    "/tasks",
    "/suppliers",
    "/schedule",
    "/roles",
    "/users",
    "/storage",
  ];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // If it's a protected route, check for authentication token
  if (isProtectedRoute) {
    // Check for token cookie (set by backend NestJS)
    const token = request.cookies.get("token")?.value;

    // If no token found, redirect to login
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow access for all other routes
  return NextResponse.next();
  ========== FIN CÓDIGO ORIGINAL ========== */
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /login (public route)
     * - /register (public route)
     * - / (root route)
     * 
     * Using .+ instead of .* to require at least one character after /,
     * which excludes the root path "/"
     * The negative lookahead excludes paths that start with login or register
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|register).+)",
  ],
};

