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
    <header className="h-16 bg-white/30 backdrop-blur-2xl border-b border-white/20 flex items-center justify-between px-4 lg:px-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]" style={{ mixBlendMode: 'luminosity' }}>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden p-2 text-[#3A3A3C] hover:text-[#1C1C1E] hover:bg-white/40 rounded-xl apple-transition backdrop-blur-sm"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop Spacer */}
      <div className="hidden lg:flex flex-1"></div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-[#1C1C1E]">{user.fullName}</p>
              <p className="text-xs text-[#636366] capitalize">{String(user.role ?? "")}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#162F7F] to-[#0A84FF] backdrop-blur-xl flex items-center justify-center text-white font-semibold border border-white/20 shadow-[0_4px_20px_rgba(22,47,127,0.25)]">
              {(user.fullName?.charAt(0) || "").toUpperCase()}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-[#3A3A3C] hover:text-[#1C1C1E] hover:bg-white/40 rounded-xl apple-transition backdrop-blur-sm border border-white/20"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
