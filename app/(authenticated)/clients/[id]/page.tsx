"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useClientsStore } from "@/store/clientsStore";
import { useWorks } from "@/hooks/api/works";
import { LoadingState } from "@/components/ui/LoadingState";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Edit, Trash2, Building2, Mail, Phone, MapPin, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ClientForm } from "../components/ClientForm";
import { useState } from "react";

function ClientDetailContent() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { clients, fetchClients, updateClient, deleteClient } = useClientsStore();
  const { works } = useWorks();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const client = clients.find((c) => c.id === clientId);

  if (!client) {
    return (
      <MainLayout>
        <LoadingState message="Cargando cliente…" />
      </MainLayout>
    );
  }

  const getWorkName = (workId: string) => {
    const work = works.find((w: any) => w.id === workId);
    if (!work) return workId;
    const name = work.name || work.title || work.nombre || "";
    const squareMeters = work.squareMeters ? ` ${work.squareMeters} m²` : "";
    return `${name}${squareMeters}`;
  };

  const handleUpdate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await updateClient(clientId, data);
      await fetchClients();
      toast.success("Cliente actualizado correctamente");
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error("Error al actualizar cliente:", err);
      toast.error(err.message || "Error al actualizar el cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteClient(clientId);
      toast.success("Cliente eliminado correctamente");
      router.push("/clients");
    } catch (err: any) {
      console.error("Error al eliminar cliente:", err);
      toast.error(err.message || "Error al eliminar el cliente");
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
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">{client.name}</h1>
              <p className="text-gray-600">Información completa del cliente</p>
            </div>
            <div className="flex gap-2">
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
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="text-base font-medium text-gray-900">{client.name}</p>
                  </div>
                </div>

                {client.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-base font-medium text-gray-900">{client.email}</p>
                    </div>
                  </div>
                )}

                {client.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="text-base font-medium text-gray-900">{client.phone}</p>
                    </div>
                  </div>
                )}

                {client.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="text-base font-medium text-gray-900">{client.address}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <Badge variant={client.status === "activo" ? "success" : "error"}>
                      {client.status === "activo" ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Obras Asociadas */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Obras Asociadas</h2>
              {client.projects && client.projects.length > 0 ? (
                <div className="space-y-2">
                  {client.projects.map((projectId) => (
                    <div
                      key={projectId}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => router.push(`/works/${projectId}`)}
                    >
                      <p className="text-sm font-medium text-gray-900">{getWorkName(projectId)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hay obras asociadas</p>
              )}
            </CardContent>
          </Card>

          {/* Notas */}
          {client.notes && (
            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Notas Internas</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documentación (Placeholder) */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentación</h2>
              <p className="text-gray-500 text-sm italic">Documentación del cliente (próximamente)</p>
            </CardContent>
          </Card>
        </div>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Editar Cliente"
          size="lg"
        >
          <ClientForm
            initialData={client}
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
              ¿Estás seguro de que deseas eliminar el cliente <strong>{client.name}</strong>?
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

export default function ClientDetailPage() {
  return (
    <ProtectedRoute>
      <ClientDetailContent />
    </ProtectedRoute>
  );
}

