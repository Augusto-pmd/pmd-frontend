"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuditLog } from "@/hooks/api/audit";
import { LoadingState } from "@/components/ui/LoadingState";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Card, CardContent } from "@/components/ui/Card";
import { Shield, User, Calendar, FileText, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

function AuditDetailContent() {
  // All hooks must be called unconditionally at the top
  const params = useParams();
  
  // Safely extract logId from params
  const logId = typeof params?.id === "string" ? params.id : null;
  
  const { log, isLoading, error } = useAuditLog(logId || "");
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;

  // Guard check after all hooks
  if (!logId) {
    return null;
  }

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
        <LoadingState message="Cargando registro de auditoría…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div style={{ backgroundColor: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", color: "rgba(255,59,48,1)", padding: "var(--space-md)", borderRadius: "var(--radius-md)" }}>
          Error al cargar el registro: {error.message || "Error desconocido"}
        </div>
      </MainLayout>
    );
  }

  if (!log) {
    return (
      <MainLayout>
        <div style={{ backgroundColor: "var(--apple-surface)", border: "1px solid var(--apple-border)", borderRadius: "var(--radius-xl)", padding: "var(--space-xl)" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <Shield className="w-12 h-12 mb-4" style={{ color: "var(--apple-text-secondary)" }} />
            <p style={{ font: "var(--font-body)", color: "var(--apple-text-secondary)" }}>
              Registro de auditoría no encontrado
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasChanges = log.before || log.after;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <BotonVolver />
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Detalle de Auditoría</h1>
            <p className="text-gray-600">Información completa del registro</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Principal */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información General</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Usuario</p>
                    <p className="text-base font-medium text-gray-900">
                      {log.userName || log.user}
                    </p>
                    {log.userId && log.userId !== log.user && (
                      <p className="text-xs text-gray-500 mt-1">ID: {log.userId}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Módulo</p>
                    <p className="text-base font-medium text-gray-900">{log.module}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Acción</p>
                    <p className="text-base font-medium text-gray-900">{log.action}</p>
                    {log.details && (
                      <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha & Hora</p>
                    <p className="text-base font-medium text-gray-900">
                      {formatTimestamp(log.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cambios (si existen) */}
          {hasChanges && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-pmd-darkBlue mb-4">Cambios Realizados</h2>
                <div className="space-y-4">
                  {log.before && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Estado Anterior</p>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                          {JSON.stringify(log.before, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {log.after && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Estado Posterior</p>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                          {JSON.stringify(log.after, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {log.before && log.after && (
                    <div className="flex items-center pt-2">
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Si no hay cambios, mostrar información adicional */}
          {!hasChanges && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-pmd-darkBlue mb-4">Información Adicional</h2>
                <div className="space-y-4">
                  {log.entity && (
                    <div>
                      <p className="text-sm text-gray-500">Entidad</p>
                      <p className="text-base font-medium text-gray-900">{log.entity}</p>
                    </div>
                  )}
                  {log.entityId && (
                    <div>
                      <p className="text-sm text-gray-500">ID de Entidad</p>
                      <p className="text-base font-medium text-gray-900">{log.entityId}</p>
                    </div>
                  )}
                  {log.details && (
                    <div>
                      <p className="text-sm text-gray-500">Detalles</p>
                      <p className="text-base text-gray-700">{log.details}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default function AuditDetailPage() {
  return (
    <ProtectedRoute>
      <AuditDetailContent />
    </ProtectedRoute>
  );
}
