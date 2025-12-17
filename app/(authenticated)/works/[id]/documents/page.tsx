"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useDocumentsStore } from "@/store/documentsStore";
import { useWorks } from "@/hooks/api/works";
import { LoadingState } from "@/components/ui/LoadingState";
import { DocumentsList } from "@/components/documents/DocumentsList";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DocumentForm } from "@/app/(authenticated)/documents/components/DocumentForm";
import { useToast } from "@/components/ui/Toast";
import { Plus, Filter, X, FileText } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

function WorkDocumentsContent() {
  const params = useParams();
  const router = useRouter();
  const workId = typeof params?.id === 'string' ? params.id : null;
  const { documents, isLoading, error, fetchDocuments, createDocument } = useDocumentsStore();
  const { works } = useWorks();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (organizationId && workId) {
      fetchDocuments(workId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, workId]);

  if (!workId) return null;

  const work = works.find((w: any) => w.id === workId);
  const workName = work ? (work.name || work.title || work.nombre || workId) : workId;

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createDocument({ ...data, workId });
      await fetchDocuments(workId);
      toast.success("Documento subido correctamente");
      setIsCreateModalOpen(false);
    } catch (err: any) {
      console.error("Error al crear documento:", err);
      toast.error(err.message || "Error al subir el documento");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar documentos de esta obra
  const workDocuments = documents.filter((doc) => doc.workId === workId);

  // Obtener tipos únicos de documentos
  const documentTypes = Array.from(
    new Set(workDocuments.map((doc) => doc.type).filter(Boolean))
  ) as string[];

  if (!organizationId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p className="font-semibold mb-2">No se pudo determinar la organización</p>
        <p className="text-sm">Por favor, vuelve a iniciar sesión para continuar.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <LoadingState message="Cargando documentos de la obra…" />
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error al cargar los documentos: {error}
      </div>
    );
  }

  return (
      <div className="space-y-6">
        <div>
          <BotonVolver backTo={`/works/${workId}`} />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Documentos - {workName}
              </h1>
              <p className="text-gray-600">Documentación asociada a esta obra</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Subir Documento
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          <div className="flex gap-4 items-center">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            {(typeFilter !== "all" || statusFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
                >
                  <option value="all">Todos</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en revisión">En Revisión</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <DocumentsList
          documents={workDocuments}
          onRefresh={() => fetchDocuments(workId)}
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          workFilter={workId}
        />

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Subir Documento a esta Obra"
          size="lg"
        >
          <DocumentForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
            defaultWorkId={workId}
          />
        </Modal>
      </div>
  );
}

export default function WorkDocumentsPage() {
  return (
    <ProtectedRoute>
      <WorkDocumentsContent />
    </ProtectedRoute>
  );
}

