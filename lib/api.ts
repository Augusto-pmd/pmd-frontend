"use client";

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";
import { normalizeUser } from "@/lib/normalizeUser";

// Función universal para obtener API_URL
export function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;

  if (!url || typeof url !== "string" || url.trim() === "") {
    console.error("❌ [getApiUrl] NEXT_PUBLIC_API_URL no está definida en runtime.");
    console.error("❌ [getApiUrl] Por favor, configura NEXT_PUBLIC_API_URL en tu archivo .env.local");
    console.error("❌ [getApiUrl] Ejemplo: NEXT_PUBLIC_API_URL=https://pmd-backend-l47d.onrender.com");
    
    // Fallback para desarrollo/producción
    const fallbackUrl = "https://pmd-backend-l47d.onrender.com";
    console.warn("⚠️ [getApiUrl] Usando URL de fallback:", fallbackUrl);
    return `${fallbackUrl}/api`;
  }

  return url.endsWith("/api") ? url : `${url}/api`;
}

// Exposición global para debug en cliente
if (typeof window !== "undefined") {
  (window as any).__envApiUrl = process.env.NEXT_PUBLIC_API_URL;
}

// Construir API_URL usando getApiUrl() - ahora siempre devuelve una string válida
const API_URL = getApiUrl();
const baseURL = API_URL; // getApiUrl() siempre devuelve una string válida

const api: AxiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies
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
    // Normalize user in all responses
    if (response.data?.user) {
      response.data.user = normalizeUser(response.data.user);
    }
    return response;
  },
  async (error: AxiosError) => {
    console.error("🔴 [API RESPONSE ERROR]");
    console.error("  - URL:", error.config?.url);
    console.error("  - Method:", error.config?.method?.toUpperCase());
    console.error("  - Status:", error.response?.status);
    console.error("  - Status Text:", error.response?.statusText);
    console.error("  - Response Data:", error.response?.data);
    console.error("  - Error Message:", error.message);
    
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = useAuthStore.getState().token;
        if (token) {
          // getApiUrl() siempre devuelve una string válida
          const apiUrl = getApiUrl();
          const refreshURL = `${apiUrl}/auth/refresh`;
          console.log('🔍 [Token Refresh] URL:', refreshURL);
          
          const response = await axios.get(
            refreshURL,
            { 
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          const { user: rawUser, access_token: newToken, refresh_token: newRefreshToken } = response.data || {};
          if (rawUser) {
            const user = normalizeUser(rawUser);
            // normalizeUser siempre retorna organizationId (con DEFAULT_ORG_ID como fallback)
            // Si el usuario actualizado tiene DEFAULT_ORG_ID y el usuario actual tiene uno válido, preservarlo
            const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";
            const currentUser = useAuthStore.getState().user;
            if (user.organizationId === DEFAULT_ORG_ID && currentUser?.organizationId && currentUser.organizationId !== DEFAULT_ORG_ID) {
              user.organizationId = currentUser.organizationId;
              if (currentUser.organization) {
                user.organization = currentUser.organization;
              }
            }
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

          // Retry original request with new token
          if (originalRequest.headers && newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
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

    console.error("🔴 [API ERROR NORMALIZED]", normalizedError);
    
    return Promise.reject(normalizedError);
  }
);

// API helper functions
export const apiClient = {
  get: <T = any>(url: string, config?: any) => {
    console.log('🔍 [apiClient.get] url:', url);
    return api.get<T>(url, config).then((res) => res.data);
  },
  post: <T = any>(url: string, data?: any, config?: any) => {
    console.log('🔍 [apiClient.post] url:', url);
    return api.post<T>(url, data, config).then((res) => res.data);
  },
  put: <T = any>(url: string, data?: any, config?: any) => {
    console.log('🔍 [apiClient.put] url:', url);
    return api.put<T>(url, data, config).then((res) => res.data);
  },
  patch: <T = any>(url: string, data?: any, config?: any) => {
    console.log('🔍 [apiClient.patch] url:', url);
    return api.patch<T>(url, data, config).then((res) => res.data);
  },
  delete: <T = any>(url: string, config?: any) => {
    console.log('🔍 [apiClient.delete] url:', url);
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
    headers.Authorization = `Bearer ${token}`;
    console.log(`🔵 [apiFetch] ${options.method || "GET"} ${url}`);
    console.log(`   → Headers: Authorization: Bearer ${token.substring(0, 20)}...`);
  } else {
    console.log(`🔵 [apiFetch] ${options.method || "GET"} ${url} (no token available)`);
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: "include", // Mantener cookies
  });
}

// Exportar API_URL para uso en otros módulos
export { API_URL };

export default api;
