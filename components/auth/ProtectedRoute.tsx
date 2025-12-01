"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, UserRole } from "@/store/authStore";
import { Loading } from "@/components/ui/Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();
  const user = useAuthStore.getState().getUserSafe();
  const router = useRouter();

  // User role is already normalized by getUserSafe
  const userRole = user?.role ?? null;

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check role-based access
    if (allowedRoles && userRole && !allowedRoles.includes(userRole as UserRole)) {
      router.push("/unauthorized");
      return;
    }
  }, [isAuthenticated, userRole, allowedRoles, router, redirectTo]);

  // Show loading while checking auth
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // Check role access
  if (allowedRoles && userRole && !allowedRoles.includes(userRole as UserRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}

