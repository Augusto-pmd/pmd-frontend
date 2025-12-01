"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {

  // 🔥 FIX: limpiar estado ANTES del render
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pmd-auth-storage");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    useAuthStore.getState().logout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LoginForm />
    </div>
  );
}
