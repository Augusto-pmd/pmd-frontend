"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser, normalizeUser } from "@/lib/normalizeUser";

// UserRole ahora es el nombre del rol (string) para comparaciones
export type UserRole = "admin" | "operator" | "auditor" | "administrator";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  getUserSafe: () => AuthUser | null;
  login: (userRaw: unknown, token: string, refreshToken?: string) => void;
  logout: () => void;
  loadMe: () => Promise<void>;
  refreshSession: () => Promise<void>;
  syncAuth: () => Promise<void>;
  hydrateUser: () => Promise<void>;
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
        const normalized = normalizeUser(u);
        return normalized;
      },

      // --- LOGIN ---
      login: (userRaw: unknown, token: string, refreshToken?: string) => {
        if (!userRaw) {
          throw new Error("login: userRaw is required");
        }
        
        if (!token) {
          throw new Error("login: token is required");
        }

        // Normalizar el usuario
        const normalizedUser = normalizeUser(userRaw);
        if (!normalizedUser) {
          throw new Error("login: failed to normalize user");
        }

        set({
          user: normalizedUser,
          token,
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
        });
      },

      // --- LOGOUT ---
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("pmd-auth-storage");
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
        if (!token) {
          throw new Error("No token");
        }
        
        try {
          const { getApiUrl, apiFetch } = await import("@/lib/api");
          const apiUrl = getApiUrl();
          const response = await apiFetch(`${apiUrl}/users/me`, {
            method: "GET",
          });

          if (!response.ok) {
            if (response.status === 401) {
              get().logout();
              if (typeof window !== "undefined") {
                window.location.href = "/login";
              }
              return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json().catch(() => ({}));
          const rawUser = data?.user ?? data;

          if (!rawUser) {
            return;
          }

          const normalizedUser = normalizeUser(rawUser);
          if (normalizedUser) {
            set({ user: normalizedUser, isAuthenticated: true });
          }
        } catch (error: unknown) {
          if (typeof window === "undefined") {
            return;
          }
          
          set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
          throw error;
        }
      },

      // --- REFRESH SESSION ---
      refreshSession: async () => {
        const { token } = get();
        if (!token) {
          throw new Error("No access token");
        }
        
        try {
          const { getApiUrl, apiFetch } = await import("@/lib/api");
          const apiUrl = getApiUrl();
          const response = await apiFetch(`${apiUrl}/auth/refresh`, {
            method: "GET",
          });

          if (!response.ok) {
            throw new Error(`Refresh failed: ${response.status}`);
          }

          const data = await response.json().catch(() => ({}));
          const rawUser = data?.user ?? data;
          const access_token = data.access_token || data.token;
          const refresh_token = data.refresh_token || data.refreshToken;
          
          if (!access_token) {
            throw new Error("No access token in refresh response");
          }

          if (rawUser) {
            const normalizedUser = normalizeUser(rawUser);
            if (normalizedUser) {
              set({
                user: normalizedUser,
                token: access_token,
                refreshToken: refresh_token ?? null,
                isAuthenticated: true,
              });
            } else {
              const currentUser = get().user;
              set({
                user: currentUser,
                token: access_token,
                refreshToken: refresh_token ?? null,
                isAuthenticated: currentUser ? true : false,
              });
            }
          } else {
            const currentUser = get().user;
            set({
              user: currentUser,
              token: access_token,
              refreshToken: refresh_token ?? null,
              isAuthenticated: currentUser ? true : false,
            });
          }
        } catch (error: unknown) {
          if (typeof window === "undefined") {
            return;
          }
          throw error;
        }
      },

      // --- SYNC AUTH ---
      syncAuth: async () => {
        const currentToken = get().token;
        if (!currentToken) {
          set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
          return;
        }

        try {
          await get().loadMe();
        } catch (error) {
          set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
        }
      },

      // --- HYDRATE USER --- (alias for loadMe)
      hydrateUser: async () => {
        await get().loadMe();
      },
    }),
    {
      name: "pmd-auth-storage",

      // --- REHIDRATACIÓN SEGURA ---
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          try {
            const normalizedUser = normalizeUser(state.user);
            if (normalizedUser) {
              state.user = normalizedUser;
            } else {
              state.user = null;
              state.isAuthenticated = false;
            }
          } catch {
            state.user = null;
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);
