"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuditStore, AuditLog } from "@/store/auditStore";
import { useToast } from "@/components/ui/Toast";
import { Eye, Trash2, Shield, User, Calendar, FileText } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface AuditListProps {
  logs: AuditLog[];
  onRefresh?: () => void;
  searchQuery?: string;
  moduleFilter?: string;
  userFilter?: string;
  startDateFilter?: string;
  endDateFilter?: string;
}

export function AuditList({
  logs,
  onRefresh,
  searchQuery = "",
  moduleFilter = "all",
  userFilter = "all",
  startDateFilter = "",
  endDateFilter = "",
}: AuditListProps) {
  const router = useRouter();
  const { clearAuditEntry, clearAll } = useAuditStore();
  const { user } = useAuthStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const isAdmin = user?.role === "admin";

  // Filtrar logs
  const filteredLogs = logs.filter((log) => {
    // Búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesAction = log.action?.toLowerCase().includes(query);
      const matchesModule = log.module?.toLowerCase().includes(query);
      const matchesUser = log.user?.toLowerCase().includes(query) || log.userName?.toLowerCase().includes(query);
      const matchesDetails = log.details?.toLowerCase().includes(query);
      if (!matchesAction && !matchesModule && !matchesUser && !matchesDetails) return false;
    }

    // Filtro de módulo
    if (moduleFilter !== "all" && log.module !== moduleFilter) return false;

    // Filtro de usuario
    if (userFilter !== "all" && log.user !== userFilter && log.userId !== userFilter) return false;

    // Filtro de fecha
    if (startDateFilter) {
      const logDate = log.timestamp.split("T")[0];
      if (logDate < startDateFilter) return false;
    }
    if (endDateFilter) {
      const logDate = log.timestamp.split("T")[0];
      if (logDate > endDateFilter) return false;
    }

    return true;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async () => {
    if (!selectedLog) return;
    setIsSubmitting(true);
    try {
      await clearAuditEntry(selectedLog.id);
      await onRefresh?.();
      toast.success("Log eliminado");
      setIsDeleteModalOpen(false);
      setSelectedLog(null);
    } catch (err: any) {
      console.error("Error al eliminar log:", err);
      toast.error(err.message || "Error al eliminar el log");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAll = async () => {
    setIsSubmitting(true);
    try {
      await clearAll();
      await onRefresh?.();
      toast.success("Todos los registros limpiados");
      setIsClearAllModalOpen(false);
    } catch (err: any) {
      console.error("Error al limpiar todos los registros:", err);
      toast.error(err.message || "Error al limpiar los registros");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (filteredLogs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-pmd p-12 text-center">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">
          {logs.length === 0
            ? "No hay registros de auditoría"
            : "No se encontraron registros con los filtros aplicados"}
        </p>
      </div>
    );
  }

  return (
    <>
      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <Button
            variant="outline"
            onClick={() => setIsClearAllModalOpen(true)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4" />
            Limpiar Todo
          </Button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-pmd overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Módulo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha & Hora
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {log.userName || log.user}
                        </div>
                        {log.userId && log.userId !== log.user && (
                          <div className="text-xs text-gray-500">{log.userId}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div className="text-sm text-gray-900">{log.module}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{log.action}</div>
                    {log.details && (
                      <div className="text-xs text-gray-500 mt-1">{log.details}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div className="text-sm text-gray-600">{formatTimestamp(log.timestamp)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/audit/${log.id}`)}
                        className="text-pmd-darkBlue hover:text-pmd-mediumBlue"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLog(log);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLog && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedLog(null);
          }}
          title="Confirmar Eliminación"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              ¿Estás seguro de que deseas eliminar este registro de auditoría?
            </p>
            <p className="text-sm text-gray-500 font-medium">{selectedLog.action}</p>
            <p className="text-sm text-gray-500">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedLog(null);
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
      )}

      <Modal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        title="Confirmar Limpieza Total"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700 font-medium">
            ¿Estás seguro de que deseas eliminar TODOS los registros de auditoría?
          </p>
          <p className="text-sm text-gray-500">
            Esta acción eliminará {logs.length} registro{logs.length !== 1 ? "s" : ""} y no se puede deshacer.
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setIsClearAllModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleClearAll}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Limpiando..." : "Limpiar Todo"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
