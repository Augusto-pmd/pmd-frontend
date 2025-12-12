"use client";

/**
 * AuthContext - React Context wrapper around Zustand store
 * Provides React Context API compatibility while using Zustand as source of truth
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuthStore, AuthUser } from "@/store/authStore";

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

  // Initialize: Store handles rehydration via persist middleware
  useEffect(() => {
    // Store will automatically rehydrate from localStorage
    // Just set loading to false after a brief delay to allow rehydration
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Login function - uses store's login method
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await loginStore(email, password);
      setLoading(false);
      return user !== null;
    } catch (err) {
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    logoutStore();
  };

  // Refresh function - uses store's refreshSession method
  const refresh = async () => {
    try {
      const user = await refreshSessionStore();
      return user;
    } catch (error) {
      logout();
      return null;
    }
  };

  // LoadMe function - uses store's loadMe method
  const loadMe = async () => {
    try {
      const user = await loadMeStore();
      return user;
    } catch (error) {
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

