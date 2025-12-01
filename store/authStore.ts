import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser, normalizeUser } from "@/lib/normalizeUser";

export type UserRole = "admin" | "operator" | "auditor";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  getUserSafe: () => AuthUser | null;
  login: (userRaw: any, token: string, refreshToken?: string) => void;
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
        // Ya debería venir normalizado, pero aseguramos por las dudas:
        return normalizeUser(u);
      },

      // --- LOGIN ---
      login: (userRaw: any, token: string, refreshToken?: string) => {
        const user = normalizeUser(userRaw);

        set({
          user,
          token,
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
        });
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
        const rawUser = data?.user;

        if (!rawUser) throw new Error("No user in response");

        const user = normalizeUser(rawUser);

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
        const rawUser = data?.user;
        const access_token = data.access_token || data.token;
        const refresh_token = data.refresh_token || data.refreshToken;

        if (rawUser) {
          const user = normalizeUser(rawUser);
          set({
            user,
            token: access_token,
            refreshToken: refresh_token ?? null,
            isAuthenticated: true,
          });
        } else {
          // Si no hay user, solo actualizamos tokens
          set({
            token: access_token,
            refreshToken: refresh_token ?? null,
            isAuthenticated: true,
          });
        }
      },
    }),
    {
      name: "pmd-auth-storage",

      // --- REHIDRATACIÓN SEGURA ---
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          try {
            state.user = normalizeUser(state.user);
          } catch {
            // Si falla la normalización, limpiamos el estado
            state.user = null;
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);
