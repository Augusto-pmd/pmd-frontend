import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function useMe() {
  const { user, isAuthenticated, loadMe } = useAuthStore();

  useEffect(() => {
    // No bloquear render del login - solo intentar loadMe si hay token
    const token = useAuthStore.getState().token;
    if (!isAuthenticated && !user && token) {
      loadMe().catch((error) => {
        // Silently fail si no está autenticado o hay error
        // No bloquear el render del login
        console.warn("⚠️ [useMe] Error al cargar perfil (no bloquea render):", error);
      });
    }
  }, [isAuthenticated, user, loadMe]);

  return { user, isAuthenticated };
}

