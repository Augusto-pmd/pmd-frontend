"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

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
      const user = responseData.user;
      const refresh_token = responseData.refresh_token || responseData.refreshToken;
      
      console.log("🔵 [LOGIN EXTRACT] Datos extraídos:");
      console.log("  - access_token:", access_token ? "***PRESENT***" : "MISSING");
      console.log("  - user:", user ? "PRESENT" : "MISSING");
      console.log("  - refresh_token:", refresh_token ? "***PRESENT***" : "MISSING");
      
      if (!user) {
        console.error("🔴 [LOGIN ERROR] Missing user in response");
        throw new Error("Invalid response: missing user");
      }
      
      if (!access_token) {
        console.error("🔴 [LOGIN ERROR] Missing access_token in response");
        console.error("  - Available keys:", Object.keys(responseData));
        throw new Error("Invalid response: missing access_token or token");
      }

      console.log("🔵 [LOGIN STORE] Llamando login() con:");
      console.log("  - User:", user);
      console.log("  - Access Token:", access_token ? "***" : "MISSING");
      console.log("  - Refresh Token:", refresh_token ? "***" : "MISSING");
      
      // login() ya normaliza el user internamente
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
    <div className="w-full max-w-md px-4">
      <div className="bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">PMD</h1>
          <p className="text-gray-600">Management System</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none transition-colors"
          placeholder="your.email@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none transition-colors"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-pmd-darkBlue text-pmd-white py-3 rounded-pmd font-semibold hover:bg-pmd-mediumBlue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
      </div>
    </div>
  );
}

