import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function useMe() {
  const { user, isAuthenticated, loadMe } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !user) {
      loadMe().catch(() => {
        // Silently fail if not authenticated
      });
    }
  }, [isAuthenticated, user, loadMe]);

  return { user, isAuthenticated };
}

