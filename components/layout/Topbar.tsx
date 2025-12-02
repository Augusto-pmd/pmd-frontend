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
    <header className="h-16 bg-white/20 backdrop-blur-md border-b border-white/20 flex items-center justify-between px-4 lg:px-6">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-white/20 rounded-lg transition-all backdrop-blur-sm"
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
              <p className="text-xs text-gray-600 capitalize">{String(user.role ?? "")}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#162F7F]/70 backdrop-blur-sm flex items-center justify-center text-white font-semibold border border-white/20 shadow-[0_0_10px_rgba(22,47,127,0.3)]">
              {(user.fullName?.charAt(0) || "").toUpperCase()}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm border border-white/20"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
