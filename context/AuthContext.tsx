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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  loadMe: () => Promise<void>;
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
    const initializeAuth = async () => {
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      const storedToken = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
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

            // Update Zustand store
            useAuthStore.setState({
              user: normalizedUser,
              token: storedToken,
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
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await loginService(email, password);
      
      // Normalize user
      let normalizedUser = normalizeUser(response.user);
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

      // Store in Zustand
      loginStore(normalizedUser, response.access_token, response.refresh_token);
    } catch (error) {
      setLoading(false);
      throw error;
    }
    setLoading(false);
  };

  // Logout function
  const logout = () => {
    logoutStore();
  };

  // Refresh function
  const refresh = async () => {
    try {
      const response = await refreshService();
      if (response) {
        if (response.user) {
          let normalizedUser = normalizeUser(response.user);
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
              token: response.access_token,
              refreshToken: response.refresh_token,
              isAuthenticated: true,
            });
          }
        } else {
          // Update tokens only
          useAuthStore.setState({
            token: response.access_token,
            refreshToken: response.refresh_token,
          });
        }
      } else {
        // Refresh failed, logout
        logoutStore();
      }
    } catch (error) {
      logoutStore();
      throw error;
    }
  };

  // LoadMe function
  const loadMe = async () => {
    try {
      const response = await loadMeService();
      if (response && response.user) {
        let normalizedUser = normalizeUser(response.user);
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
            isAuthenticated: true,
          });
        }
      } else {
        // LoadMe failed, try refresh
        await refresh();
      }
    } catch (error) {
      logoutStore();
      throw error;
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

