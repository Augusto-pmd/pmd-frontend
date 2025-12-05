import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const pathname = req.nextUrl.pathname;
  
  const isAuthPage = pathname.startsWith("/login");
  const isProtected = ["/dashboard", "/works", "/admin", "/suppliers", "/accounting"]
    .some(path => pathname.startsWith(path));

  // Permitir siempre el login
  if (isAuthPage) {
    return NextResponse.next();
  }

  // Si intenta acceder a ruta protegida sin token → a login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/works/:path*", "/admin/:path*", "/suppliers/:path*", "/accounting/:path*", "/login"],
};
