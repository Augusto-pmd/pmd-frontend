import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Middleware sin lógica de autenticación
  // El control de acceso queda delegado a componentes client-side (ProtectedRoute)
  return NextResponse.next();
}

// Configuración del matcher eliminada ya que no hay lógica de routing
// export const config = { ... };
