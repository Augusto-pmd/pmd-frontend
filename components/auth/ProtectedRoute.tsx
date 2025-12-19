"use client";

import { useEffect } from "react";
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
  const storeState = useAuthStore.getState();
  // Check both Zustand store and localStorage for token
  const token = storeState.token || (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
  const { user, isAuthenticated } = useAuthStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  }));

  const router = useRouter();
  
  // role ahora es SIEMPRE un objeto { id, name } o null, extraer el nombre
  const userRoleName = user?.role?.name?.toLowerCase() as UserRole | null;

  // --- useEffect: Si hay token pero no user, llamar a loadMe() ---
  useEffect(() => {
    if (token && !user) {
      console.log("🔵 ProtectedRoute: token presente pero sin user, llamando loadMe()...");
      let isMounted = true;
      const loadUser = async () => {
        try {
          const loadedUser = await storeState.loadMe();
          if (!isMounted) return;
          
          // Si loadMe falla después de 5 segundos, redirigir a login
          if (!loadedUser) {
            console.warn("⚠️ ProtectedRoute: loadMe() no devolvió usuario, redirigiendo a login");
            setTimeout(() => {
              if (isMounted && !storeState.user) {
                router.replace(redirectTo);
              }
            }, 1000);
          }
        } catch (error) {
          console.error("🔴 ProtectedRoute: Error en loadMe():", error);
          if (isMounted) {
            // Si hay error, esperar un poco y redirigir si aún no hay user
            setTimeout(() => {
              if (isMounted && !storeState.user) {
                router.replace(redirectTo);
              }
            }, 2000);
          }
        }
      };
      
      loadUser();
      
      return () => {
        isMounted = false;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  // --- useEffect: Manejar redirecciones (solo en cliente) ---
  useEffect(() => {
    // Solo ejecutar en cliente
    if (typeof window === "undefined") return;
    
    // Check localStorage for access_token if Zustand doesn't have it
    const localToken = localStorage.getItem("access_token");
    const hasToken = token || localToken;
    
    // Si no hay token → redirect a login
    if (!hasToken) {
      router.replace(redirectTo);
      return;
    }

    // Si no está autenticado → redirect a login
    if (!isAuthenticated && !localToken) {
      router.replace(redirectTo);
      return;
    }

    // Si hay allowedRoles y el usuario no tiene un rol permitido → redirect a unauthorized
    if (allowedRoles && userRoleName && !allowedRoles.includes(userRoleName)) {
      router.replace("/unauthorized");
      return;
    }
  }, [token, isAuthenticated, userRoleName, allowedRoles, router, redirectTo]);

  // --- Guard: Si no hay token → redirect inmediato (solo en cliente) ---
  if (typeof window !== "undefined" && !token) {
    router.replace(redirectTo);
    return null;
  }

  // --- Guard: Si no está autenticado → redirect (solo en cliente) ---
  if (typeof window !== "undefined" && !isAuthenticated) {
    router.replace(redirectTo);
    return null;
  }

  // --- useEffect: Timeout para evitar loading infinito ---
  useEffect(() => {
    if (!user && token) {
      const timeout = setTimeout(() => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) {
          console.warn("⚠️ [ProtectedRoute] Timeout esperando user (10s), redirigiendo a login");
          router.replace(redirectTo);
        }
      }, 10000); // 10 segundos máximo
      
      return () => clearTimeout(timeout);
    }
  }, [user, token, router, redirectTo]);

  // --- Guard: Si hay token pero no user → mostrar loading mientras carga ---
  if (!user && token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // Verificar organizationId (pero no bloquear indefinidamente)
  if (user && !user.organizationId) {
    console.warn("⚠️ [ProtectedRoute] user.organizationId no está presente, pero continuando");
    // No bloquear, solo advertir - el backend puede manejar esto
  }

  // Verificar que user existe antes de acceder a sus propiedades
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // role ahora es SIEMPRE un objeto { id, name }
  const roleName = user.role?.name?.toLowerCase();

  // Si no hay role pero hay user, permitir paso (el backend puede devolver role como null)
  // Solo bloquear si hay allowedRoles específicos
  if (allowedRoles && allowedRoles.length > 0 && !roleName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
