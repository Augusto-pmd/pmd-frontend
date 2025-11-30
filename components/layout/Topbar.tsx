"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export function Topbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Llamar a /auth/logout del backend si existe
      await api.post("/auth/logout").catch(() => {
        // Ignorar errores si el endpoint no existe
      });
    } catch (error) {
      // Ignorar errores
    } finally {
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('pmd-auth-storage');
      }
      logout();
      // Limpiar cookies
      if (typeof document !== "undefined") {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      router.push("/login");
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex-1"></div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{String(user.role ?? '')}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-pmd-mediumBlue flex items-center justify-center text-pmd-white font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-pmd transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

