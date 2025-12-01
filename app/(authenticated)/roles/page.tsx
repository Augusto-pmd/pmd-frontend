"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useRoles } from "@/hooks/api/roles";
import { LoadingState } from "@/components/ui/LoadingState";
import { RolesList } from "@/components/roles/RolesList";
import { BotonVolver } from "@/components/ui/BotonVolver";

function RolesContent() {
  const { roles, isLoading, error } = useRoles();

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando roles…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar los roles: {error.message || "Error desconocido"}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="px-1">
          <BotonVolver />
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Roles</h1>
          <p className="text-gray-600">Gestión de roles del sistema PMD</p>
        </div>

        <RolesList roles={roles || []} />
      </div>
    </MainLayout>
  );
}

export default function RolesPage() {
  return (
    <ProtectedRoute>
      <RolesContent />
    </ProtectedRoute>
  );
}

