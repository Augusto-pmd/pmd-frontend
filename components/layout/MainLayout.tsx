"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const user = useAuthStore.getState().getUserSafe();
  const router = useRouter();
  const { loadMe } = useAuthStore();

  // Protection: return null if user.role is still an object
  if (user && typeof user.role === "object") {
    return null;
  }

  useEffect(() => {
    // Cargar sesión al montar si no está autenticado
    if (!isAuthenticated) {
      loadMe().catch(() => {
        // Si falla, redirigir a login
        router.push("/login");
      });
    }
  }, [isAuthenticated, loadMe, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

