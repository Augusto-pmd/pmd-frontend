"use client";

/**
 * AuthContext - React Context wrapper around Zustand store
 * Provides React Context API compatibility while using Zustand as source of truth
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuthStore, AuthUser } from "@/store/authStore";
import { login as loginService, loadMe as loadMeService, refresh as refreshService } from "@/lib/services/authService";
import { normalizeUser } from "@/lib/normalizeUser";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refresh: () => Promise<AuthUser | null>;
  loadMe: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  
  // Get Zustand store state
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loginStore = useAuthStore((state) => state.login);
  const logoutStore = useAuthStore((state) => state.logout);
  const loadMeStore = useAuthStore((state) => state.loadMe);
  const refreshSessionStore = useAuthStore((state) => state.refreshSession);

  // Initialize: Load user from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const u = localStorage.getItem("user");
    const t = localStorage.getItem("access_token");

    if (u && t) {
      try {
        const parsedUser = JSON.parse(u);
        let normalizedUser = normalizeUser(parsedUser);
        
        if (normalizedUser) {
          // Normalize role and organization
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

          useAuthStore.setState({
            user: normalizedUser,
            token: t,
            refreshToken: localStorage.getItem("refresh_token"),
            isAuthenticated: true,
          });
        }
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      const response = await loginService(email, password);

      const { user, access_token, refresh_token } = response;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", JSON.stringify(user));

      // Normalize user
      let normalizedUser = normalizeUser(user);
      if (!normalizedUser) {
        throw new Error("Failed to normalize user");
      }

      // Normalize role and organization
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

      useAuthStore.setState({
        user: normalizedUser,
        token: access_token,
        refreshToken: refresh_token,
        isAuthenticated: true,
      });

      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      useAuthStore.setState({ isAuthenticated: false });
      return false;
    }
  };

  // Logout function
  const logout = () => {
    logoutStore();
  };

  // Refresh function
  const refresh = async () => {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const result = await refreshService(refreshToken);

      if (!result) {
        logout();
        return null;
      }

      const { user, access_token, refresh_token } = result;

      if (!access_token) {
        logout();
        return null;
      }

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token || refreshToken);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      let normalizedUser: AuthUser | null = null;
      if (user) {
        normalizedUser = normalizeUser(user);
        if (normalizedUser) {
          // Normalize role and organization
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
        }
      }

      // If no user in response, try to get from localStorage or keep current
      if (!normalizedUser) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            normalizedUser = normalizeUser(JSON.parse(storedUser));
          } catch {
            // Keep current user from store
            normalizedUser = useAuthStore.getState().user;
          }
        } else {
          normalizedUser = useAuthStore.getState().user;
        }
      }

      useAuthStore.setState({
        user: normalizedUser,
        token: access_token,
        refreshToken: refresh_token || refreshToken,
        isAuthenticated: true,
      });

      return normalizedUser;
    } catch (error) {
      logout();
      return null;
    }
  };

  // LoadMe function
  const loadMe = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      useAuthStore.setState({ user: null, isAuthenticated: false });
      setLoading(false);
      return null;
    }

    try {
      const response = await loadMeService();
      
      if (!response || !response.user) {
        // Try refresh
        try {
          const refreshedUser = await refresh();
          return refreshedUser;
        } catch {
          logout();
          return null;
        }
      }

      let normalizedUser = normalizeUser(response.user);
      if (!normalizedUser) {
        // Try refresh
        try {
          const refreshedUser = await refresh();
          return refreshedUser;
        } catch {
          logout();
          return null;
        }
      }

      // Normalize role and organization
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

      useAuthStore.setState({
        user: normalizedUser,
        isAuthenticated: true,
      });
      setLoading(false);

      return normalizedUser;
    } catch (err) {
      // Try refresh
      try {
        const refreshedUser = await refresh();
        return refreshedUser;
      } catch {
        logout();
        return null;
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refresh,
    loadMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

