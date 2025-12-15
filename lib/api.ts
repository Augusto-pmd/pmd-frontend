"use client";

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";
import { normalizeUser } from "@/lib/normalizeUser";

// Helper para obtener header de Authorization
export function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("access_token") || useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Base URL para todas las llamadas API (same-origin)
const baseURL = "/api";

const api: AxiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
  withCredentials: false,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener token de Zustand o localStorage
    const token = useAuthStore.getState().token || 
                  (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Si es FormData, dejar que axios maneje el Content-Type automáticamente
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and errors
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Skip interceptor for login/auth endpoints to prevent refresh loops
    if (original.url?.includes("/auth/login") || original.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshed = await useAuthStore.getState().refresh();

      if (refreshed) {
        original.headers["Authorization"] =
          `Bearer ${localStorage.getItem("access_token")}`;
        return api(original);
      }

      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

// API helper functions
export const apiClient = {
  get: <T = any>(url: string, config?: any) => {
    return api.get<T>(url, config).then((res) => res.data);
  },
  post: <T = any>(url: string, data?: any, config?: any) => {
    return api.post<T>(url, data, config).then((res) => res.data);
  },
  put: <T = any>(url: string, data?: any, config?: any) => {
    return api.put<T>(url, data, config).then((res) => res.data);
  },
  patch: <T = any>(url: string, data?: any, config?: any) => {
    return api.patch<T>(url, data, config).then((res) => res.data);
  },
  delete: <T = any>(url: string, config?: any) => {
    return api.delete<T>(url, config).then((res) => res.data);
  },
};

// Wrapper universal para fetch con Authorization Bearer token
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Obtener token de Zustand o localStorage
  const token = useAuthStore.getState().token || 
                (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  
  // Agregar Authorization Bearer solo si hay token
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: "omit",
  });
}

export default api;
