"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useDocumentsStore } from "@/store/documentsStore";
import { useWorks } from "@/hooks/api/works";
import { useUsers } from "@/hooks/api/users";
import { LoadingState } from "@/components/ui/LoadingState";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Edit, Trash2, Download, FileText, Building2, User, Calendar, Tag } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { DocumentForm } from "../components/DocumentForm";

function DocumentDetailContent() {
  // All hooks must be called unconditionally at the top
  const params = useParams();
  const router = useRouter();
  const { documents, fetchDocuments, updateDocument, deleteDocument } = useDocumentsStore();
  const { works } = useWorks();
  const { users } = useUsers();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Safely extract documentId from params
  const documentId = typeof params?.id === "string" ? params.id : null;

  // Guard check after all hooks
  if (!documentId) {
    return null;
  }

  const document = documents.find((d) => d.id === documentId);

  if (!document) {
    return (
      <MainLayout>
        <LoadingState message="Cargando documento…" />
      </MainLayout>
    );
  }

  const getWorkName = (workId?: string) => {
    if (!workId) return "-";
    const work = works.find((w: any) => w.id === workId);
    if (!work) return workId;
    return work.name || work.title || work.nombre || workId;
  };

  const getUserName = (userId?: string) => {
    if (!userId) return "-";
    const user = users.find((u: any) => u.id === userId);
    if (!user) return userId;
    return user.fullName || user.name || user.nombre || userId;
  };

  const getStatusVariant = (status?: string) => {
    if (!status) return "default";
    const statusLower = status.toLowerCase();
    if (statusLower === "aprobado") return "success";
    if (statusLower === "pendiente") return "warning";
    if (statusLower === "en revisión" || statusLower === "en revision") return "info";
    if (statusLower === "rechazado") return "error";
    return "default";
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return "Sin estado";
    const statusLower = status.toLowerCase();
    if (statusLower === "aprobado") return "Aprobado";
    if (statusLower === "pendiente") return "Pendiente";
    if (statusLower === "en revisión" || statusLower === "en revision") return "En Revisión";
    if (statusLower === "rechazado") return "Rechazado";
    return status;
  };

  const handleUpdate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await updateDocument(documentId, data);
      await fetchDocuments();
      toast.success("Documento actualizado correctamente");
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error("Error al actualizar documento:", err);
      toast.error(err.message || "Error al actualizar el documento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteDocument(documentId);
      toast.success("Documento eliminado correctamente");
      router.push("/documents");
    } catch (err: any) {
      console.error("Error al eliminar documento:", err);
      toast.error(err.message || "Error al eliminar el documento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <BotonVolver />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">{document.name}</h1>
              <p className="text-gray-600">Información completa del documento</p>
            </div>
            <div className="flex gap-2">
              {document.url && (
                <Button
                  variant="outline"
                  onClick={() => window.open(document.url, "_blank")}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Principal */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información General</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="text-base font-medium text-gray-900">{document.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="text-base font-medium text-gray-900">{document.type}</p>
                  </div>
                </div>

                {document.version && (
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Versión</p>
                      <p className="text-base font-medium text-gray-900">{document.version}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Obra</p>
                    <p className="text-base font-medium text-gray-900">{getWorkName(document.workId)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <Badge variant={getStatusVariant(document.status)}>
                      {getStatusLabel(document.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadatos */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadatos</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha de carga</p>
                    <p className="text-base font-medium text-gray-900">
                      {new Date(document.uploadedAt).toLocaleDateString("es-AR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Responsable</p>
                    <p className="text-base font-medium text-gray-900">
                      {getUserName(document.uploadedBy)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Editar Documento"
          size="lg"
        >
          <DocumentForm
            initialData={document}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirmar Eliminación"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              ¿Estás seguro de que deseas eliminar el documento <strong>{document.name}</strong>?
            </p>
            <p className="text-sm text-gray-500">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}

export default function DocumentDetailPage() {
  return (
    <ProtectedRoute>
      <DocumentDetailContent />
    </ProtectedRoute>
  );
}
