"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAlertsStore } from "@/store/alertsStore";
import { useUsers } from "@/hooks/api/users";
import { LoadingState } from "@/components/ui/LoadingState";
import { AlertsList } from "@/components/alerts/AlertsList";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AlertForm } from "@/app/(authenticated)/alerts/components/AlertForm";
import { useToast } from "@/components/ui/Toast";
import { Plus } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

function StaffAlertsContent() {
  const params = useParams();
  const personId = params.id as string;
  const { alerts, isLoading, error, fetchAlerts, createAlert } = useAlertsStore();
  const { users } = useUsers();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const user = users?.find((u: any) => u.id === personId);
  const userName = user ? (user.fullName || user.name || user.nombre || personId) : personId;

  useEffect(() => {
    if (organizationId) {
      fetchAlerts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  // Filtrar alertas de este empleado
  const staffAlerts = alerts.filter((alert) => alert.personId === personId);

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createAlert({ ...data, personId, type: "rrhh" });
      await fetchAlerts();
      toast.success("Alerta creada correctamente");
      setIsCreateModalOpen(false);
    } catch (err: any) {
      console.error("Error al crear alerta:", err);
      toast.error(err.message || "Error al crear la alerta");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!organizationId) {
    return (
      <MainLayout>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <p className="font-semibold mb-2">No se pudo determinar la organización</p>
          <p className="text-sm">Por favor, vuelve a iniciar sesión para continuar.</p>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando alertas del empleado…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div style={{ backgroundColor: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", color: "rgba(255,59,48,1)", padding: "var(--space-md)", borderRadius: "var(--radius-md)" }}>
          Error al cargar las alertas: {error}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
        <div>
          <BotonVolver />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-md)" }}>
            <div>
              <h1 style={{ font: "var(--font-title)", color: "var(--apple-text-primary)", marginBottom: "var(--space-xs)" }}>
                Alertas - {userName}
              </h1>
              <p style={{ font: "var(--font-body)", color: "var(--apple-text-secondary)" }}>
                Alertas asociadas a este empleado
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus style={{ width: "16px", height: "16px", marginRight: "8px" }} />
              Nueva Alerta
            </Button>
          </div>
        </div>

        <AlertsList
          alerts={staffAlerts}
          onRefresh={fetchAlerts}
        />

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nueva Alerta para este Empleado"
          size="lg"
        >
          <AlertForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
            defaultPersonId={personId}
          />
        </Modal>
      </div>
    </MainLayout>
  );
}

export default function StaffAlertsPage() {
  return (
    <ProtectedRoute>
      <StaffAlertsContent />
    </ProtectedRoute>
  );
}

