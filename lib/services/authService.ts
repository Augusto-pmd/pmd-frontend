/**
 * Authentication Service Layer
 * Handles all authentication API calls
 */

import { getApiUrl, apiFetch } from "@/lib/api";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    role: { id: number; name: string };
    organization: { id: number; name: string } | null;
    [key: string]: any;
  };
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  user?: {
    id: number;
    email: string;
    role: { id: number; name: string };
    organization: { id: number; name: string } | null;
    [key: string]: any;
  };
}

export interface UserMeResponse {
  user: {
    id: number;
    email: string;
    role: { id: number; name: string };
    organization: { id: number; name: string } | null;
    [key: string]: any;
  };
}

/**
 * Login service
 * Sends POST /auth/login and returns the full response
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const apiUrl = getApiUrl();
  const loginUrl = `${apiUrl}/auth/login`;

  const response = await apiFetch(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      response: {
        status: response.status,
        data: errorData,
      },
      message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
    };
  }

  const data = await response.json();

  // Normalize response format
  const normalizedResponse: LoginResponse = {
    access_token: data.access_token || data.token,
    refresh_token: data.refresh_token || data.refreshToken || data.access_token || data.token,
    user: data.user || data,
  };

  if (!normalizedResponse.user) {
    throw new Error("Invalid response: missing user");
  }

  if (!normalizedResponse.access_token) {
    throw new Error("Invalid response: missing access_token");
  }

  // Store tokens and user in localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", normalizedResponse.access_token);
    localStorage.setItem("refresh_token", normalizedResponse.refresh_token);
    localStorage.setItem("user", JSON.stringify(normalizedResponse.user));
  }

  return normalizedResponse;
}

/**
 * Refresh token service
 * Sends POST /auth/refresh and returns new tokens
 */
export async function refresh(refreshToken?: string | null): Promise<RefreshResponse | null> {
  const token = refreshToken || (typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null);
  
  if (!token) {
    return null;
  }

  const apiUrl = getApiUrl();
  const refreshUrl = `${apiUrl}/auth/refresh`;

  try {
    const response = await apiFetch(refreshUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: token }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    const normalizedResponse: RefreshResponse = {
      access_token: data.access_token || data.token,
      refresh_token: data.refresh_token || data.refreshToken || data.access_token || data.token,
      user: data.user || data,
    };

    if (!normalizedResponse.access_token) {
      return null;
    }

    // Store new tokens in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", normalizedResponse.access_token);
      if (normalizedResponse.refresh_token) {
        localStorage.setItem("refresh_token", normalizedResponse.refresh_token);
      }
      if (normalizedResponse.user) {
        localStorage.setItem("user", JSON.stringify(normalizedResponse.user));
      }
    }

    return normalizedResponse;
  } catch (error) {
    return null;
  }
}

/**
 * Load current user
 * Sends GET /users/me with Authorization header
 */
export async function loadMe(): Promise<UserMeResponse | null> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  
  if (!token) {
    return null;
  }

  const apiUrl = getApiUrl();
  const meUrl = `${apiUrl}/users/me`;

  try {
    const response = await apiFetch(meUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try refresh first
        const refreshResult = await refresh();
        if (refreshResult) {
          // Retry with new token
          const newToken = refreshResult.access_token;
          const retryResponse = await apiFetch(meUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          });

          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            const user = retryData.user || retryData;
            if (user && typeof window !== "undefined") {
              localStorage.setItem("user", JSON.stringify(user));
            }
            return { user };
          }
        }
        // Refresh failed, return null
        return null;
      }
      return null;
    }

    const data = await response.json();
    const user = data.user || data;

    if (user && typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }

    return { user };
  } catch (error) {
    return null;
  }
}

