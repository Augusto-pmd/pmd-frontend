"use client";

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";
import { normalizeUser } from "@/lib/normalizeUser";

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
    // getApiUrl() siempre devuelve una string válida (con fallback si es necesario)
    const apiUrl = getApiUrl();
    
    const token = useAuthStore.getState().token;
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
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - try refresh token once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = useAuthStore.getState().token;
        if (token) {
          const apiUrl = getApiUrl();
          const refreshURL = `${apiUrl}/auth/refresh`;
          
          const response = await axios.get(refreshURL, {
            withCredentials: false,
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          const { user: rawUser, access_token: newToken, refresh_token: newRefreshToken } = response.data || {};
          
          if (newToken) {
            if (rawUser) {
              const user = normalizeUser(rawUser);
              if (user) {
                useAuthStore.setState({
                  user,
                  token: newToken,
                  refreshToken: newRefreshToken,
                  isAuthenticated: true,
                });
              } else {
                useAuthStore.setState({
                  token: newToken,
                  refreshToken: newRefreshToken,
                });
              }
            } else {
              useAuthStore.setState({
                token: newToken,
                refreshToken: newRefreshToken,
              });
            }

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    // Handle 401 - logout user
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    // Normalize error response
    const normalizedError = {
      message:
        (error.response?.data as { message?: string })?.message ||
        (error.response?.data as { error?: string })?.error ||
        error.message ||
        "An error occurred",
      status: error.response?.status || 500,
      data: error.response?.data,
      originalError: error,
    };
    
    return Promise.reject(normalizedError);
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
  const token = useAuthStore.getState().token;
  
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
