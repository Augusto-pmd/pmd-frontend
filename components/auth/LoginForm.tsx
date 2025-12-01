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
      console.log('🔍 [LoginForm] About to call:', loginEndpoint);
      console.log('🔍 [LoginForm] baseURL from api:', (api as any).defaults?.baseURL);
      console.log('🔍 [LoginForm] NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
      const response = await api.post(loginEndpoint, {
        email,
        password,
      });

      // Backend returns: { user, access_token, refresh_token }
      const { user, access_token, refresh_token } = response.data;
      
      // login() ya normaliza el user internamente
      login(user, access_token, refresh_token || access_token);
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pmd-darkBlue to-pmd-mediumBlue">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-pmd p-8">
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
    </div>
  );
}

