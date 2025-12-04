"use client";

import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useEmployee } from "@/hooks/api/employees";
import { useAlertsStore } from "@/store/alertsStore";
import { useWorks } from "@/hooks/api/works";
import { useRoles } from "@/hooks/api/roles";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { UserAvatar } from "@/components/settings/UserAvatar";
import { Building2, Mail, Phone, Calendar, Bell, Edit, AlertTriangle, FileText, Shield } from "lucide-react";
import Link from "next/link";
import { can } from "@/lib/acl";

function EmployeeDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { employee, isLoading, error } = useEmployee(id);
  const { alerts, fetchAlerts } = useAlertsStore();
  const { works } = useWorks();
  const { roles } = useRoles();

  // Verificar permisos ACL
  if (!can("staff.read")) {
    return (
      <MainLayout>
        <div style={{ backgroundColor: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", color: "rgba(255,59,48,1)", padding: "var(--space-md)", borderRadius: "var(--radius-md)" }}>
          No tienes permisos para ver el detalle del empleado
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando empleado…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div style={{ backgroundColor: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", color: "rgba(255,59,48,1)", padding: "var(--space-md)", borderRadius: "var(--radius-md)" }}>
          Error al cargar el empleado: {error?.message || "Error desconocido"}
        </div>
        <div style={{ marginTop: "var(--space-md)" }}>
          <BotonVolver />
        </div>
      </MainLayout>
    );
  }

  if (!employee) {
    return (
      <MainLayout>
        <div style={{ backgroundColor: "rgba(255,193,7,0.1)", border: "1px solid rgba(255,193,7,0.3)", color: "rgba(255,193,7,1)", padding: "var(--space-md)", borderRadius: "var(--radius-md)" }}>
          Empleado no encontrado
        </div>
        <div style={{ marginTop: "var(--space-md)" }}>
          <BotonVolver />
        </div>
      </MainLayout>
    );
  }

  const name = (employee as any).fullName || (employee as any).name || (employee as any).nombre || "Sin nombre";
  const roleId = (employee as any).roleId || (employee as any).role;
  const role = roles.find((r: any) => r.id === roleId || r.name === roleId);
  const roleName = role?.name || role?.nombre || roleId || "Sin rol";
  const subrole = (employee as any).subrole || "";
  const isActive = (employee as any).isActive !== false;
  const workId = (employee as any).workId;
  const work = works.find((w: any) => w.id === workId);
  const workName = work?.name || work?.title || work?.nombre || null;
  const employeeAlerts = alerts.filter((alert) => alert.personId === id);
  const unreadAlerts = employeeAlerts.filter((a) => !a.read).length;
  const highSeverityAlerts = employeeAlerts.filter((a) => a.severity === "alta").length;
  const mediumSeverityAlerts = employeeAlerts.filter((a) => a.severity === "media").length;

  const handleEdit = () => {
    router.push(`/rrhh/${id}`);
  };

  const handleViewAlerts = () => {
    router.push(`/alerts?personId=${id}`);
  };

  const handleViewAudit = () => {
    router.push(`/audit?entityId=${id}&entity=Employee`);
  };

  return (
    <MainLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
        <div>
          <BotonVolver />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-md)" }}>
            <div>
              <h1 style={{ font: "var(--font-title)", color: "var(--apple-text-primary)", marginBottom: "var(--space-xs)" }}>
                Detalle del Empleado
              </h1>
              <p style={{ font: "var(--font-body)", color: "var(--apple-text-secondary)" }}>
                Información completa del personal
              </p>
            </div>
            {can("staff.manage") && (
              <Button variant="outline" onClick={handleEdit}>
                <Edit style={{ width: "16px", height: "16px", marginRight: "8px" }} />
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* Información Principal */}
        <Card>
          <div style={{ padding: "var(--space-lg)" }}>
            <div style={{ display: "flex", alignItems: "start", gap: "var(--space-md)", marginBottom: "var(--space-lg)" }}>
              <UserAvatar name={name} size="xl" />
              <div style={{ flex: 1 }}>
                <h2 style={{ font: "var(--font-card-title)", color: "var(--apple-text-primary)", marginBottom: "var(--space-sm)" }}>
                  {name}
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <Badge variant={isActive ? "success" : "default"}>
                    {isActive ? "Activo" : "Inactivo"}
                  </Badge>
                  <Badge variant="info">{roleName}</Badge>
                  {subrole && <Badge variant="default">{subrole}</Badge>}
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-md)", marginBottom: "var(--space-lg)" }}>
              {(employee as any).email && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Mail style={{ width: "18px", height: "18px", color: "var(--apple-text-secondary)" }} />
                  <span style={{ fontSize: "14px", color: "var(--apple-text-secondary)" }}>{(employee as any).email}</span>
                </div>
              )}
              {(employee as any).phone && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Phone style={{ width: "18px", height: "18px", color: "var(--apple-text-secondary)" }} />
                  <span style={{ fontSize: "14px", color: "var(--apple-text-secondary)" }}>{(employee as any).phone}</span>
                </div>
              )}
              {(employee as any).hireDate && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Calendar style={{ width: "18px", height: "18px", color: "var(--apple-text-secondary)" }} />
                  <span style={{ fontSize: "14px", color: "var(--apple-text-secondary)" }}>
                    Ingreso: {new Date((employee as any).hireDate).toLocaleDateString("es-AR")}
                  </span>
                </div>
              )}
            </div>

            {/* Obra Asignada */}
            {workName && workId && (
              <div style={{ marginBottom: "var(--space-lg)", padding: "var(--space-md)", backgroundColor: "var(--apple-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--apple-border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Building2 style={{ width: "18px", height: "18px", color: "var(--apple-text-secondary)" }} />
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--apple-text-primary)" }}>
                      Obra Asignada:
                    </span>
                    <Link href={`/works/${workId}`} style={{ fontSize: "14px", color: "var(--apple-blue)", textDecoration: "none" }}>
                      {workName}
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Alertas */}
            {employeeAlerts.length > 0 && (
              <div style={{ marginBottom: "var(--space-lg)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-sm)" }}>
                  <h3 style={{ font: "var(--font-label)", color: "var(--apple-text-primary)" }}>
                    Alertas ({employeeAlerts.length})
                  </h3>
                  <Button variant="ghost" size="sm" onClick={handleViewAlerts}>
                    <Bell style={{ width: "16px", height: "16px", marginRight: "4px" }} />
                    Ver todas
                  </Button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {employeeAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      style={{
                        padding: "var(--space-sm)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid",
                        borderColor:
                          alert.severity === "alta"
                            ? "rgba(255,59,48,0.3)"
                            : alert.severity === "media"
                            ? "rgba(255,193,7,0.3)"
                            : "rgba(0,122,255,0.3)",
                        backgroundColor:
                          alert.severity === "alta"
                            ? "rgba(255,59,48,0.1)"
                            : alert.severity === "media"
                            ? "rgba(255,193,7,0.1)"
                            : "rgba(0,122,255,0.1)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "start", gap: "8px" }}>
                        <AlertTriangle
                          style={{
                            width: "16px",
                            height: "16px",
                            color:
                              alert.severity === "alta"
                                ? "#FF3B30"
                                : alert.severity === "media"
                                ? "#FFC107"
                                : "#007AFF",
                            marginTop: "2px",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--apple-text-primary)" }}>
                            {alert.title || alert.message}
                          </p>
                          {alert.message && alert.title && (
                            <p style={{ fontSize: "12px", color: "var(--apple-text-secondary)", marginTop: "4px" }}>
                              {alert.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {employeeAlerts.length > 5 && (
                    <p style={{ fontSize: "12px", color: "var(--apple-text-secondary)", textAlign: "center", marginTop: "8px" }}>
                      +{employeeAlerts.length - 5} alerta{employeeAlerts.length - 5 !== 1 ? "s" : ""} más
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div style={{ display: "flex", gap: "var(--space-sm)", paddingTop: "var(--space-md)", borderTop: "1px solid var(--apple-border)" }}>
              {can("staff.manage") && (
                <Button variant="outline" onClick={handleEdit} style={{ flex: 1 }}>
                  <Edit style={{ width: "16px", height: "16px", marginRight: "8px" }} />
                  Editar Empleado
                </Button>
              )}
              {employeeAlerts.length > 0 && (
                <Button variant="outline" onClick={handleViewAlerts} style={{ flex: 1 }}>
                  <Bell style={{ width: "16px", height: "16px", marginRight: "8px" }} />
                  Ver Alertas ({unreadAlerts})
                </Button>
              )}
              {can("audit.read") && (
                <Button variant="outline" onClick={handleViewAudit} style={{ flex: 1 }}>
                  <Shield style={{ width: "16px", height: "16px", marginRight: "8px" }} />
                  Ver Auditoría
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

export default function EmployeeDetailPage() {
  return (
    <ProtectedRoute>
      <EmployeeDetailContent />
    </ProtectedRoute>
  );
}

