"use client";

import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuditLog } from "@/hooks/api/audit";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BotonVolver } from "@/components/ui/BotonVolver";

function AuditDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { log, isLoading, error } = useAuditLog(id);

  const getActionType = (action: string | undefined): "success" | "warning" | "error" | "info" => {
    if (!action) return "info";
    const actionLower = action.toLowerCase();
    
    if (
      actionLower.includes("create") ||
      actionLower.includes("crear") ||
      actionLower.includes("login") ||
      actionLower.includes("approve") ||
      actionLower.includes("aprobar")
    ) {
      return "success";
    }
    
    if (
      actionLower.includes("delete") ||
      actionLower.includes("eliminar") ||
      actionLower.includes("reject") ||
      actionLower.includes("rechazar")
    ) {
      return "error";
    }
    
    if (
      actionLower.includes("update") ||
      actionLower.includes("actualizar") ||
      actionLower.includes("modify") ||
      actionLower.includes("modificar")
    ) {
      return "warning";
    }
    
    return "info";
  };

  const translateAction = (action: string | undefined): string => {
    if (!action) return "Acción desconocida";
    const actionLower = action.toLowerCase();
    
    const translations: Record<string, string> = {
      create: "Crear",
      crear: "Crear",
      update: "Actualizar",
      actualizar: "Actualizar",
      delete: "Eliminar",
      eliminar: "Eliminar",
      login: "Inicio de sesión",
      approve: "Aprobar",
      aprobar: "Aprobar",
      reject: "Rechazar",
      rechazar: "Rechazar",
    };
    
    for (const [key, value] of Object.entries(translations)) {
      if (actionLower.includes(key)) {
        return value;
      }
    }
    
    return action;
  };

  const translateModule = (module: string | undefined): string => {
    if (!module) return "Sistema";
    const moduleLower = module.toLowerCase();
    
    const translations: Record<string, string> = {
      works: "Obras",
      obras: "Obras",
      suppliers: "Proveedores",
      proveedores: "Proveedores",
      accounting: "Contabilidad",
      contabilidad: "Contabilidad",
      users: "Usuarios",
      usuarios: "Usuarios",
      roles: "Roles",
      cashboxes: "Cajas",
      cajas: "Cajas",
      "cash-movements": "Movimientos de Caja",
      audit: "Auditoría",
      auditoria: "Auditoría",
    };
    
    for (const [key, value] of Object.entries(translations)) {
      if (moduleLower.includes(key)) {
        return value;
      }
    }
    
    return module;
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar el registro de auditoría: {error.message || "Error desconocido"}
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/audit")}>Volver a Auditoría</Button>
        </div>
      </MainLayout>
    );
  }

  if (!log) {
    return (
      <MainLayout>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-pmd">
          Registro de auditoría no encontrado
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/audit")}>Volver a Auditoría</Button>
        </div>
      </MainLayout>
    );
  }

  const action = log.accion || log.action || "";
  const actionType = getActionType(action);
  const moduleName = log.modulo || log.entity || log.entityType || "";
  const userName = log.usuario || log.userName || log.userId || "Usuario desconocido";
  const date = log.fecha || log.timestamp || log.createdAt;
  const entityId = log.entityId || log.id;

  const renderField = (label: string, value: any, formatter?: (val: any) => string) => {
    if (value === null || value === undefined || value === "") return null;
    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">{label}</h3>
        <p className="text-gray-900">{formatter ? formatter(value) : String(value)}</p>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="px-1">
          <BotonVolver />
        </div>
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Detalle de auditoría</h1>
            <p className="text-gray-600">Información completa del registro de auditoría seleccionado</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/audit")}>
            Volver a Auditoría
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Registro de Auditoría</CardTitle>
              <Badge variant={actionType}>{translateAction(action)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField("Usuario", userName)}
              {renderField("Acción", translateAction(action))}
              {renderField("Módulo", translateModule(moduleName))}
              {renderField("Fecha", date, formatDate)}
              {entityId && renderField("ID del objeto afectado", entityId)}
            </div>

            {(log.descripcion || log.details) && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h3>
                <p className="text-gray-900">{log.descripcion || log.details}</p>
              </div>
            )}

            {log.oldData && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Datos anteriores</h3>
                <pre className="bg-gray-50 p-4 rounded-pmd text-sm overflow-x-auto">
                  {JSON.stringify(log.oldData, null, 2)}
                </pre>
              </div>
            )}

            {log.newData && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Datos nuevos</h3>
                <pre className="bg-gray-50 p-4 rounded-pmd text-sm overflow-x-auto">
                  {JSON.stringify(log.newData, null, 2)}
                </pre>
              </div>
            )}

            {/* Mostrar campos adicionales si existen */}
            {Object.keys(log).some(
              (key) =>
                ![
                  "id",
                  "accion",
                  "action",
                  "usuario",
                  "userName",
                  "userId",
                  "modulo",
                  "entity",
                  "entityType",
                  "entityId",
                  "fecha",
                  "timestamp",
                  "createdAt",
                  "descripcion",
                  "details",
                  "oldData",
                  "newData",
                ].includes(key) &&
                log[key] !== null &&
                log[key] !== undefined &&
                log[key] !== ""
            ) && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Información adicional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(log)
                    .filter(
                      (key) =>
                        ![
                          "id",
                          "accion",
                          "action",
                          "usuario",
                          "userName",
                          "userId",
                          "modulo",
                          "entity",
                          "entityType",
                          "entityId",
                          "fecha",
                          "timestamp",
                          "createdAt",
                          "descripcion",
                          "details",
                          "oldData",
                          "newData",
                        ].includes(key) &&
                        log[key] !== null &&
                        log[key] !== undefined &&
                        log[key] !== ""
                    )
                    .map((key) => (
                      <div key={key}>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </h3>
                        <p className="text-gray-900">
                          {typeof log[key] === "object"
                            ? JSON.stringify(log[key], null, 2)
                            : String(log[key])}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {log.id && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">ID del registro</h3>
                <p className="text-gray-600 font-mono text-sm">{log.id}</p>
              </div>
            )}
          </CardContent>
        </Card>
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

