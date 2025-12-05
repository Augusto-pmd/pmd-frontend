"use client";

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";
import { normalizeUser } from "@/lib/normalizeUser";
import { isValidApiUrl, getApiBaseUrl } from "@/lib/safeApi";

// Construir URL base de forma segura
// NEXT_PUBLIC_API_URL debe ser la base sin /api (ej: https://pmd-backend-l47d.onrender.com)
// API_URL será: ${NEXT_PUBLIC_API_URL}/api
const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
const defaultBaseUrl = "https://pmd-backend-l47d.onrender.com";
const baseUrl = envApiUrl || defaultBaseUrl;

// Construir API_URL EXACTAMENTE como se requiere: ${NEXT_PUBLIC_API_URL}/api
const API_URL = `${baseUrl}/api`;

// Validar que la URL base sea válida (solo en cliente, no romper SSR)
if (typeof window !== "undefined") {
  if (!baseUrl || baseUrl.includes("undefined") || baseUrl.includes("null")) {
    console.error("🔴 [API INIT] NEXT_PUBLIC_API_URL inválida o no definida");
    // No throw en cliente para no romper la app, solo loguear
  }

  if (!isValidApiUrl(API_URL)) {
    console.error("🔴 [API INIT] API_URL inválida:", API_URL);
    // No throw en cliente para no romper la app, solo loguear
  }
}

const baseURL = API_URL;

const api: AxiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies
});

console.log("🔵 [API INIT] Axios instance created");
console.log("  - NEXT_PUBLIC_API_URL:", envApiUrl || "NOT SET (using default)");
console.log("  - baseUrl (sin /api):", baseUrl);
console.log("  - API_URL (con /api):", API_URL);
console.log("  - baseURL (axios):", baseURL);
console.log("  - isValidApiUrl:", isValidApiUrl(API_URL));

// Request interceptor - Add auth token and validate URLs
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ⚠️ VALIDACIÓN CRÍTICA: Asegurar que NEXT_PUBLIC_API_URL esté definida antes de hacer requests
    const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!envApiUrl || envApiUrl.includes("undefined") || envApiUrl.includes("null")) {
      console.error("🔴 [API Request Interceptor] NEXT_PUBLIC_API_URL no está definida");
      return Promise.reject(
        new Error("NEXT_PUBLIC_API_URL no está configurada. Por favor, configura la variable de entorno.")
      ) as any;
    }
    
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Si es FormData, dejar que axios maneje el Content-Type automáticamente
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // 🔍 DEBUG: Log URL construction before request
    const requestBaseURL = config.baseURL || api.defaults.baseURL || '';
    const url = config.url || '';
    const finalURL = requestBaseURL ? `${requestBaseURL}${url.startsWith('/') ? '' : '/'}${url}` : url;
    
    // ⚠️ VALIDACIÓN CRÍTICA: Detectar URLs con undefined/null
    if (!isValidApiUrl(finalURL)) {
      console.error("🔴 [API Request Interceptor] URL INVÁLIDA detectada:");
      console.error("  - baseURL:", requestBaseURL);
      console.error("  - config.url:", url);
      console.error("  - finalURL:", finalURL);
      console.error("  - method:", config.method?.toUpperCase());
      console.error("  - stack trace:", new Error().stack?.split('\n').slice(1, 6).join('\n'));
      
      // Rechazar la petición con un error descriptivo
      return Promise.reject(
        new Error(`URL inválida detectada: ${finalURL}. Verifica que todos los parámetros estén definidos.`)
      ) as any;
    }
    
    console.log('🔍 [API Request Interceptor] URL Construction:');
    console.log('  - baseURL:', requestBaseURL);
    console.log('  - config.url:', url);
    console.log('  - finalURL:', finalURL);
    console.log('  - method:', config.method?.toUpperCase());
    
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
    // NO silenciar errores - loguear todo
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
          // Attempt to refresh token using GET /api/auth/refresh
          // Usar API_URL ya construida (baseURL contiene ${NEXT_PUBLIC_API_URL}/api)
          const refreshURL = `${baseURL}/auth/refresh`;
          
          if (!isValidApiUrl(refreshURL)) {
            console.error("🔴 [Token Refresh] URL inválida:", refreshURL);
            useAuthStore.getState().logout();
            return Promise.reject(new Error("URL de refresh inválida"));
          }
          
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
            // Preservar organizationId si no viene en respuesta
            if (!user.organizationId) {
              const currentUser = useAuthStore.getState().user;
              user.organizationId = currentUser?.organizationId || undefined;
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

    // Normalize error response - NO silenciar, propagar completo
    const normalizedError = {
      message:
        (error.response?.data as { message?: string })?.message ||
        (error.response?.data as { error?: string })?.error ||
        error.message ||
        "An error occurred",
      status: error.response?.status || 500,
      data: error.response?.data,
      originalError: error, // Mantener referencia al error original
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

// Exportar API_URL para uso en otros módulos
export function getApiUrl(): string {
  return API_URL;
}

export default api;
