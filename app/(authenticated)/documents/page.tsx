"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useDocuments } from "@/hooks/api/documents";
import { LoadingState } from "@/components/ui/LoadingState";
import { DocumentList } from "@/components/documents/DocumentList";
import { BotonVolver } from "@/components/ui/BotonVolver";

function DocumentsContent() {
  const { documents, isLoading, error } = useDocuments();

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando documentación…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar la documentación: {error.message || "Error desconocido"}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="px-1">
          <BotonVolver />
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Documentación</h1>
          <p className="text-gray-600">Archivos y adjuntos del sistema PMD</p>
        </div>

        <DocumentList documents={documents || []} />
      </div>
    </MainLayout>
  );
}

export default function DocumentsPage() {
  return (
    <ProtectedRoute>
      <DocumentsContent />
    </ProtectedRoute>
  );
}

