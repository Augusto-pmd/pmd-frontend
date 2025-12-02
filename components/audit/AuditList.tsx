"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TableContainer } from "@/components/ui/TableContainer";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
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

  const filteredLogs = logs.filter((log) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesAction = log.action?.toLowerCase().includes(query);
      const matchesModule = log.module?.toLowerCase().includes(query);
      const matchesUser = log.user?.toLowerCase().includes(query) || log.userName?.toLowerCase().includes(query);
      const matchesDetails = log.details?.toLowerCase().includes(query);
      if (!matchesAction && !matchesModule && !matchesUser && !matchesDetails) return false;
    }

    if (moduleFilter !== "all" && log.module !== moduleFilter) return false;

    if (userFilter !== "all" && log.user !== userFilter && log.userId !== userFilter) return false;

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
      <div style={{
        backgroundColor: "var(--apple-surface)",
        border: "1px solid var(--apple-border)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-apple)",
        padding: "40px 0",
        textAlign: "center",
        fontFamily: "Inter, system-ui, sans-serif"
      }}>
        <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--apple-text-secondary)" }} />
        <p style={{ font: "var(--font-body)", color: "var(--apple-text-secondary)" }}>
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
        <div style={{ marginBottom: "var(--space-md)", display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outline"
            onClick={() => setIsClearAllModalOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", color: "#FF3B30" }}
          >
            <Trash2 className="w-4 h-4" />
            Limpiar Todo
          </Button>
        </div>
      )}

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Módulo</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Fecha & Hora</TableHead>
              <TableHead align="right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <User className="w-4 h-4" style={{ color: "var(--apple-text-secondary)", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--apple-text-primary)" }}>
                        {log.userName || log.user}
                      </div>
                      {log.userId && log.userId !== log.user && (
                        <div style={{ fontSize: "12px", color: "var(--apple-text-secondary)" }}>{log.userId}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText className="w-4 h-4" style={{ color: "var(--apple-text-secondary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", color: "var(--apple-text-primary)" }}>{log.module}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ fontSize: "14px", color: "var(--apple-text-primary)" }}>{log.action}</div>
                  {log.details && (
                    <div style={{ fontSize: "12px", color: "var(--apple-text-secondary)", marginTop: "4px" }}>
                      {log.details}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Calendar className="w-4 h-4" style={{ color: "var(--apple-text-secondary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", color: "var(--apple-text-secondary)" }}>
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                </TableCell>
                <TableCell align="right">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                    <Button
                      variant="icon"
                      size="sm"
                      onClick={() => router.push(`/audit/${log.id}`)}
                      style={{ color: "var(--apple-blue)" }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="icon"
                        size="sm"
                        onClick={() => {
                          setSelectedLog(log);
                          setIsDeleteModalOpen(true);
                        }}
                        style={{ color: "#FF3B30" }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <p style={{ font: "var(--font-body)", color: "var(--apple-text-primary)" }}>
              ¿Estás seguro de que deseas eliminar este registro de auditoría?
            </p>
            <p style={{ fontSize: "13px", color: "var(--apple-text-secondary)", fontWeight: 500 }}>
              {selectedLog.action}
            </p>
            <p style={{ fontSize: "13px", color: "var(--apple-text-secondary)" }}>
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", paddingTop: "var(--space-md)" }}>
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
                variant="outline"
                onClick={handleDelete}
                disabled={isSubmitting}
                style={{ color: "#FF3B30", borderColor: "#FF3B30" }}
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
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <p style={{ font: "var(--font-body)", color: "var(--apple-text-primary)", fontWeight: 500 }}>
            ¿Estás seguro de que deseas eliminar TODOS los registros de auditoría?
          </p>
          <p style={{ fontSize: "13px", color: "var(--apple-text-secondary)" }}>
            Esta acción eliminará {logs.length} registro{logs.length !== 1 ? "s" : ""} y no se puede deshacer.
          </p>
          <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", paddingTop: "var(--space-md)" }}>
            <Button
              variant="outline"
              onClick={() => setIsClearAllModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={isSubmitting}
              style={{ color: "#FF3B30", borderColor: "#FF3B30" }}
            >
              {isSubmitting ? "Limpiando..." : "Limpiar Todo"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
