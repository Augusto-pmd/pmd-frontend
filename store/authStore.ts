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

        const user = normalizeUser(userRaw);
        
        console.log("🟢 [AUTH STORE] User normalized:", user);
        console.log("  - user.id:", user.id);
        console.log("  - user.email:", user.email);
        console.log("  - user.fullName:", user.fullName);
        console.log("  - user.role:", user.role, "(type:", typeof user.role, ")");
        console.log("  - user.role is string:", typeof user.role === "string");
        console.log("  - user.organizationId:", user.organizationId);
        console.log("  - user.organization:", user.organization);
        
        // Validación específica de organizationId
        console.log("🔵 [ORGANIZATION] Usuario cargado:", user);
        if (user.organizationId) {
          console.log("✅ [ORGANIZATION] organizationId presente:", user.organizationId);
        } else {
          console.warn("⚠️ [ORGANIZATION] organizationId NO está presente en el usuario normalizado");
        }

        const newState = {
          user,
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
          document.cookie = `token=${token}; Path=/; Max-Age=604800; SameSite=None; Secure`;
          console.log("🟢 [COOKIE SET] token guardado en cookie");
          console.log("  - Cookie Max-Age: 604800 segundos (7 días)");
          console.log("  - Cookie Path: /");
          console.log("  - Cookie SameSite: None");
          console.log("  - Cookie Secure: true");
          console.log("[COOKIE SET]", document.cookie);
          
          if (refreshToken) {
            document.cookie = `refreshToken=${refreshToken}; Path=/; Max-Age=2592000; SameSite=None; Secure`;
            console.log("🟢 [COOKIE SET] refreshToken guardado en cookie");
            console.log("  - Cookie Max-Age: 2592000 segundos (30 días)");
            console.log("  - Cookie Path: /");
            console.log("  - Cookie SameSite: None");
            console.log("  - Cookie Secure: true");
            console.log("[COOKIE SET]", document.cookie);
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
          
          // Limpiar cookies
          document.cookie = "token=; Path=/; Max-Age=0; SameSite=None; Secure";
          document.cookie = "refreshToken=; Path=/; Max-Age=0; SameSite=None; Secure";
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

        const response = await fetch("/api/auth/profile");
        const data = await response.json();
        const rawUser = data?.user;

        if (!rawUser) throw new Error("No user in response");

        const user = normalizeUser(rawUser);
        console.log("🔵 [ORGANIZATION] Usuario cargado (loadMe):", user);

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
          console.log("🔵 [ORGANIZATION] Usuario cargado (refresh):", user);
          if (user.organizationId) {
            console.log("✅ [ORGANIZATION] organizationId presente (refresh):", user.organizationId);
          } else {
            console.warn("⚠️ [ORGANIZATION] organizationId NO está presente en el usuario normalizado (refresh)");
          }
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
        
        // Actualizar cookies cuando se refresca el token
        if (typeof window !== "undefined" && access_token) {
          document.cookie = `token=${access_token}; Path=/; Max-Age=604800; SameSite=None; Secure`;
          console.log("🟢 [COOKIE SET] token actualizado en cookie (refresh)");
          console.log("[COOKIE SET]", document.cookie);
          
          if (refresh_token) {
            document.cookie = `refreshToken=${refresh_token}; Path=/; Max-Age=2592000; SameSite=None; Secure`;
            console.log("🟢 [COOKIE SET] refreshToken actualizado en cookie (refresh)");
            console.log("[COOKIE SET]", document.cookie);
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
