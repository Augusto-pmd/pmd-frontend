"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser, normalizeUser } from "@/lib/normalizeUser";

export type UserRole = "admin" | "operator" | "auditor";

// SUPER ADMIN TEMPORAL - FALLBACK
// Activar esto si necesitas acceso total cuando no tienes rol asignado
// Una vez que tengas tu rol real asignado, desactivar poniendo: const SUPER_ADMIN_FALLBACK = false;
const SUPER_ADMIN_FALLBACK = true;

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
        let normalizedUser = normalizeUser(u);
        
        // SUPER ADMIN FALLBACK - Solo aplicar si está activo y el usuario no tiene rol válido
        if (SUPER_ADMIN_FALLBACK) {
          const hasValidRole = normalizedUser.role && 
            (normalizedUser.role === "admin" || 
             normalizedUser.role === "operator" || 
             normalizedUser.role === "auditor");
          
          if (!hasValidRole) {
            console.log("🟡 [SUPER ADMIN FALLBACK] Usuario sin rol válido, aplicando fallback 'admin'");
            normalizedUser = {
              ...normalizedUser,
              role: "admin", // "admin" tiene todos los permisos en el ACL
            };
          }
        }
        
        return normalizedUser;
      },

      // --- LOGIN ---
      login: (userRaw: any, token: string, refreshToken?: string) => {
        console.log("🔵 [AUTH STORE BEFORE] Estado ANTES de login():");
        const stateBefore = get();
        console.log("  - isAuthenticated:", stateBefore.isAuthenticated);
        console.log("  - user:", stateBefore.user ? "PRESENT" : "NULL");
        console.log("  - token:", stateBefore.token ? "PRESENT" : "NULL");
        
        console.log("🔵 [AUTH STORE] login() called");
        console.log("  - userRaw:", userRaw);
        console.log("  - token:", token ? "***" : "MISSING");
        console.log("  - refreshToken:", refreshToken ? "***" : "MISSING");
        
        if (!userRaw) {
          console.error("🔴 [AUTH STORE] login() called without userRaw");
          throw new Error("login: userRaw is required");
        }
        
        if (!token) {
          console.error("🔴 [AUTH STORE] login() called without token");
          throw new Error("login: token is required");
        }

        // Normalizar el usuario (normalizeUser ya preserva organizationId y organization)
        const normalizedUser = normalizeUser(userRaw);

        const newState = {
          user: normalizedUser,
          token, // Guardamos como 'token' en el store (estándar interno)
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
        };
        
        console.log("🔵 [AUTH STORE] Actualizando estado con:");
        console.log("  - user:", newState.user ? "PRESENT" : "NULL");
        console.log("  - token:", newState.token ? "***PRESENT***" : "NULL");
        console.log("  - refreshToken:", newState.refreshToken ? "***PRESENT***" : "NULL");
        console.log("  - isAuthenticated:", newState.isAuthenticated);

        set(newState);
        
        // Guardar token en cookies para que el middleware pueda leerlo
        if (typeof window !== "undefined") {
          const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
          
          if (isLocalhost) {
            document.cookie = `token=${token}; Path=/; Max-Age=604800; SameSite=Lax`;
            console.log("🟢 [COOKIE SET] token guardado en cookie (localhost)");
            console.log("  - Cookie Max-Age: 604800 segundos (7 días)");
            console.log("  - Cookie Path: /");
            console.log("  - Cookie SameSite: Lax");
            console.log("  - Cookie Secure: false (localhost)");
            console.log("[COOKIE SET]", document.cookie);
            
            if (refreshToken) {
              document.cookie = `refreshToken=${refreshToken}; Path=/; Max-Age=2592000; SameSite=Lax`;
              console.log("🟢 [COOKIE SET] refreshToken guardado en cookie (localhost)");
              console.log("  - Cookie Max-Age: 2592000 segundos (30 días)");
              console.log("  - Cookie Path: /");
              console.log("  - Cookie SameSite: Lax");
              console.log("  - Cookie Secure: false (localhost)");
              console.log("[COOKIE SET]", document.cookie);
            }
          } else {
            document.cookie = `token=${token}; Path=/; Max-Age=604800; SameSite=None; Secure`;
            console.log("🟢 [COOKIE SET] token guardado en cookie (producción)");
            console.log("  - Cookie Max-Age: 604800 segundos (7 días)");
            console.log("  - Cookie Path: /");
            console.log("  - Cookie SameSite: None");
            console.log("  - Cookie Secure: true");
            console.log("[COOKIE SET]", document.cookie);
            
            if (refreshToken) {
              document.cookie = `refreshToken=${refreshToken}; Path=/; Max-Age=2592000; SameSite=None; Secure`;
              console.log("🟢 [COOKIE SET] refreshToken guardado en cookie (producción)");
              console.log("  - Cookie Max-Age: 2592000 segundos (30 días)");
              console.log("  - Cookie Path: /");
              console.log("  - Cookie SameSite: None");
              console.log("  - Cookie Secure: true");
              console.log("[COOKIE SET]", document.cookie);
            }
          }
        }
        
        const stateAfter = get();
        console.log("🟢 [AUTH STORE AFTER] Estado DESPUÉS de login():");
        console.log("  - isAuthenticated:", stateAfter.isAuthenticated);
        console.log("  - user stored:", stateAfter.user ? "YES" : "NO");
        console.log("  - token stored:", stateAfter.token ? "YES" : "NO");
        console.log("  - refreshToken stored:", stateAfter.refreshToken ? "YES" : "NO");
        
        if (stateAfter.user) {
          console.log("  - user.role:", stateAfter.user.role, "(type:", typeof stateAfter.user.role, ")");
        }
      },

      // --- LOGOUT ---
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("pmd-auth-storage");
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          
          // Limpiar cookies (usar misma lógica que login)
          const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
          
          if (isLocalhost) {
            document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax";
            document.cookie = "refreshToken=; Path=/; Max-Age=0; SameSite=Lax";
          } else {
            document.cookie = "token=; Path=/; Max-Age=0; SameSite=None; Secure";
            document.cookie = "refreshToken=; Path=/; Max-Age=0; SameSite=None; Secure";
          }
          console.log("🟢 [COOKIE CLEAR] cookies eliminadas");
          console.log("[COOKIE SET]", document.cookie);
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

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://pmd-backend-l47d.onrender.com/api";
        const response = await fetch(`${apiUrl}/auth/profile`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          credentials: "include",
        });
        const data = await response.json();
        const rawUser = data?.user;

        if (!rawUser) throw new Error("No user in response");

        // Normalizar el usuario (normalizeUser ya preserva organizationId y organization)
        const normalizedUser = normalizeUser(rawUser);

        set({ user: normalizedUser, isAuthenticated: true });
      },

      // --- REFRESH SESSION ---
      refreshSession: async () => {
        const { token } = get();
        if (!token) throw new Error("No access token");

        // El backend usa GET /api/auth/refresh con JWT en header
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://pmd-backend-l47d.onrender.com/api";
        const response = await fetch(`${apiUrl}/auth/refresh`, {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json" 
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Refresh failed: ${response.status}`);
        }

        const data = await response.json();
        const rawUser = data?.user;
        const access_token = data.access_token || data.token;
        const refresh_token = data.refresh_token || data.refreshToken;

        if (rawUser) {
          // Normalizar el usuario (normalizeUser ya preserva organizationId y organization)
          const normalizedUser = normalizeUser(rawUser);
          
          // Asegurar que organizationId esté presente
          if (!normalizedUser.organizationId) {
            console.warn("⚠️ [refreshSession] organizationId no presente en respuesta, preservando el existente");
            const currentUser = get().user;
            normalizedUser.organizationId = currentUser?.organizationId || undefined;
          }
          
          set({
            user: normalizedUser,
            token: access_token,
            refreshToken: refresh_token ?? null,
            isAuthenticated: true,
          });
        } else {
          // Si no hay user, solo actualizamos tokens (preservar user existente si existe)
          const currentUser = get().user;
          set({
            user: currentUser, // Preservar user existente
            token: access_token,
            refreshToken: refresh_token ?? null,
            isAuthenticated: true,
          });
        }
        
        // Actualizar cookies cuando se refresca el token
        if (typeof window !== "undefined" && access_token) {
          const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
          
          if (isLocalhost) {
            document.cookie = `token=${access_token}; Path=/; Max-Age=604800; SameSite=Lax`;
            console.log("🟢 [COOKIE SET] token actualizado en cookie (refresh, localhost)");
            console.log("[COOKIE SET]", document.cookie);
            
            if (refresh_token) {
              document.cookie = `refreshToken=${refresh_token}; Path=/; Max-Age=2592000; SameSite=Lax`;
              console.log("🟢 [COOKIE SET] refreshToken actualizado en cookie (refresh, localhost)");
              console.log("[COOKIE SET]", document.cookie);
            }
          } else {
            document.cookie = `token=${access_token}; Path=/; Max-Age=604800; SameSite=None; Secure`;
            console.log("🟢 [COOKIE SET] token actualizado en cookie (refresh, producción)");
            console.log("[COOKIE SET]", document.cookie);
            
            if (refresh_token) {
              document.cookie = `refreshToken=${refresh_token}; Path=/; Max-Age=2592000; SameSite=None; Secure`;
              console.log("🟢 [COOKIE SET] refreshToken actualizado en cookie (refresh, producción)");
              console.log("[COOKIE SET]", document.cookie);
            }
          }
        }
      },
    }),
    {
      name: "pmd-auth-storage",

      // --- REHIDRATACIÓN SEGURA ---
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          try {
            // Normalizar el usuario (normalizeUser ya preserva organizationId y organization)
            const normalizedUser = normalizeUser(state.user);
            state.user = normalizedUser;
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
