"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useClientsStore } from "@/store/clientsStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { ClientsList } from "@/components/clients/ClientsList";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ClientForm } from "./components/ClientForm";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Filter, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

function ClientsContent() {
  const { clients, isLoading, error, fetchClients, createClient } = useClientsStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "activo" | "inactivo">("all");
  const [projectsFilter, setProjectsFilter] = useState<"all" | "with" | "without">("all");
  const [showFilters, setShowFilters] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (organizationId) {
      fetchClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createClient(data);
      await fetchClients();
      toast.success("Cliente creado correctamente");
      setIsCreateModalOpen(false);
    } catch (err: any) {
      console.error("Error al crear cliente:", err);
      toast.error(err.message || "Error al crear el cliente");
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
        <LoadingState message="Cargando clientes…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error al cargar los clientes: {error}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="px-1">
          <BotonVolver />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Clientes</h1>
              <p className="text-gray-600">Gestión de clientes y CRM PMD</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Cliente
            </Button>
          </div>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="bg-white rounded-lg shadow-pmd p-4 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Buscar por nombre, teléfono o email..."
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
            {(searchQuery || statusFilter !== "all" || projectsFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setProjectsFilter("all");
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "activo" | "inactivo")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
                >
                  <option value="all">Todos</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Obras</label>
                <select
                  value={projectsFilter}
                  onChange={(e) => setProjectsFilter(e.target.value as "all" | "with" | "without")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
                >
                  <option value="all">Todas</option>
                  <option value="with">Con obras asignadas</option>
                  <option value="without">Sin obras asignadas</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <ClientsList
          clients={clients || []}
          onRefresh={fetchClients}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          projectsFilter={projectsFilter}
        />

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nuevo Cliente"
          size="lg"
        >
          <ClientForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>
      </div>
    </MainLayout>
  );
}

export default function ClientsPage() {
  return (
    <ProtectedRoute>
      <ClientsContent />
    </ProtectedRoute>
  );
}

