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

// Función universal para obtener API_URL
export function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;

  if (!url || typeof url !== "string" || url.trim() === "") {
    if (typeof window !== "undefined") {
      // Solo loguear en cliente para evitar ruido en build
      console.error("❌ [getApiUrl] NEXT_PUBLIC_API_URL no está definida en runtime.");
      console.error("❌ [getApiUrl] Por favor, configura NEXT_PUBLIC_API_URL en tu archivo .env.local");
      console.error("❌ [getApiUrl] Ejemplo: NEXT_PUBLIC_API_URL=https://pmd-backend-8d4a.onrender.com/api");
    }
    
    // Fallback para desarrollo/producción
    const fallbackUrl = "https://pmd-backend-8d4a.onrender.com/api";
    if (typeof window !== "undefined") {
      console.warn("⚠️ [getApiUrl] Usando URL de fallback:", fallbackUrl);
    }
    return fallbackUrl;
  }

  // Normalizar URL: eliminar /api duplicado si existe
  let normalizedUrl = url.trim();
  
  // Si ya termina en /api, devolverla tal cual
  if (normalizedUrl.endsWith("/api")) {
    return normalizedUrl;
  }
  
  // Si termina en /api/, eliminar la barra final
  if (normalizedUrl.endsWith("/api/")) {
    return normalizedUrl.slice(0, -1);
  }
  
  // Si no termina en /api, agregarlo
  return `${normalizedUrl}/api`;
}


// Construir API_URL usando getApiUrl() - ahora siempre devuelve una string válida
const API_URL = getApiUrl();
const baseURL = API_URL; // getApiUrl() siempre devuelve una string válida

const api: AxiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
  withCredentials: false, // Backend usa JWT por header, no cookies
});

// Request interceptor - Add auth token and validate URLs
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
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshed = await useAuthStore.getState().refreshSession();

      if (refreshed) {
        const newToken = localStorage.getItem("access_token");
        if (newToken && original.headers) {
          original.headers["Authorization"] = `Bearer ${newToken}`;
        }
        return api(original);
      } else {
        useAuthStore.getState().logout();
      }
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
    credentials: "omit", // Backend usa JWT por header, no cookies
  });
}

// Exportar API_URL para uso en otros módulos
export { API_URL };

export default api;
