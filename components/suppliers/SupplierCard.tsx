"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { SupplierForm } from "@/components/forms/SupplierForm";
import { supplierApi } from "@/hooks/api/suppliers";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/Toast";
import { Edit, Trash2, Eye, CheckCircle, XCircle } from "lucide-react";
import { Supplier, UpdateSupplierData } from "@/lib/types/supplier";

interface SupplierCardProps {
  supplier: Supplier;
  onRefresh?: () => void;
}

export function SupplierCard({ supplier, onRefresh }: SupplierCardProps) {
  const router = useRouter();
  const user = useAuthStore.getState().user;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const toast = useToast();
  
  // Verificar permisos para aprobar/rechazar
  const canApproveReject = user?.role?.name === "ADMINISTRATION" || user?.role?.name === "DIRECTION";

  const getSupplierName = () => {
    return supplier.nombre || supplier.name || "Sin nombre";
  };

  const getSupplierEmail = () => {
    return supplier.email || null;
  };

  const getSupplierContact = () => {
    return supplier.contacto || supplier.contact || supplier.contactName || null;
  };

  const getSupplierStatus = () => {
    return supplier.estado || supplier.status || "pendiente";
  };

  const isProvisional = getSupplierStatus().toLowerCase() === "provisional" || getSupplierStatus().toLowerCase() === "pending" || getSupplierStatus().toLowerCase() === "pendiente";

  const getStatusVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "aprobado" || statusLower === "approved" || statusLower === "active") {
      return "success";
    }
    if (statusLower === "pendiente" || statusLower === "pending" || statusLower === "provisional") {
      return "warning";
    }
    if (statusLower === "rechazado" || statusLower === "rejected" || statusLower === "inactive") {
      return "error";
    }
    if (statusLower === "bloqueado" || statusLower === "blocked") {
      return "error";
    }
    return "default";
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "approved") return "Aprobado";
    if (statusLower === "active") return "Aprobado";
    if (statusLower === "pending" || statusLower === "provisional") return "Pendiente";
    if (statusLower === "rejected") return "Rechazado";
    if (statusLower === "inactive") return "Rechazado";
    if (statusLower === "blocked" || statusLower === "bloqueado") return "Bloqueado";
    return status;
  };

  const handleUpdate = async (data: UpdateSupplierData) => {
    setIsSubmitting(true);
    try {
      await supplierApi.update(supplier.id, data);
      await onRefresh?.();
      toast.success("Proveedor actualizado correctamente");
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al actualizar proveedor:", err);
      }
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar el proveedor";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await supplierApi.delete(supplier.id);
      await onRefresh?.();
      toast.success("Proveedor eliminado correctamente");
      setIsDeleteModalOpen(false);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al eliminar proveedor:", err);
      }
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar el proveedor";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm(`¿Estás seguro de aprobar el proveedor "${getSupplierName()}"?`)) {
      return;
    }
    
    setIsApproving(true);
    try {
      await supplierApi.approve(supplier.id);
      await onRefresh?.();
      toast.success("Proveedor aprobado correctamente");
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al aprobar proveedor:", err);
      }
      const errorMessage = err instanceof Error ? err.message : "Error al aprobar el proveedor";
      toast.error(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!confirm(`¿Estás seguro de rechazar el proveedor "${getSupplierName()}"? Se enviará una alerta al operador que lo creó.`)) {
      return;
    }
    
    setIsRejecting(true);
    try {
      await supplierApi.reject(supplier.id);
      await onRefresh?.();
      toast.success("Proveedor rechazado correctamente. Se ha enviado una alerta al operador.");
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al rechazar proveedor:", err);
      }
      const errorMessage = err instanceof Error ? err.message : "Error al rechazar el proveedor";
      toast.error(errorMessage);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <>
      <Card className="border-l-4 border-[#162F7F]/40 hover:bg-white/15 transition-all">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-pmd-darkBlue mb-2">
                {getSupplierName()}
              </h3>
            </div>

            <div className="space-y-2">
              {getSupplierEmail() && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Email:</span>
                  <span className="text-sm text-gray-900 font-medium">{getSupplierEmail()}</span>
                </div>
              )}

              {getSupplierContact() && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Contacto:</span>
                  <span className="text-sm text-gray-900">{getSupplierContact()}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Estado:</span>
                <div className="flex gap-2">
                  {(getSupplierStatus().toLowerCase() === "blocked" || getSupplierStatus().toLowerCase() === "bloqueado") && (
                    <Badge variant="error">Bloqueado</Badge>
                  )}
                  <Badge variant={getStatusVariant(getSupplierStatus())}>
                    {getStatusLabel(getSupplierStatus())}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              {/* Botones de aprobación/rechazo para proveedores provisionales */}
              {canApproveReject && isProvisional && (
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-1"
                    onClick={handleApprove}
                    disabled={isApproving || isRejecting}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isApproving ? "Aprobando..." : "Aprobar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                    onClick={handleReject}
                    disabled={isApproving || isRejecting}
                  >
                    <XCircle className="h-4 w-4" />
                    {isRejecting ? "Rechazando..." : "Rechazar"}
                  </Button>
                </div>
              )}
              
              {/* Botones de acción generales */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-1"
                  onClick={() => router.push(`/suppliers/${supplier.id}`)}
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
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Proveedor"
        size="lg"
      >
        <SupplierForm
          initialData={supplier}
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
            ¿Estás seguro de que deseas eliminar el proveedor <strong>{getSupplierName()}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            Esta acción no se puede deshacer.
          </p>
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
    </>
  );
}

