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
      <div className="bg-white/40 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">PMD</h1>
          <p className="text-sm text-gray-600">Management System</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 text-sm bg-white/70 backdrop-blur-md border border-gray-300/50 rounded-xl text-gray-900 placeholder:text-gray-500 shadow-inner focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600/50 outline-none transition"
          placeholder="your.email@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 text-sm bg-white/70 backdrop-blur-md border border-gray-300/50 rounded-xl text-gray-900 placeholder:text-gray-500 shadow-inner focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600/50 outline-none transition"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600/80 text-white backdrop-blur-xl rounded-xl px-4 py-2 hover:bg-blue-600 transition shadow-[0_0_10px_rgba(0,0,0,0.08)] font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
      </div>
    </div>
  );
}

