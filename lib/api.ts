import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to normalize user.role from object to string
const normalizeUserRole = (data: any): any => {
  if (data?.user?.role && typeof data.user.role === 'object') {
    data.user.role = data.user.role.name;
  }
  if (data?.role && typeof data.role === 'object') {
    data.role = data.role.name;
  }
  return data;
};

// Response interceptor - Handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    // Normalize user.role in all responses
    if (response.data) {
      response.data = normalizeUserRole(response.data);
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
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken },
            { withCredentials: true }
          );

          const { token: newToken, refreshToken: newRefreshToken } = response.data;
          useAuthStore.setState({ token: newToken, refreshToken: newRefreshToken });

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
  get: <T = any>(url: string, config?: any) => api.get<T>(url, config).then((res) => res.data),
  post: <T = any>(url: string, data?: any, config?: any) =>
    api.post<T>(url, data, config).then((res) => res.data),
  put: <T = any>(url: string, data?: any, config?: any) =>
    api.put<T>(url, data, config).then((res) => res.data),
  patch: <T = any>(url: string, data?: any, config?: any) =>
    api.patch<T>(url, data, config).then((res) => res.data),
  delete: <T = any>(url: string, config?: any) =>
    api.delete<T>(url, config).then((res) => res.data),
};

export default api;
