"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();

  // Leer estado seguro (sin user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  // Limpieza total al entrar al login
  useEffect(() => {
    logout();  // fuerza estado limpio para evitar roles corruptos
  }, [logout]);

  // Redirección SOLO si el usuario ya está autenticado de forma real
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return <LoginForm />;
}
