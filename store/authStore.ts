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
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  setTokens: (token: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
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
      login: (user, token, refreshToken) => {
        // Normalize user.role before persisting
        if (user?.role && typeof user.role === "object") {
          user.role = user.role.name;
        }
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        });
      },
      logout: () => {
        // Limpieza total
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pmd-auth-storage');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
        // Resetear Zustand
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      setTokens: (token, refreshToken) =>
        set({ token, refreshToken }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      loadMe: async () => {
        try {
          const response = await apiClient.get<{ user: User }>("/auth/me");
          const { user } = response;
          
          // Normalize user.role from object to string before persisting
          if (user?.role && typeof user.role === 'object') {
            user.role = user.role.name;
          }
          
          const currentState = get();
          set({
            user,
            isAuthenticated: true,
            // Mantener tokens existentes si ya están
            token: currentState.token,
            refreshToken: currentState.refreshToken,
          });
        } catch (error) {
          // Si falla, limpiar estado
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },
      refreshSession: async () => {
        try {
          const { refreshToken } = get();
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }
          const response = await apiClient.post<{
            access_token: string;
            refresh_token: string;
            user?: User;
          }>("/auth/refresh", { refreshToken });
          const { access_token, refresh_token, user } = response;
          
          // Normalize user.role if user is returned in refresh response
          if (user?.role && typeof user.role === "object") {
            user.role = user.role.name;
          }
          
          set({
            token: access_token,
            refreshToken: refresh_token,
            ...(user && { user }),
          });
        } catch (error) {
          // Si falla el refresh, hacer logout
          get().logout();
          throw error;
        }
      },
    }),
    {
      name: "pmd-auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state?.user && typeof state.user.role === "object") {
          state.user.role = state.user.role.name;
        }
      },
    }
  )
);

