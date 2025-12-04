"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ClientForm } from "@/app/(authenticated)/clients/components/ClientForm";
import { useClientsStore } from "@/store/clientsStore";
import { useToast } from "@/components/ui/Toast";
import { Edit, Trash2, Eye, Search, Filter } from "lucide-react";
import { useWorks } from "@/hooks/api/works";

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  status?: "activo" | "inactivo";
  projects?: string[];
  [key: string]: any;
}

interface ClientsListProps {
  clients: Client[];
  onRefresh?: () => void;
  searchQuery?: string;
  statusFilter?: "all" | "activo" | "inactivo";
  projectsFilter?: "all" | "with" | "without";
}

export function ClientsList({
  clients,
  onRefresh,
  searchQuery = "",
  statusFilter = "all",
  projectsFilter = "all",
}: ClientsListProps) {
  const router = useRouter();
  const { works } = useWorks();
  const { deleteClient } = useClientsStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Filtrar clientes
  const filteredClients = clients.filter((client) => {
    // Búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = client.name?.toLowerCase().includes(query);
      const matchesPhone = client.phone?.toLowerCase().includes(query);
      const matchesEmail = client.email?.toLowerCase().includes(query);
      if (!matchesName && !matchesPhone && !matchesEmail) return false;
    }

    // Filtro de estado
    if (statusFilter !== "all" && client.status !== statusFilter) return false;

    // Filtro de obras
    if (projectsFilter === "with" && (!client.projects || client.projects.length === 0)) return false;
    if (projectsFilter === "without" && client.projects && client.projects.length > 0) return false;

    return true;
  });

  const getWorkName = (workId: string) => {
    const work = works.find((w: any) => w.id === workId);
    if (!work) return workId;
    const name = work.name || work.title || work.nombre || "";
    const squareMeters = work.squareMeters ? ` ${work.squareMeters} m²` : "";
    return `${name}${squareMeters}`;
  };

  const handleDelete = async () => {
    if (!selectedClient) return;
    setIsSubmitting(true);
    try {
      await deleteClient(selectedClient.id);
      await onRefresh?.();
      toast.success("Cliente eliminado correctamente");
      setIsDeleteModalOpen(false);
      setSelectedClient(null);
    } catch (err: any) {
      console.error("Error al eliminar cliente:", err);
      toast.error(err.message || "Error al eliminar el cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (filteredClients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-pmd p-12 text-center">
        <p className="text-gray-600 text-lg">
          {clients.length === 0
            ? "No hay clientes registrados"
            : "No se encontraron clientes con los filtros aplicados"}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          {clients.length === 0
            ? 'Haz clic en "Nuevo Cliente" para agregar uno'
            : "Intenta ajustar los filtros de búsqueda"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-pmd overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Obras Asignadas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{client.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{client.phone || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{client.email || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={client.status === "activo" ? "success" : "error"}>
                      {client.status === "activo" ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {client.projects && client.projects.length > 0 ? (
                        client.projects.slice(0, 2).map((projectId: string) => (
                          <Badge key={projectId} variant="default" className="text-xs">
                            {getWorkName(projectId)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">Sin obras</span>
                      )}
                      {client.projects && client.projects.length > 2 && (
                        <Badge variant="default" className="text-xs">
                          +{client.projects.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/clients/${client.id}`)}
                        className="text-pmd-darkBlue hover:text-pmd-mediumBlue"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedClient(client);
                          setIsEditModalOpen(true);
                        }}
                        className="text-pmd-darkBlue hover:text-pmd-mediumBlue"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedClient(client);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedClient && (
        <>
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedClient(null);
            }}
            title="Editar Cliente"
            size="lg"
          >
            <ClientForm
              initialData={selectedClient}
              onSubmit={async (data) => {
                const { updateClient } = useClientsStore.getState();
                setIsSubmitting(true);
                try {
                  await updateClient(selectedClient.id, data);
                  await onRefresh?.();
                  toast.success("Cliente actualizado correctamente");
                  setIsEditModalOpen(false);
                  setSelectedClient(null);
                } catch (err: any) {
                  console.error("Error al actualizar cliente:", err);
                  toast.error(err.message || "Error al actualizar el cliente");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedClient(null);
              }}
              isLoading={isSubmitting}
            />
          </Modal>

          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedClient(null);
            }}
            title="Confirmar Eliminación"
            size="md"
          >
            <div className="space-y-4">
              <p className="text-gray-700">
                ¿Estás seguro de que deseas eliminar el cliente <strong>{selectedClient.name}</strong>?
              </p>
              <p className="text-sm text-gray-500">Esta acción no se puede deshacer.</p>
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedClient(null);
                  }}
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
      )}
    </>
  );
}

