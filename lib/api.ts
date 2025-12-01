import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";
import { normalizeUser } from "@/lib/normalizeUser";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "https://pmd-backend-l47d.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 🔍 DEBUG: Log URL construction before request
    const baseURL = config.baseURL || api.defaults.baseURL || '';
    const url = config.url || '';
    const finalURL = baseURL ? `${baseURL}${url.startsWith('/') ? '' : '/'}${url}` : url;
    
    console.log('🔍 [API Request Interceptor] URL Construction:');
    console.log('  - baseURL:', baseURL);
    console.log('  - config.url:', url);
    console.log('  - finalURL:', finalURL);
    console.log('  - method:', config.method?.toUpperCase());
    console.log('  - stack trace:', new Error().stack?.split('\n').slice(1, 4).join('\n'));
    
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
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
          // Attempt to refresh token
          const refreshURL = `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`;
          console.log('🔍 [Token Refresh] URL:', refreshURL);
          const response = await axios.post(
            refreshURL,
            { refreshToken },
            { withCredentials: true }
          );

          const { user: rawUser, token: newToken, refreshToken: newRefreshToken } = response.data || {};
          if (rawUser) {
            const user = normalizeUser(rawUser);
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
          if (originalRequest.headers) {
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
    };

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

export default api;
