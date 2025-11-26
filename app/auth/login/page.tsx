"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pmd-darkBlue to-pmd-mediumBlue">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-pmd p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">PMD</h1>
            <p className="text-gray-600">Management System</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

