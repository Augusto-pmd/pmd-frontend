"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { Menu } from "lucide-react";

export function Topbar() {
  const user = useAuthStore.getState().getUserSafe();
  const logout = useAuthStore.getState().logout;
  const router = useRouter();
  const { toggleMobile } = useSidebar();

  // Asegurar que NINGÚN componente del Dashboard se monte si user no está normalizado
  if (!user || typeof user.role === "object") return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        aria-label="Abrir menú"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop Spacer */}
      <div className="hidden lg:flex flex-1"></div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{String(user.role ?? "")}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-pmd-mediumBlue flex items-center justify-center text-pmd-white font-semibold">
              {(user.fullName?.charAt(0) || "").toUpperCase()}
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
