import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isProtected = ["/dashboard", "/works", "/admin", "/suppliers", "/accounting"]
    .some(path => req.nextUrl.pathname.startsWith(path));

  // Logs de depuración (solo en desarrollo)
  if (process.env.NODE_ENV === "development") {
    console.log("🔵 [MIDDLEWARE] Request:", req.nextUrl.pathname);
    console.log("  - Token en cookie:", token ? "***PRESENT***" : "NULL");
    console.log("  - isAuthPage:", isAuthPage);
    console.log("  - isProtected:", isProtected);
  }

  // Permitir siempre entrar al login
  if (isAuthPage) {
    if (process.env.NODE_ENV === "development") {
      console.log("🟢 [MIDDLEWARE] Allowing access to /login");
    }
    return NextResponse.next();
  }

  // Si no hay token y la ruta es privada → a login
  if (!token && isProtected) {
    if (process.env.NODE_ENV === "development") {
      console.log("🔴 [MIDDLEWARE] No token found, redirecting to /login");
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Validar que el token no esté vacío, null, undefined o no sea string
  if (isProtected && token) {
    const isValidToken = token && 
                        typeof token === "string" && 
                        token.trim().length > 0 && 
                        token !== "null" && 
                        token !== "undefined";
    
    if (!isValidToken) {
      if (process.env.NODE_ENV === "development") {
        console.log("🔴 [MIDDLEWARE] Invalid token format, redirecting to /login");
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.log("🟢 [MIDDLEWARE] Allowing request to proceed");
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
