"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useWorks } from "@/hooks/api/works";
import { LoadingState } from "@/components/ui/LoadingState";
import { WorksList } from "@/components/works/WorksList";
import { BotonVolver } from "@/components/ui/BotonVolver";

function WorksContent() {
  const { works, isLoading, error } = useWorks();

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando obras…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar las obras: {error.message || "Error desconocido"}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="px-1">
          <BotonVolver />
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Obras</h1>
          <p className="text-gray-600">Listado de obras registradas en el sistema PMD</p>
        </div>

        <WorksList works={works || []} />
      </div>
    </MainLayout>
  );
}

export default function WorksPage() {
  return (
    <ProtectedRoute>
      <WorksContent />
    </ProtectedRoute>
  );
}
