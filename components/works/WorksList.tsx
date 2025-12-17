"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { WorkForm } from "@/components/forms/WorkForm";
import { workApi } from "@/hooks/api/works";
import { useToast } from "@/components/ui/Toast";
import { Edit, Trash2, Eye, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface Work {
  id: string;
  name?: string;
  nombre?: string;
  title?: string;
  description?: string;
  descripcion?: string;
  status?: string;
  estado?: string;
  client?: string;
  cliente?: string;
  startDate?: string;
  fechaInicio?: string;
  estimatedStartDate?: string;
  [key: string]: any;
}

interface WorksListProps {
  works: Work[];
  onRefresh?: () => void;
}

export function WorksList({ works, onRefresh }: WorksListProps) {
  const router = useRouter();
  
  if (works.length === 0) {
    return (
      <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-12 text-center">
        <p className="text-gray-600 text-lg">No hay obras registradas</p>
        <p className="text-gray-500 text-sm mt-2">
          Haz clic en &quot;Nueva Obra&quot; para agregar una
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {works.map((work) => (
        <WorkCard key={work.id} work={work} onRefresh={onRefresh} />
      ))}
    </div>
  );
}

function WorkCard({ work, onRefresh }: { work: Work; onRefresh?: () => void }) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const getWorkName = (work: Work) => {
    return work.nombre || work.name || work.title || "Sin nombre";
  };

  const getWorkDescription = (work: Work) => {
    return work.descripcion || work.description || "";
  };

  const getWorkStatus = (work: Work) => {
    return work.estado || work.status || "pendiente";
  };

  const getWorkClient = (work: Work) => {
    return work.cliente || work.client || null;
  };

  const getStartDate = (work: Work) => {
    const date = work.fechaInicio || work.startDate || work.estimatedStartDate;
    if (!date) return null;
    try {
      return new Date(date).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return date;
    }
  };

  const getStatusVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "completada" || statusLower === "completed") return "success";
    if (statusLower === "activa" || statusLower === "active") return "info";
    if (statusLower === "pendiente" || statusLower === "pending") return "warning";
    return "default";
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "completed" || statusLower === "completada" || statusLower === "finalizada") return "Completada";
    if (statusLower === "active" || statusLower === "activa" || statusLower === "en-ejecucion") return "En ejecución";
    if (statusLower === "paused" || statusLower === "pausada") return "Pausada";
    if (statusLower === "planned" || statusLower === "planificada") return "Planificada";
    if (statusLower === "pending") return "Pendiente";
    return status;
  };

  const handleUpdate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await workApi.update(work.id, data);
      await onRefresh?.();
      toast.success("Obra actualizada correctamente");
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error("Error al actualizar obra:", err);
      toast.error(err.message || "Error al actualizar la obra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    setIsSubmitting(true);
    try {
      // Archivar cambiando el estado a "finalizada" o "completada"
      await workApi.update(work.id, { 
        estado: "finalizada", 
        status: "completed",
        isActive: false 
      });
      await onRefresh?.();
      toast.success("Obra archivada correctamente");
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      console.error("Error al archivar obra:", err);
      toast.error(err.message || "Error al archivar la obra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await workApi.delete(work.id);
      await onRefresh?.();
      toast.success("Obra eliminada correctamente");
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      console.error("Error al eliminar obra:", err);
      toast.error(err.message || "Error al eliminar la obra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="border-l-4 border-pmd-gold hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-pmd-darkBlue mb-2">
                {getWorkName(work)}
              </h3>
              {getWorkDescription(work) && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {getWorkDescription(work)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Estado:</span>
                <Badge variant={getStatusVariant(getWorkStatus(work))}>
                  {getStatusLabel(getWorkStatus(work))}
                </Badge>
              </div>

              {getWorkClient(work) && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Cliente:</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {getWorkClient(work)}
                  </span>
                </div>
              )}

              {getStartDate(work) && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Fecha de inicio:</span>
                  <span className="text-sm text-gray-900">
                    {getStartDate(work)}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-200 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 flex items-center justify-center gap-1"
                onClick={() => router.push(`/works/${work.id}`)}
              >
                <Eye className="h-4 w-4" />
                Ver
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 flex items-center justify-center gap-1"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex-1 flex items-center justify-center gap-1"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Archive className="h-4 w-4" />
                Archivar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Obra"
        size="lg"
      >
        <WorkForm
          initialData={work}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Acción"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Qué acción deseas realizar con la obra <strong>{getWorkName(work)}</strong>?
          </p>
          <p className="text-sm text-red-600 font-medium">
            ⚠️ Esta acción no se puede deshacer.
          </p>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleArchive}
              disabled={isSubmitting}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archivar (marcar como finalizada)
            </Button>
            <Button
              variant="danger"
              className="w-full justify-start"
              onClick={handleDelete}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar permanentemente
            </Button>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

