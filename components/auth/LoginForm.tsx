"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import LogoPMD from "@/components/LogoPMD";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginEndpoint = "/auth/login";
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://pmd-backend-l47d.onrender.com/api";
      const fullURL = `${baseURL}${loginEndpoint}`;
      
      const requestData = { email, password };
      
      console.log("🔵 [LOGIN REQUEST]");
      console.log("  - URL:", fullURL);
      console.log("  - Method: POST");
      console.log("  - Data:", { email, password: "***" });
      console.log("  - NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
      console.log("  - api.defaults.baseURL:", api.defaults.baseURL);

      const response = await api.post(loginEndpoint, requestData);

      console.log("🟢 [LOGIN RESPONSE]");
      console.log("  - Status:", response.status);
      console.log("  - Data:", response.data);
      console.log("  - Headers:", response.headers);

      // Backend returns: { user, access_token, refresh_token }
      const responseData = response.data;
      console.log("🔵 [LOGIN EXTRACT] Extrayendo datos de response.data:");
      console.log("  - response.data keys:", Object.keys(responseData));
      console.log("  - response.data.access_token exists:", !!responseData.access_token);
      console.log("  - response.data.token exists:", !!responseData.token);
      console.log("  - response.data.user exists:", !!responseData.user);
      
      // Intentar extraer access_token o token (el backend puede usar cualquiera)
      const access_token = responseData.access_token || responseData.token;
      const userRaw = responseData.user;
      const refresh_token = responseData.refresh_token || responseData.refreshToken;
      
      console.log("🔵 [LOGIN EXTRACT] Datos extraídos:");
      console.log("  - access_token:", access_token ? "***PRESENT***" : "MISSING");
      console.log("  - user:", userRaw ? "PRESENT" : "MISSING");
      console.log("  - refresh_token:", refresh_token ? "***PRESENT***" : "MISSING");
      
      if (!userRaw) {
        console.error("🔴 [LOGIN ERROR] Missing user in response");
        throw new Error("Invalid response: missing user");
      }
      
      if (!access_token) {
        console.error("🔴 [LOGIN ERROR] Missing access_token in response");
        console.error("  - Available keys:", Object.keys(responseData));
        throw new Error("Invalid response: missing access_token or token");
      }

      // Asegurar que organizationId y organization estén en el user object
      const user = {
        ...userRaw,
        organizationId: userRaw.organizationId || userRaw.organization?.id || undefined,
        organization: userRaw.organization || undefined,
      };

      console.log("🔵 [LOGIN STORE] Llamando login() con:");
      console.log("  - User:", user);
      console.log("  - User.organizationId:", user.organizationId);
      console.log("  - User.organization:", user.organization);
      console.log("  - Access Token:", access_token ? "***" : "MISSING");
      console.log("  - Refresh Token:", refresh_token ? "***" : "MISSING");
      
      // login() ya normaliza el user internamente y preserva organizationId/organization
      login(user, access_token, refresh_token || access_token);
      
      // Verificar que se guardó correctamente
      const storeState = useAuthStore.getState();
      console.log("🟢 [LOGIN VERIFY] Estado después de login():");
      console.log("  - isAuthenticated:", storeState.isAuthenticated);
      console.log("  - user stored:", storeState.user ? "YES" : "NO");
      console.log("  - token stored:", storeState.token ? "YES" : "NO");
      
      if (!storeState.isAuthenticated || !storeState.token) {
        console.error("🔴 [LOGIN ERROR] Store no se actualizó correctamente");
        throw new Error("Failed to save authentication state");
      }
      
      console.log("🟢 [LOGIN SUCCESS] Estado guardado correctamente, redirigiendo a /dashboard");
      
      // Usar push para mantener el historial y permitir navegación con botón Volver
      router.push("/dashboard");
      
      console.log("🟢 [LOGIN SUCCESS] router.push('/dashboard') ejecutado");
    } catch (err: any) {
      console.error("🔴 [LOGIN ERROR]");
      console.error("  - Error:", err);
      console.error("  - Error message:", err.message);
      console.error("  - Error response:", err.response);
      console.error("  - Error response data:", err.response?.data);
      console.error("  - Error status:", err.response?.status);
      
      let errorMessage = "Invalid credentials. Please try again.";
      
      if (err.response?.status === 400 || err.response?.status === 401) {
        errorMessage = err.response?.data?.message || 
                      err.response?.data?.error || 
                      "Invalid email or password. Please check your credentials.";
      } else if (err.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px]">
      {/* Main Card Container */}
      <div
        style={{
          backgroundColor: "var(--apple-surface)",
          border: "1px solid var(--apple-border)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-apple-strong)",
          padding: "var(--space-xl)",
          fontFamily: "Inter, system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-lg)",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "var(--space-lg)" }}>
          <LogoPMD size={90} className="opacity-95" />
        </div>

        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              font: "var(--font-title)",
              color: "var(--apple-text-primary)",
              margin: "0 0 var(--space-xs) 0",
            }}
          >
            PMD
          </h1>
          <p
            style={{
              font: "var(--font-body)",
              color: "var(--apple-text-secondary)",
              margin: 0,
            }}
          >
            Management System
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
          }}
        >
          {/* Error Message */}
          {error && (
            <div
              style={{
                backgroundColor: "rgba(255,59,48,0.1)",
                border: "1px solid rgba(255,59,48,0.3)",
                color: "rgba(255,59,48,1)",
                padding: "var(--space-sm) var(--space-md)",
                borderRadius: "var(--radius-md)",
                fontSize: "14px",
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              {error}
            </div>
          )}

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              style={{
                display: "block",
                font: "var(--font-label)",
                color: "var(--apple-text-secondary)",
                marginBottom: "6px",
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
              style={{
                width: "100%",
                height: "42px",
                backgroundColor: "var(--apple-surface)",
                border: "1px solid var(--apple-border-strong)",
                borderRadius: "var(--radius-md)",
                padding: "0 14px",
                fontSize: "14px",
                fontFamily: "Inter, system-ui, sans-serif",
                color: "var(--apple-text-primary)",
                outline: "none",
                transition: "all 200ms ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid var(--apple-blue)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 2px rgba(0,122,255,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid var(--apple-border-strong)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                font: "var(--font-label)",
                color: "var(--apple-text-secondary)",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: "100%",
                height: "42px",
                backgroundColor: "var(--apple-surface)",
                border: "1px solid var(--apple-border-strong)",
                borderRadius: "var(--radius-md)",
                padding: "0 14px",
                fontSize: "14px",
                fontFamily: "Inter, system-ui, sans-serif",
                color: "var(--apple-text-primary)",
                outline: "none",
                transition: "all 200ms ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid var(--apple-blue)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 2px rgba(0,122,255,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid var(--apple-border-strong)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: "44px",
              backgroundColor: "var(--apple-surface)",
              color: "var(--apple-text-primary)",
              border: "1px solid rgba(0,0,0,0.15)",
              borderRadius: "var(--radius-lg)",
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              transition: "all 200ms ease",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "var(--apple-button-hover)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--apple-surface)";
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "var(--apple-button-active)";
              }
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.backgroundColor = "var(--apple-button-hover)";
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
