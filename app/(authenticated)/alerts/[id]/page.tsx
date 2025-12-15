"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAlertsStore } from "@/store/alertsStore";
import { useWorks } from "@/hooks/api/works";
import { useUsers } from "@/hooks/api/users";
import { LoadingState } from "@/components/ui/LoadingState";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Check, Trash2, Bell, Building2, User, Calendar, Tag, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

function AlertDetailContent() {
  // All hooks must be called unconditionally at the top
  const params = useParams();
  const router = useRouter();
  const { alerts, fetchAlerts, markAsRead, deleteAlert } = useAlertsStore();
  const { works } = useWorks();
  const { users } = useUsers();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Safely extract alertId from params
  const alertId = typeof params?.id === "string" ? params.id : null;

  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guard check after all hooks
  if (!alertId) {
    return null;
  }

  const alert = alerts.find((a) => a.id === alertId);

  if (!alert) {
    return (
      <MainLayout>
        <LoadingState message="Cargando alerta…" />
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

  const getSeverityVariant = (severity: "info" | "warning" | "critical") => {
    if (severity === "critical") return "error";
    if (severity === "warning") return "warning";
    return "info";
  };

  const getSeverityLabel = (severity: "info" | "warning" | "critical") => {
    const labels: Record<string, string> = {
      critical: "Crítico",
      warning: "Advertencia",
      info: "Info",
    };
    return labels[severity] || severity;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      work: "Obra",
      supplier: "Proveedor",
      document: "Documento",
      accounting: "Contable",
      cashbox: "Caja",
      user: "Usuario",
      general: "General",
    };
    return labels[type] || type;
  };

  const handleMarkAsRead = async () => {
    setIsSubmitting(true);
    try {
      await markAsRead(alertId);
      await fetchAlerts();
      toast.success("Alerta marcada como leída");
    } catch (err: any) {
      console.error("Error al marcar alerta:", err);
      toast.error(err.message || "Error al marcar la alerta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteAlert(alertId);
      toast.success("Alerta eliminada correctamente");
      router.push("/alerts");
    } catch (err: any) {
      console.error("Error al eliminar alerta:", err);
      toast.error(err.message || "Error al eliminar la alerta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="px-1">
          <BotonVolver />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {alert.title || "Detalle de Alerta"}
              </h1>
              <p className="text-gray-600">Información completa de la alerta</p>
            </div>
            <div className="flex gap-2">
              {!alert.read && (
                <Button
                  variant="outline"
                  onClick={handleMarkAsRead}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Marcar como leída
                </Button>
              )}
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
                  <Bell className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Mensaje</p>
                    <p className="text-base font-medium text-gray-900">{alert.message || alert.title || "Sin mensaje"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="text-base font-medium text-gray-900">{getTypeLabel(alert.type || alert.category || "general")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Severidad</p>
                    <Badge variant={getSeverityVariant(alert.severity || "info")}>
                      {getSeverityLabel(alert.severity || "info")}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <Badge variant={alert.read ? "default" : "info"}>
                      {alert.read ? "Leída" : "No leída"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Relaciones */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-pmd-darkBlue mb-4">Relaciones</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Obra asociada</p>
                    <p className="text-base font-medium text-gray-900">
                      {(alert as any).work_id || (alert as any).workId ? getWorkName((alert as any).work_id || (alert as any).workId) : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Usuario involucrado</p>
                    <p className="text-base font-medium text-gray-900">
                      {(alert as any).user_id || (alert as any).userId ? getUserName((alert as any).user_id || (alert as any).userId) : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="text-base font-medium text-gray-900">
                      {new Date((alert as any).date || alert.createdAt || new Date()).toLocaleDateString("es-AR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirmar Eliminación"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              ¿Estás seguro de que deseas eliminar esta alerta?
            </p>
            <p className="text-sm text-gray-500 font-medium">{alert.message || alert.title || "Sin mensaje"}</p>
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

export default function AlertDetailPage() {
  return (
    <ProtectedRoute>
      <AlertDetailContent />
    </ProtectedRoute>
  );
}

