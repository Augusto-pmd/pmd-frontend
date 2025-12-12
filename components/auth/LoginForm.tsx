"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { login as loginService } from "@/lib/services/authService";
import LogoPMD from "@/components/LogoPMD";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Use authService for API call
      const response = await loginService(email, password);
      
      // Normalize user and store in Zustand
      const { normalizeUser } = await import("@/lib/normalizeUser");
      let normalizedUser = normalizeUser(response.user);
      
      if (!normalizedUser) {
        throw new Error("Failed to normalize user");
      }

      // Normalize role and organization
      if (!normalizedUser.role || typeof normalizedUser.role.name !== "string") {
        normalizedUser.role = {
          id: normalizedUser.role?.id || "1",
          name: "ADMINISTRATION",
        };
      }
      if (!normalizedUser.organization) {
        normalizedUser.organization = {
          id: normalizedUser.organizationId || "1",
          name: "PMD Arquitectura",
        };
      }

      // Store in Zustand (tokens already stored in localStorage by authService)
      loginStore(normalizedUser, response.access_token, response.refresh_token);
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      let errorMessage = "Error al iniciar sesión. Por favor, intenta nuevamente.";
      
      if (err.response) {
        if (err.response.status === 400 || err.response.status === 401) {
          errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        "Credenciales inválidas. Por favor, verifica tu email y contraseña.";
        } else if (err.response.status >= 500) {
          errorMessage = "Error del servidor. Por favor, intenta más tarde.";
        }
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
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
