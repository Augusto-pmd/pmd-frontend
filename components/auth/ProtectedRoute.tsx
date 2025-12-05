"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, UserRole } from "@/store/authStore";
import { Loading } from "@/components/ui/Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {

  // --- HOOKS SIEMPRE PRIMERO ---
  const { user, isAuthenticated } = useAuthStore((state) => ({
    user: state.user ? state.getUserSafe() : null,
    isAuthenticated: state.isAuthenticated,
  }));

  const router = useRouter();
  const [hasAttemptedSessionLoad, setHasAttemptedSessionLoad] = useState(false);
  
  // Logs de depuración
  const storeState = useAuthStore.getState();
  console.log("🔵 [AUTH PROTECTED ROUTE] Estado del store:");
  console.log("  - isAuthenticated:", isAuthenticated);
  console.log("  - user:", user ? "PRESENT" : "NULL");
  console.log("  - token:", storeState.token ? "***PRESENT***" : "NULL");
  console.log("  - user.role:", user?.role, "(type:", typeof user?.role, ")");

  const userRole = user?.role ?? null;

  // --- useEffect: Marcar que se intentó cargar sesión ---
  useEffect(() => {
    // Marcar que ya se intentó cargar la sesión después del primer render
    setHasAttemptedSessionLoad(true);
  }, []);

  // --- useEffect: NO debe haber returns antes ---
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole as UserRole)) {
      router.replace("/unauthorized");
      return;
    }
  }, [isAuthenticated, userRole, allowedRoles, router, redirectTo]);

  // --- Guard DESPUÉS del efecto: Permitir redirect sin bloquear ---
  if (!isAuthenticated && hasAttemptedSessionLoad) {
    router.replace(redirectTo);
    return null;
  }

  // Mostrar loading solo mientras se intenta cargar la sesión por primera vez
  if (!user && !hasAttemptedSessionLoad) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // Si no hay user después de intentar cargar, permitir redirect
  if (!user) {
    return null;
  }

  // Verificar organizationId
  if (!user.organizationId) {
    console.warn("⚠️ [ProtectedRoute] user.organizationId no está presente");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // El backend ahora devuelve role como string, pero mantenemos compatibilidad con objetos
  const role = typeof user.role === "object" 
    ? (user.role.name ?? user.role.id ?? null) 
    : user.role;

  // Si no hay role pero hay user, permitir paso (el backend puede devolver role como null)
  // Solo bloquear si hay allowedRoles específicos
  if (allowedRoles && allowedRoles.length > 0 && !role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
