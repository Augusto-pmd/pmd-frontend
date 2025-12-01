"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAlerts, alertApi } from "@/hooks/api/alerts";
import { useState } from "react";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { useSWRConfig } from "swr";
import { BotonVolver } from "@/components/ui/BotonVolver";

function AlertsContent() {
  const { alerts, isLoading, error, mutate } = useAlerts();
  const { mutate: globalMutate } = useSWRConfig();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const filteredAlerts = alerts?.filter((alert: any) => {
    if (filter === "all") return true;
    return alert.read === (filter === "read");
  });

  const handleMarkAsRead = async (id: string) => {
    try {
      await alertApi.markAsRead(id);
      mutate();
      globalMutate("/alerts");
    } catch (error: any) {
      alert(error.message || "Error al marcar la alerta como leída");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando alertas…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar las alertas: {error.message || "Error desconocido"}
        </div>
      </MainLayout>
    );
  }

  const unreadCount = alerts?.filter((a: any) => !a.read).length || 0;
  const readCount = alerts?.filter((a: any) => a.read).length || 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <BotonVolver />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Alertas</h1>
            <p className="text-gray-600">Notificaciones y alertas del sistema</p>
          </div>
          <div className="flex gap-2">
            {(["all", "unread", "read"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-pmd font-medium transition-colors ${
                  filter === f
                    ? "bg-pmd-darkBlue text-pmd-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f === "all" ? "Todas" : f === "unread" ? "No leídas" : "Leídas"}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-pmd p-6">
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Total de Alertas</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">{alerts?.length || 0}</p>
              </div>
              <div className="bg-yellow-50 rounded-pmd p-4 border-l-4 border-yellow-400">
                <p className="text-sm text-gray-600 mb-1">No Leídas</p>
                <p className="text-2xl font-bold text-yellow-600">{unreadCount}</p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Leídas</p>
                <p className="text-2xl font-bold text-gray-600">{readCount}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-pmd-darkBlue">Lista de Alertas</h2>
            {filteredAlerts?.length === 0 ? (
              <EmptyState
                title="No se encontraron alertas"
                description="Las alertas aparecerán aquí cuando haya notificaciones del sistema"
              />
            ) : (
              <div className="space-y-2">
                {filteredAlerts?.map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-pmd border ${
                      !alert.read ? "bg-yellow-50 border-yellow-200" : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-pmd-darkBlue">{alert.title || "Alerta"}</h3>
                          <Badge variant={!alert.read ? "warning" : "default"}>
                            {alert.read ? "Leída" : "No leída"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{alert.message || alert.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {alert.createdAt ? new Date(alert.createdAt).toLocaleString("es-ES") : ""}
                        </p>
                      </div>
                      {!alert.read && (
                        <button
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="ml-4 px-3 py-1 text-sm bg-pmd-darkBlue text-pmd-white rounded-pmd hover:bg-pmd-mediumBlue"
                        >
                          Marcar como Leída
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function AlertsPage() {
  return (
    <ProtectedRoute>
      <AlertsContent />
    </ProtectedRoute>
  );
}
