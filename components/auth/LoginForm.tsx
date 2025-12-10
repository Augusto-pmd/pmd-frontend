"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getApiUrl } from "@/lib/api";
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
      // getApiUrl() siempre devuelve una string válida
      const apiBase = getApiUrl();
      const loginUrl = `${apiBase}/auth/login`;
      
      console.log("🔵 LOGIN → POST", loginUrl);

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
      }).catch((fetchError: any) => {
        console.error("🔴 [LOGIN FETCH ERROR] Error de red/CORS:");
        console.error("  - Error:", fetchError);
        console.error("  - Error message:", fetchError.message);
        console.error("  - Error name:", fetchError.name);
        console.error("  - URL intentada:", loginUrl);
        console.error("  - Posibles causas:");
        console.error("    1. CORS bloqueado - verificar configuración en backend");
        console.error("    2. URL incorrecta - verificar NEXT_PUBLIC_API_URL");
        console.error("    3. Backend no disponible - verificar que el servidor esté corriendo");
        console.error("    4. Red desconectada - verificar conexión a internet");
        
        // No romper la app, solo mostrar error al usuario
        const errorMessage = fetchError.message?.includes("CORS") || fetchError.message?.includes("cors")
          ? "Error de conexión (CORS). Verifica la configuración del backend."
          : fetchError.message?.includes("Failed to fetch") || fetchError.message?.includes("NetworkError")
          ? "Error de conexión. Verifica que el backend esté disponible."
          : "Error de conexión. Por favor, intenta nuevamente.";
        
        throw new Error(errorMessage);
      });

      console.log("🟢 [LOGIN RESPONSE]");
      console.log("  - Status:", response.status);
      console.log("  - Status OK:", response.ok);
      console.log("  - Status Text:", response.statusText);
      console.log("  - Headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("🔴 [LOGIN HTTP ERROR]");
        console.error("  - Status:", response.status);
        console.error("  - Status Text:", response.statusText);
        console.error("  - Error Data:", errorData);
        throw {
          response: {
            status: response.status,
            data: errorData
          },
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      // Backend returns: { user, access_token, refresh_token }
      const responseData = await response.json();
      console.log("🔵 [LOGIN EXTRACT] Extrayendo datos de response JSON:");
      console.log("  - response keys:", Object.keys(responseData));
      console.log("  - response.access_token exists:", !!responseData.access_token);
      console.log("  - response.token exists:", !!responseData.token);
      console.log("  - response.user exists:", !!responseData.user);
      
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
      // Usar DEFAULT_ORG_ID como fallback si no está presente
      const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";
      const user = {
        ...userRaw,
        organizationId:
          userRaw.organizationId ||
          userRaw.organization?.id ||
          DEFAULT_ORG_ID,
        organization: userRaw.organization ?? {
          id: DEFAULT_ORG_ID,
          name: "PMD Arquitectura",
        },
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
      
      // Hidratar usuario desde el backend después del login
      await useAuthStore.getState().hydrateUser();
      console.log("🟢 LOGIN → hydrateUser completed");
      
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
      
      let errorMessage = "Error al iniciar sesión. Por favor, intenta nuevamente.";
      
      // Manejar errores de respuesta HTTP
      if (err.response) {
        if (err.response.status === 400 || err.response.status === 401) {
          errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        "Credenciales inválidas. Por favor, verifica tu email y contraseña.";
        } else if (err.response.status >= 500) {
          errorMessage = "Error del servidor. Por favor, intenta más tarde.";
        }
      } else if (err.message) {
        // Manejar errores de red/CORS
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      setLoading(false); // Asegurar que loading se resetee siempre
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
        <div className="flex flex-col items-center mb-6">
          <LogoPMD size={90} className="opacity-95" />
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
