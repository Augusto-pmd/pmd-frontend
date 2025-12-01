import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/lib/api";

export type UserRole = "admin" | "operator" | "auditor";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  getUserSafe: () => User | null;
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  loadMe: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      // --- SELECTOR SEGURO ---
      getUserSafe: () => {
        const u = get().user;
        if (!u) return null;
        if (typeof u.role === "object") {
          return { ...u, role: u.role.name };
        }
        return u;
      },

      // --- LOGIN ---
      login: (user, token, refreshToken) => {
        if (user?.role && typeof user.role === "object") {
          user = { ...user, role: user.role.name };
        }
        set({ user, token, refreshToken, isAuthenticated: true });
      },

      // --- LOGOUT ---
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("pmd-auth-storage");
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      // --- LOAD ME ---
      loadMe: async () => {
        const token = get().token;
        if (!token) throw new Error("No token");

        const response = await fetch("/api/auth/profile");
        const data = await response.json();
        let user = data?.user;

        if (user?.role && typeof user.role === "object") {
          user = { ...user, role: user.role.name };
        }

        set({ user, isAuthenticated: true });
      },

      // --- REFRESH SESSION ---
      refreshSession: async () => {
        const { refreshToken } = get();
        if (!refreshToken) throw new Error("No refresh token");

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
          credentials: "include",
        });

        const data = await response.json();
        let user = data?.user;

        // Normalize user.role before setting
        if (user?.role && typeof user.role === "object") {
          user = { ...user, role: user.role.name };
        }

        set({
          token: data.access_token || data.token,
          refreshToken: data.refresh_token || data.refreshToken,
          ...(user && { user }),
          isAuthenticated: true,
        });
      },
    }),
    {
      name: "pmd-auth-storage",

      // --- REHIDRATACIÓN SEGURA ---
      onRehydrateStorage: () => (state) => {
        if (state?.user && typeof state.user.role === "object") {
          state.user.role = state.user.role.name;
        }
      },
    }
  )
);

