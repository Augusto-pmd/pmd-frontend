"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser, normalizeUser } from "@/lib/normalizeUser";
import { login as loginService, refresh as refreshService, loadMe as loadMeService } from "@/lib/services/authService";

// Re-export AuthUser for convenience
export type { AuthUser };

// UserRole type
export type UserRole = "admin" | "operator" | "auditor" | "administrator";

// Helper function to normalize user with role and organization
// NO sobrescribe permissions si ya existen - solo preserva lo que viene del backend
function normalizeUserWithDefaults(user: any): AuthUser | null {
  const normalized = normalizeUser(user);
  if (!normalized) {
    return null;
  }

  // Normalize role - NO sobrescribir permissions si ya existen
  if (!normalized.role || typeof normalized.role.name !== "string") {
    normalized.role = {
      id: normalized.role?.id || "1",
      name: "ADMINISTRATION",
      permissions: normalized.role?.permissions || [], // Preservar permissions existentes o array vacío
    };
  } else {
    // Asegurar que permissions siempre esté presente como array (pero NO sobrescribir si ya existe)
    if (!normalized.role.permissions || !Array.isArray(normalized.role.permissions)) {
      normalized.role.permissions = []; // Solo inicializar si no existe, no inferir
    }
    // Si permissions ya existe y es array válido, se preserva tal cual
  }

  // Normalize organization
  if (!normalized.organization) {
    normalized.organization = {
      id: normalized.organizationId || "1",
      name: "PMD Arquitectura",
    };
  }

  return normalized;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  logout: () => void;
  refreshSession: () => Promise<AuthUser | null>;
  refresh: () => Promise<AuthUser | null>;
  loadMe: () => Promise<AuthUser | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      // --- LOGIN ---
      login: async (email: string, password: string): Promise<AuthUser | null> => {
        try {
          const response = await loginService(email, password);
          
          if (!response) {
            return null;
          }

          const { user, access_token, refresh_token } = response;

          if (!user || !access_token) {
            return null;
          }

          // Normalize user
          const normalizedUser = normalizeUserWithDefaults(user);
          if (!normalizedUser) {
            return null;
          }

          // Store in localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);
            localStorage.setItem("user", JSON.stringify(normalizedUser));
          }

          // Update Zustand with immutable set
          set((state) => ({
            ...state,
            user: normalizedUser,
            token: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
          }));

          return normalizedUser;
        } catch (error) {
          // On error, clear state
          set((state) => ({
            ...state,
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          }));
          return null;
        }
      },

      // --- LOGOUT ---
      logout: () => {
        // Clear localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("pmd-auth-storage");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
        }

        // Update Zustand with immutable set
        set((state) => ({
          ...state,
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }));
      },

      // --- REFRESH SESSION ---
      refreshSession: async (): Promise<AuthUser | null> => {
        // Read refresh_token from localStorage
        const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
        if (!refreshToken) {
          return null;
        }

        try {
          // Call refreshService
          const result = await refreshService(refreshToken);
          
          if (!result) {
            return null;
          }

          if (!result.access_token) {
            return null;
          }

          const { user, access_token, refresh_token } = result;

          // Normalize user if present
          let normalizedUser: AuthUser | null = null;
          if (user) {
            normalizedUser = normalizeUserWithDefaults(user);
          }

          // If no user in response, try to get from localStorage or keep current
          if (!normalizedUser) {
            if (typeof window !== "undefined") {
              const storedUser = localStorage.getItem("user");
              if (storedUser) {
                try {
                  normalizedUser = normalizeUserWithDefaults(JSON.parse(storedUser));
                } catch {
                  // If parsing fails, get current user from state
                  normalizedUser = null;
                }
              }
            }
            // If still no user, we'll keep the current user from state
            if (!normalizedUser) {
              // Get current user from state using get()
              normalizedUser = get().user;
            }
          }

          // Store tokens in localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", access_token);
            if (refresh_token) {
              localStorage.setItem("refresh_token", refresh_token);
            }
            if (normalizedUser) {
              localStorage.setItem("user", JSON.stringify(normalizedUser));
            }
          }

          // Update Zustand with immutable set
          set((state) => ({
            ...state,
            user: normalizedUser || state.user, // Keep current user if no new user
            token: access_token,
            refreshToken: refresh_token || refreshToken,
            isAuthenticated: true,
          }));

          return normalizedUser || get().user;
        } catch (error) {
          return null;
        }
      },

      // --- REFRESH (alias for refreshSession, for interceptor use) ---
      refresh: async (): Promise<AuthUser | null> => {
        return get().refreshSession();
      },

      // --- LOAD ME ---
      loadMe: async (): Promise<AuthUser | null> => {
        try {
          // Call loadMeService
          const response = await loadMeService();
          
          if (!response) {
            // Try refresh if loadMe fails
            const refreshed = await get().refreshSession();
            return refreshed;
          }

          if (!response.user) {
            // Try refresh if loadMe fails
            const refreshed = await get().refreshSession();
            return refreshed;
          }

          // Normalize user
          const normalizedUser = normalizeUserWithDefaults(response.user);
          if (!normalizedUser) {
            // Try refresh if normalization fails
            const refreshed = await get().refreshSession();
            return refreshed;
          }

          // Store in localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(normalizedUser));
          }

          // Update Zustand with immutable set
          set((state) => ({
            ...state,
            user: normalizedUser,
            isAuthenticated: true,
          }));

          return normalizedUser;
        } catch (error) {
          // Try refresh on error
          try {
            const refreshed = await get().refreshSession();
            return refreshed;
          } catch {
            // If refresh also fails, clear state and return null
            set((state) => ({
              ...state,
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
            }));
            return null;
          }
        }
      },
    }),
    {
      name: "pmd-auth-storage",
      onRehydrateStorage: () => (state) => {
        // Ensure state is never undefined
        if (!state) {
          return;
        }

        // Try to load from localStorage if Zustand doesn't have data
        if (typeof window !== "undefined") {
          const storedToken = localStorage.getItem("access_token");
          const storedRefreshToken = localStorage.getItem("refresh_token");
          const storedUser = localStorage.getItem("user");

          if (storedToken && storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              const normalizedUser = normalizeUserWithDefaults(parsedUser);
              if (normalizedUser) {
                // In onRehydrateStorage, we can mutate state directly (Zustand allows this)
                state.user = normalizedUser;
                state.token = storedToken;
                state.refreshToken = storedRefreshToken;
                state.isAuthenticated = true;
              }
            } catch {
              // If parsing fails, clear state
              state.user = null;
              state.token = null;
              state.refreshToken = null;
              state.isAuthenticated = false;
            }
          }
        }

        // Normalize existing user in state
        if (state.user) {
          try {
            const normalizedUser = normalizeUserWithDefaults(state.user);
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
