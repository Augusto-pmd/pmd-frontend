"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser, normalizeUser } from "@/lib/normalizeUser";

// Re-export AuthUser for convenience
export type { AuthUser };

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
  refresh: () => Promise<AuthUser | null>;
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
        let normalizedUser = normalizeUser(userRaw);
        if (!normalizedUser) {
          throw new Error("login: failed to normalize user");
        }

        // Normalizar role y organization inmediatamente (evita crashes)
        if (!normalizedUser.role || typeof normalizedUser.role.name !== "string") {
          normalizedUser.role = {
            id: normalizedUser.role?.id || "1",
            name: "ADMINISTRATION",
          };
        }
        if (!normalizedUser.organization) {
          normalizedUser.organization = {
            id: normalizedUser.organizationId || "1",
            name: "PMD Arquitectura",
          };
        }

        // Almacenar en Zustand
        set({
          user: normalizedUser,
          token,
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
        });

        // Almacenar también en localStorage para compatibilidad
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", token);
          if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken);
          }
          localStorage.setItem("user", JSON.stringify(normalizedUser));
        }
      },

      // --- LOGOUT ---
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("pmd-auth-storage");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
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
        const token = get().token || (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
        if (!token) {
          throw new Error("No token");
        }
        
        try {
          const { getApiUrl, apiFetch } = await import("@/lib/api");
          const apiUrl = getApiUrl();
          const response = await apiFetch(`${apiUrl}/users/me`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            if (response.status === 401) {
              // Intentar refresh antes de logout
              try {
                await get().refreshSession();
                // Reintentar /users/me después del refresh
                const retryResponse = await apiFetch(`${apiUrl}/users/me`, {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${get().token || localStorage.getItem("access_token")}`,
                  },
                });
                if (retryResponse.ok) {
                  const retryData = await retryResponse.json().catch(() => ({}));
                  const retryUser = retryData?.user ?? retryData;
                  if (retryUser) {
                    let normalizedUser = normalizeUser(retryUser);
                    if (normalizedUser) {
                      // Normalizar role y organization
                      if (!normalizedUser.role || typeof normalizedUser.role.name !== "string") {
                        normalizedUser.role = { id: normalizedUser.role?.id || "1", name: "ADMINISTRATION" };
                      }
                      if (!normalizedUser.organization) {
                        normalizedUser.organization = { id: normalizedUser.organizationId || "1", name: "PMD Arquitectura" };
                      }
                      set({ user: normalizedUser, isAuthenticated: true });
                      if (typeof window !== "undefined") {
                        localStorage.setItem("user", JSON.stringify(normalizedUser));
                      }
                    }
                  }
                  return;
                }
              } catch (refreshError) {
                // Refresh falló, hacer logout
                get().logout();
                if (typeof window !== "undefined") {
                  window.location.href = "/login";
                }
                return;
              }
              // Si llegamos aquí, refresh no funcionó
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

          let normalizedUser = normalizeUser(rawUser);
          if (normalizedUser) {
            // Normalizar role y organization inmediatamente
            if (!normalizedUser.role || typeof normalizedUser.role.name !== "string") {
              normalizedUser.role = { id: normalizedUser.role?.id || "1", name: "ADMINISTRATION" };
            }
            if (!normalizedUser.organization) {
              normalizedUser.organization = { id: normalizedUser.organizationId || "1", name: "PMD Arquitectura" };
            }
            set({ user: normalizedUser, isAuthenticated: true });
            if (typeof window !== "undefined") {
              localStorage.setItem("user", JSON.stringify(normalizedUser));
            }
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
        const refreshToken = get().refreshToken || (typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null);
        if (!refreshToken) {
          throw new Error("No refresh token");
        }
        
        try {
          const { getApiUrl, apiFetch } = await import("@/lib/api");
          const apiUrl = getApiUrl();
          const response = await apiFetch(`${apiUrl}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (!response.ok) {
            throw new Error("Refresh token failed"); // Refresh falló
          }

          const data = await response.json().catch(() => ({}));
          const rawUser = data?.user ?? data;
          const access_token = data.access_token || data.token;
          const refresh_token = data.refresh_token || data.refreshToken;
          
          if (!access_token) {
            throw new Error("No access token in refresh response"); // No access token en respuesta
          }

          // Almacenar tokens
          set({
            token: access_token,
            refreshToken: refresh_token ?? refreshToken,
          });

          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", access_token);
            if (refresh_token) {
              localStorage.setItem("refresh_token", refresh_token);
            }
          }

          // Si hay user en la respuesta, normalizarlo y actualizar
          if (rawUser) {
            let normalizedUser = normalizeUser(rawUser);
            if (normalizedUser) {
              // Normalizar role y organization
              if (!normalizedUser.role || typeof normalizedUser.role.name !== "string") {
                normalizedUser.role = { id: normalizedUser.role?.id || "1", name: "ADMINISTRATION" };
              }
              if (!normalizedUser.organization) {
                normalizedUser.organization = { id: normalizedUser.organizationId || "1", name: "PMD Arquitectura" };
              }
              set({
                user: normalizedUser,
                isAuthenticated: true,
              });
              if (typeof window !== "undefined") {
                localStorage.setItem("user", JSON.stringify(normalizedUser));
              }
              // No return - function is void
            }
          }

          // Si no hay user, preservar el actual (ya está en el state)
          // No return - function is void
        } catch (error: unknown) {
          // Re-throw error to be handled by caller
          throw error;
        }
      },

      // --- REFRESH (returns user) ---
      refresh: async () => {
        const refreshToken = get().refreshToken || (typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null);
        if (!refreshToken) {
          return null;
        }
        
        try {
          const { refresh: refreshService } = await import("@/lib/services/authService");
          const result = await refreshService(refreshToken);
          
          if (!result || !result.access_token) {
            return null;
          }

          const { user, access_token, refresh_token } = result;

          // Store tokens
          set({
            token: access_token,
            refreshToken: refresh_token ?? refreshToken,
          });

          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", access_token);
            if (refresh_token) {
              localStorage.setItem("refresh_token", refresh_token);
            }
          }

          // If there's a user in response, normalize and update
          if (user) {
            let normalizedUser = normalizeUser(user);
            if (normalizedUser) {
              // Normalize role and organization
              if (!normalizedUser.role || typeof normalizedUser.role.name !== "string") {
                normalizedUser.role = { id: normalizedUser.role?.id || "1", name: "ADMINISTRATION" };
              }
              if (!normalizedUser.organization) {
                normalizedUser.organization = { id: normalizedUser.organizationId || "1", name: "PMD Arquitectura" };
              }
              set({
                user: normalizedUser,
                isAuthenticated: true,
              });
              if (typeof window !== "undefined") {
                localStorage.setItem("user", JSON.stringify(normalizedUser));
              }
              return normalizedUser;
            }
          }

          // If no user in response, return current user
          return get().user;
        } catch (error: unknown) {
          return null;
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
        // Ensure state is never undefined
        if (!state) {
          return;
        }

        // Intentar cargar desde localStorage si Zustand no tiene datos
        if (typeof window !== "undefined") {
          const storedToken = localStorage.getItem("access_token");
          const storedRefreshToken = localStorage.getItem("refresh_token");
          const storedUser = localStorage.getItem("user");
          
          if (storedToken && storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              let normalizedUser = normalizeUser(parsedUser);
              if (normalizedUser) {
                // Normalizar role y organization
                if (!normalizedUser.role || typeof normalizedUser.role.name !== "string") {
                  normalizedUser.role = { id: normalizedUser.role?.id || "1", name: "ADMINISTRATION" };
                }
                if (!normalizedUser.organization) {
                  normalizedUser.organization = { id: normalizedUser.organizationId || "1", name: "PMD Arquitectura" };
                }
                state.user = normalizedUser;
                state.token = storedToken;
                state.refreshToken = storedRefreshToken;
                state.isAuthenticated = true;
              }
            } catch {
              // Si falla, limpiar
              state.user = null;
              state.token = null;
              state.refreshToken = null;
              state.isAuthenticated = false;
            }
          }
        }
        
        // Normalizar user existente en state
        if (state.user) {
          try {
            let normalizedUser = normalizeUser(state.user);
            if (normalizedUser) {
              // Normalizar role y organization
              if (!normalizedUser.role || typeof normalizedUser.role.name !== "string") {
                normalizedUser.role = { id: normalizedUser.role?.id || "1", name: "ADMINISTRATION" };
              }
              if (!normalizedUser.organization) {
                normalizedUser.organization = { id: normalizedUser.organizationId || "1", name: "PMD Arquitectura" };
              }
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
