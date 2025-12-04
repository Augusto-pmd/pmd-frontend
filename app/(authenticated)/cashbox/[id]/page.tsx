"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCashboxStore, CashMovement } from "@/store/cashboxStore";
import { useSuppliers } from "@/hooks/api/suppliers";
import { useWorks } from "@/hooks/api/works";
import { useAuthStore } from "@/store/authStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { MovementForm } from "../components/MovementForm";
import { useToast } from "@/components/ui/Toast";

function CashboxDetailContent() {
  const params = useParams();
  const router = useRouter();
  const cashboxId = params.id as string;
  
  const { cashboxes, movements, isLoading, error, fetchCashboxes, fetchMovements, closeCashbox, deleteMovement } = useCashboxStore();
  const { suppliers } = useSuppliers();
  const { works } = useWorks();
  const { getUserSafe } = useAuthStore();
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [editingMovement, setEditingMovement] = useState<CashMovement | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const toast = useToast();

  const user = getUserSafe();
  const organizationId = user?.organizationId;

  const cashbox = cashboxes.find((c) => c.id === cashboxId);
  const cashboxMovements = movements[cashboxId] || [];

  useEffect(() => {
    if (organizationId) {
      fetchCashboxes();
    }
  }, [organizationId, fetchCashboxes]);

  useEffect(() => {
    if (cashboxId && organizationId) {
      fetchMovements(cashboxId);
    }
  }, [cashboxId, organizationId, fetchMovements]);

  if (!organizationId) {
    return (
      <MainLayout>
        <LoadingState message="Cargando organización..." />
      </MainLayout>
    );
  }

  if (isLoading && !cashbox) {
    return (
      <MainLayout>
        <LoadingState message="Cargando caja..." />
      </MainLayout>
    );
  }

  if (!cashbox) {
    return (
      <MainLayout>
        <div style={{ backgroundColor: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", color: "rgba(255,59,48,1)", padding: "var(--space-md)", borderRadius: "var(--radius-md)" }}>
          Caja no encontrada
        </div>
      </MainLayout>
    );
  }

  const isClosed = cashbox.isClosed || cashbox.closedAt;

  // Calcular totales
  const calculateTotals = () => {
    let totalIngresos = 0;
    let totalEgresos = 0;
    let totalFacturas = 0;
    let totalComprobantes = 0;
    let cantidadFacturas = 0;
    let cantidadComprobantes = 0;
    const facturas: CashMovement[] = [];

    cashboxMovements.forEach((movement) => {
      const type = movement.type === "ingreso" || movement.type === "income" ? "ingreso" : "egreso";
      const amount = movement.amount || 0;

      if (type === "ingreso") {
        totalIngresos += amount;
      } else {
        totalEgresos += amount;
        if (movement.typeDocument === "factura") {
          totalFacturas += amount;
          cantidadFacturas++;
          facturas.push(movement);
        } else if (movement.typeDocument === "comprobante") {
          totalComprobantes += amount;
          cantidadComprobantes++;
        }
      }
    });

    const saldoInicial = cashbox.balance || 0;
    const saldoFinal = saldoInicial + totalIngresos - totalEgresos;
    const diferencia = saldoFinal;

    return {
      totalIngresos,
      totalEgresos,
      totalFacturas,
      totalComprobantes,
      cantidadFacturas,
      cantidadComprobantes,
      saldoInicial,
      saldoFinal,
      diferencia,
      facturas,
    };
  };

  const totals = calculateTotals();
  const balance = totals.saldoFinal;

  const handleCloseCashbox = async () => {
    setShowCloseModal(true);
  };

  const confirmCloseCashbox = async () => {
    try {
      await closeCashbox(cashboxId);
      toast.success("Caja cerrada correctamente");
      setShowCloseModal(false);
    } catch (error: any) {
      toast.error(error.message || "Error al cerrar la caja");
    }
  };

  const handleDeleteMovement = async (movementId: string) => {
    if (!confirm("¿Estás seguro de eliminar este movimiento?")) {
      return;
    }

    try {
      await deleteMovement(cashboxId, movementId);
      toast.success("Movimiento eliminado");
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar movimiento");
    }
  };

  const handleEditMovement = (movement: CashMovement) => {
    setEditingMovement(movement);
    setShowMovementForm(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return "-";
    const supplier = suppliers?.find((s: any) => s.id === supplierId);
    return supplier?.name || supplier?.nombre || `Proveedor ${supplierId.slice(0, 8)}`;
  };

  const getWorkName = (workId?: string) => {
    if (!workId) return "-";
    const work = works?.find((w: any) => w.id === workId);
    return work?.name || work?.nombre || work?.title || `Obra ${workId.slice(0, 8)}`;
  };

  const getMovementTypeLabel = (movement: CashMovement) => {
    const type = movement.type === "ingreso" || movement.type === "income" ? "ingreso" : "egreso";
    
    if (type === "ingreso") {
      return "Refuerzo";
    }
    
    if (movement.typeDocument === "factura") {
      return "Factura";
    } else if (movement.typeDocument === "comprobante") {
      return "Comprobante";
    }
    
    return "Egreso";
  };

  const getMovementBadgeVariant = (movement: CashMovement) => {
    const type = movement.type === "ingreso" || movement.type === "income" ? "ingreso" : "egreso";
    
    if (type === "ingreso") {
      return "success"; // Verde para refuerzos
    }
    
    if (movement.typeDocument === "factura") {
      return "info"; // Azul para facturas
    } else if (movement.typeDocument === "comprobante") {
      return "warning"; // Amarillo para comprobantes
    }
    
    return "error"; // Rojo para egresos sin documento
  };

  const getMovementColor = (movement: CashMovement) => {
    const type = movement.type === "ingreso" || movement.type === "income" ? "ingreso" : "egreso";
    
    if (type === "ingreso") {
      return { color: "rgba(52, 199, 89, 1)", backgroundColor: "rgba(52, 199, 89, 0.1)" }; // Apple green
    }
    
    return { color: "rgba(255, 59, 48, 1)", backgroundColor: "rgba(255, 59, 48, 0.1)" }; // Apple red
  };

  return (
    <MainLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
        <div>
          <BotonVolver />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-md)" }}>
            <div>
              <h1 style={{ font: "var(--font-title)", color: "var(--apple-text-primary)", marginBottom: "var(--space-xs)" }}>
                {cashbox.name || `Caja ${cashbox.id.slice(0, 8)}`}
              </h1>
              <p style={{ font: "var(--font-body)", color: "var(--apple-text-secondary)" }}>
                Gestión de movimientos de caja
              </p>
            </div>
            <div style={{ display: "flex", gap: "var(--space-sm)" }}>
              {!isClosed && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setEditingMovement(null);
                      setShowMovementForm(true);
                    }}
                  >
                    Nuevo movimiento
                  </Button>
                  <Button variant="outline" onClick={handleCloseCashbox}>
                    Cerrar caja
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Resumen de caja */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-md)" }}>
          <Card>
            <CardContent style={{ padding: "var(--space-lg)" }}>
              <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                Estado
              </div>
              <Badge variant={isClosed ? "default" : "success"}>
                {isClosed ? "Cerrada" : "Abierta"}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent style={{ padding: "var(--space-lg)" }}>
              <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                Saldo actual
              </div>
              <div style={{ font: "var(--font-section-title)", color: "var(--apple-text-primary)" }}>
                {formatCurrency(balance)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent style={{ padding: "var(--space-lg)" }}>
              <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                Total movimientos
              </div>
              <div style={{ font: "var(--font-section-title)", color: "var(--apple-text-primary)" }}>
                {cashboxMovements.length}
              </div>
            </CardContent>
          </Card>
          {isClosed && (
            <>
              <Card>
                <CardContent style={{ padding: "var(--space-lg)" }}>
                  <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                    Total Ingresos
                  </div>
                  <div style={{ font: "var(--font-section-title)", color: "rgba(52, 199, 89, 1)" }}>
                    {formatCurrency(totals.totalIngresos)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent style={{ padding: "var(--space-lg)" }}>
                  <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                    Total Egresos
                  </div>
                  <div style={{ font: "var(--font-section-title)", color: "rgba(255, 59, 48, 1)" }}>
                    {formatCurrency(totals.totalEgresos)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent style={{ padding: "var(--space-lg)" }}>
                  <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                    Facturas
                  </div>
                  <div style={{ font: "var(--font-section-title)", color: "var(--apple-text-primary)" }}>
                    {totals.cantidadFacturas}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent style={{ padding: "var(--space-lg)" }}>
                  <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                    Comprobantes
                  </div>
                  <div style={{ font: "var(--font-section-title)", color: "var(--apple-text-primary)" }}>
                    {totals.cantidadComprobantes}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Modal de cierre de caja */}
        {showCloseModal && (
          <Modal
            isOpen={showCloseModal}
            onClose={() => setShowCloseModal(false)}
            title="Cerrar Caja"
            subtitle="Resumen final de movimientos"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
                <div>
                  <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                    Total Ingresos
                  </div>
                  <div style={{ font: "var(--font-card-title)", color: "rgba(52, 199, 89, 1)" }}>
                    {formatCurrency(totals.totalIngresos)}
                  </div>
                </div>
                <div>
                  <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                    Total Egresos
                  </div>
                  <div style={{ font: "var(--font-card-title)", color: "rgba(255, 59, 48, 1)" }}>
                    {formatCurrency(totals.totalEgresos)}
                  </div>
                </div>
                <div>
                  <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                    Total Facturas ({totals.cantidadFacturas})
                  </div>
                  <div style={{ font: "var(--font-card-title)", color: "var(--apple-text-primary)" }}>
                    {formatCurrency(totals.totalFacturas)}
                  </div>
                </div>
                <div>
                  <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                    Total Comprobantes ({totals.cantidadComprobantes})
                  </div>
                  <div style={{ font: "var(--font-card-title)", color: "var(--apple-text-primary)" }}>
                    {formatCurrency(totals.totalComprobantes)}
                  </div>
                </div>
              </div>
              
              <div style={{ paddingTop: "var(--space-md)", borderTop: "1px solid var(--apple-border)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
                  <div>
                    <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                      Saldo Inicial
                    </div>
                    <div style={{ font: "var(--font-body)", color: "var(--apple-text-primary)" }}>
                      {formatCurrency(totals.saldoInicial)}
                    </div>
                  </div>
                  <div>
                    <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                      Saldo Final
                    </div>
                    <div style={{ font: "var(--font-section-title)", color: "var(--apple-text-primary)" }}>
                      {formatCurrency(totals.saldoFinal)}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "var(--space-md)", paddingTop: "var(--space-md)", borderTop: "1px solid var(--apple-border)" }}>
                  <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                    Diferencia (Saldo Inicial + Ingresos - Egresos)
                  </div>
                  <div style={{ font: "var(--font-card-title)", color: totals.diferencia >= 0 ? "rgba(52, 199, 89, 1)" : "rgba(255, 59, 48, 1)" }}>
                    {formatCurrency(totals.diferencia)}
                  </div>
                </div>
              </div>

              {totals.facturas.length > 0 && (
                <div style={{ marginTop: "var(--space-md)" }}>
                  <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-sm)" }}>
                    Facturas enviadas a contabilidad ({totals.facturas.length}):
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)", maxHeight: "200px", overflowY: "auto" }}>
                    {totals.facturas.map((factura) => (
                      <div key={factura.id} style={{ padding: "var(--space-xs)", backgroundColor: "var(--apple-hover)", borderRadius: "var(--radius-sm)", fontSize: "13px" }}>
                        Factura {factura.invoiceNumber || "-"} - {formatCurrency(factura.amount || 0)} - {getSupplierName(factura.supplierId)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "var(--space-sm)", paddingTop: "var(--space-md)" }}>
                <Button
                  variant="primary"
                  onClick={confirmCloseCashbox}
                  style={{ flex: 1 }}
                >
                  Confirmar cierre
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCloseModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {showMovementForm && (
          <MovementForm
            cashboxId={cashboxId}
            initialData={editingMovement}
            onSuccess={() => {
              setShowMovementForm(false);
              setEditingMovement(null);
              fetchMovements(cashboxId);
            }}
            onCancel={() => {
              setShowMovementForm(false);
              setEditingMovement(null);
            }}
          />
        )}

        {error && (
          <div style={{ backgroundColor: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", color: "rgba(255,59,48,1)", padding: "var(--space-md)", borderRadius: "var(--radius-md)" }}>
            {error}
          </div>
        )}

        {!showMovementForm && (
          <Card>
            <CardHeader>
              <CardTitle>Movimientos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && cashboxMovements.length === 0 ? (
                <LoadingState message="Cargando movimientos..." />
              ) : cashboxMovements.length === 0 ? (
                <EmptyState
                  title="No hay movimientos registrados"
                  description={isClosed ? "Esta caja está cerrada y no tiene movimientos" : "Agrega el primer movimiento para comenzar"}
                />
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--apple-border-strong)", backgroundColor: "var(--apple-surface)" }}>
                        <th style={{ padding: "14px 16px", textAlign: "left", font: "var(--font-label)", color: "var(--apple-text-secondary)" }}>
                          Fecha
                        </th>
                        <th style={{ padding: "14px 16px", textAlign: "left", font: "var(--font-label)", color: "var(--apple-text-secondary)" }}>
                          Tipo
                        </th>
                        <th style={{ padding: "14px 16px", textAlign: "right", font: "var(--font-label)", color: "var(--apple-text-secondary)" }}>
                          Monto
                        </th>
                        <th style={{ padding: "14px 16px", textAlign: "left", font: "var(--font-label)", color: "var(--apple-text-secondary)" }}>
                          Documento
                        </th>
                        <th style={{ padding: "14px 16px", textAlign: "left", font: "var(--font-label)", color: "var(--apple-text-secondary)" }}>
                          Proveedor
                        </th>
                        <th style={{ padding: "14px 16px", textAlign: "left", font: "var(--font-label)", color: "var(--apple-text-secondary)" }}>
                          Obra
                        </th>
                        <th style={{ padding: "14px 16px", textAlign: "left", font: "var(--font-label)", color: "var(--apple-text-secondary)" }}>
                          Notas
                        </th>
                        {!isClosed && (
                          <th style={{ padding: "14px 16px", textAlign: "left", font: "var(--font-label)", color: "var(--apple-text-secondary)" }}>
                            Acciones
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {cashboxMovements.map((movement) => {
                        const movementColor = getMovementColor(movement);
                        const isIncome = movement.type === "ingreso" || movement.type === "income";
                        
                        return (
                          <tr
                            key={movement.id}
                            style={{
                              borderBottom: "1px solid var(--apple-border)",
                              transition: "background-color var(--apple-duration-fast) var(--apple-ease)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "var(--apple-hover)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                          >
                            <td style={{ padding: "12px 16px", font: "var(--font-body)", color: "var(--apple-text-primary)" }}>
                              {formatDate(movement.date)}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <Badge variant={getMovementBadgeVariant(movement)}>
                                {getMovementTypeLabel(movement)}
                              </Badge>
                            </td>
                            <td style={{ padding: "12px 16px", textAlign: "right", font: "var(--font-body)", fontWeight: 600, color: movementColor.color }}>
                              {isIncome ? "+" : "-"} {formatCurrency(Math.abs(movement.amount || 0))}
                            </td>
                            <td style={{ padding: "12px 16px", font: "var(--font-body)", color: "var(--apple-text-primary)" }}>
                              {movement.invoiceNumber ? `#${movement.invoiceNumber}` : "-"}
                            </td>
                            <td style={{ padding: "12px 16px", font: "var(--font-body)", color: "var(--apple-text-primary)" }}>
                              {getSupplierName(movement.supplierId)}
                            </td>
                            <td style={{ padding: "12px 16px", font: "var(--font-body)", color: "var(--apple-text-primary)" }}>
                              {getWorkName(movement.workId)}
                            </td>
                            <td style={{ padding: "12px 16px", font: "var(--font-body)", color: "var(--apple-text-secondary)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {movement.notes || movement.description || "-"}
                            </td>
                            {!isClosed && (
                              <td style={{ padding: "12px 16px" }}>
                                <div style={{ display: "flex", gap: "var(--space-xs)" }}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditMovement(movement)}
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteMovement(movement.id)}
                                    style={{ color: "rgba(255, 59, 48, 1)" }}
                                  >
                                    Eliminar
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

export default function CashboxDetailPage() {
  return (
    <ProtectedRoute>
      <CashboxDetailContent />
    </ProtectedRoute>
  );
}
