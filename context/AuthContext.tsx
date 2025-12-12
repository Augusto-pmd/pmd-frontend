"use client";

/**
 * AuthContext - React Context wrapper around Zustand store
 * Provides React Context API compatibility while using Zustand as source of truth
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuthStore, AuthUser } from "@/store/authStore";
import { login as loginService, refresh as refreshService, loadMe as loadMeService } from "@/lib/services/authService";
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
  const logoutStore = useAuthStore((state) => state.logout);

  // Initialize: Store handles rehydration via persist middleware
  useEffect(() => {
    // Store will automatically rehydrate from localStorage
    // Ensure loading always ends, even if normalization fails
    try {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    } catch {
      // If anything fails, ensure loading is set to false
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      const response = await loginService(email, password);

      if (!response) {
        setLoading(false);
        return false;
      }

      const { user, access_token, refresh_token } = response;

      if (!access_token || !user) {
        setLoading(false);
        return false;
      }

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", JSON.stringify(user));

      const normalized = normalizeUser(user) || user;

      useAuthStore.setState({
        user: normalized,
        token: access_token,
        refreshToken: refresh_token,
        isAuthenticated: true,
      });

      setLoading(false);
      return true;
    } catch (e) {
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    logoutStore();
  };

  // Refresh function
  const refresh = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) return null;

      const result = await refreshService(refreshToken);
      if (!result) return null;

      const { user, access_token, refresh_token } = result;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      const normalized = user ? (normalizeUser(user) || user) : useAuthStore.getState().user;

      useAuthStore.setState({
        user: normalized,
        token: access_token,
        refreshToken: refresh_token,
        isAuthenticated: true,
      });

      return normalized;
    } catch {
      return null;
    }
  };

  // LoadMe function
  const loadMe = async () => {
    try {
      const response = await loadMeService();
      if (response?.user) {
        const normalized = normalizeUser(response.user) || response.user;
        useAuthStore.setState({ user: normalized, isAuthenticated: true });
        return normalized;
      }

      const refreshed = await refresh();
      return refreshed;
    } catch {
      return null;
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

