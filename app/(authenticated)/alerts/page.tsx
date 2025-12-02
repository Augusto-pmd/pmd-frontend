"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAlertsStore } from "@/store/alertsStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { AlertsList } from "@/components/alerts/AlertsList";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Search, Filter, X, Bell } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useWorks } from "@/hooks/api/works";
import { generateAutomaticAlerts } from "@/lib/alertsEngine";

function AlertsContent() {
  const { alerts, isLoading, error, fetchAlerts } = useAlertsStore();
  const authState = useAuthStore.getState();
  const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
  const { works } = useWorks();

  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | "alta" | "media" | "baja">("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [workFilter, setWorkFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (organizationId) {
      fetchAlerts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  // Generar alertas automáticas en modo simulación
  useEffect(() => {
    const autoAlerts = generateAutomaticAlerts();
    if (autoAlerts.length > 0) {
      // Las alertas automáticas se generan pero no se agregan automáticamente
      // Se pueden agregar manualmente si se desea
    }
  }, []);

  if (!organizationId) {
    return (
      <MainLayout>
        <LoadingState message="Cargando organización..." />
      </MainLayout>
    );
  }

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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error al cargar las alertas: {error}
        </div>
      </MainLayout>
    );
  }

  // Obtener tipos únicos de alertas
  const alertTypes = Array.from(
    new Set(alerts.map((alert) => alert.type).filter(Boolean))
  ) as string[];

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="px-1">
          <BotonVolver />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Alertas</h1>
              <p className="text-gray-600">
                Sistema de alertas y notificaciones PMD
                {unreadCount > 0 && (
                  <span className="ml-2 text-gray-900 font-semibold">
                    ({unreadCount} no leída{unreadCount !== 1 ? "s" : ""})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Buscar por mensaje o palabra clave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            {(searchQuery || severityFilter !== "all" || typeFilter !== "all" || workFilter !== "all" || dateFilter) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setSeverityFilter("all");
                  setTypeFilter("all");
                  setWorkFilter("all");
                  setDateFilter("");
                }}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severidad</label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as "all" | "alta" | "media" | "baja")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
                >
                  <option value="all">Todas</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
                >
                  <option value="all">Todos</option>
                  {alertTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "seguro" ? "Seguro" : type === "documentacion" ? "Documentación" : type === "obra" ? "Obra" : type === "contable" ? "Contable" : "General"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Obra</label>
                <select
                  value={workFilter}
                  onChange={(e) => setWorkFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
                >
                  <option value="all">Todas</option>
                  {works.map((work: any) => {
                    const workName = work.name || work.title || work.nombre || work.id;
                    return (
                      <option key={work.id} value={work.id}>
                        {workName}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <AlertsList
          alerts={alerts || []}
          onRefresh={fetchAlerts}
          searchQuery={searchQuery}
          severityFilter={severityFilter}
          typeFilter={typeFilter}
          workFilter={workFilter}
          dateFilter={dateFilter}
        />
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
