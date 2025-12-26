"use client";

import { useState, useEffect, useCallback } from "react";
import { cashboxApi } from "@/hooks/api/cashboxes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { FormField } from "@/components/ui/FormField";

interface CashboxHistoryProps {
  cashboxId: string;
}

interface HistoryItem {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description?: string;
  date: string;
  created_at: string;
  expense?: any;
  income?: any;
}

interface HistoryResponse {
  data: HistoryItem[];
  total: number;
  page: number;
  limit: number;
  summary: {
    totalRefills: number;
    totalExpenses: number;
    totalIncomes: number;
    totalRefillsAmount: number;
    totalExpensesAmount: number;
    totalIncomesAmount: number;
  };
}

export function CashboxHistory({ cashboxId }: CashboxHistoryProps) {
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState({
    type: "",
    currency: "",
    startDate: "",
    endDate: "",
  });
  const toast = useToast();

  const fetchHistory = useCallback(async () => {
    if (!cashboxId) return;
    setIsLoading(true);
    try {
      const response = await cashboxApi.getHistory(cashboxId, {
        page,
        limit,
        ...(filters.type && { type: filters.type }),
        ...(filters.currency && { currency: filters.currency }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      }) as any;
      setHistory((response?.data || response) as HistoryResponse);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error al cargar historial";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [cashboxId, page, limit, filters.type, filters.currency, filters.startDate, filters.endDate, toast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number, currency: string = "ARS") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      refill: "Refuerzo",
      expense: "Egreso",
      income: "Ingreso",
    };
    return typeMap[type.toLowerCase()] || type;
  };

  const getTypeBadgeVariant = (type: string) => {
    if (type.toLowerCase() === "refill" || type.toLowerCase() === "income") {
      return "success";
    }
    return "error";
  };

  const totalPages = history ? Math.ceil(history.total / limit) : 0;

  const handleResetFilters = () => {
    setFilters({
      type: "",
      currency: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial Detallado</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-md)", marginBottom: "var(--space-lg)" }}>
          <FormField label="Tipo">
            <Select
              value={filters.type}
              onChange={(e) => {
                setFilters({ ...filters, type: e.target.value });
                setPage(1);
              }}
            >
              <option value="">Todos</option>
              <option value="refill">Refuerzo</option>
              <option value="expense">Egreso</option>
              <option value="income">Ingreso</option>
            </Select>
          </FormField>

          <FormField label="Moneda">
            <Select
              value={filters.currency}
              onChange={(e) => {
                setFilters({ ...filters, currency: e.target.value });
                setPage(1);
              }}
            >
              <option value="">Todas</option>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </Select>
          </FormField>

          <FormField label="Fecha desde">
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                setFilters({ ...filters, startDate: e.target.value });
                setPage(1);
              }}
            />
          </FormField>

          <FormField label="Fecha hasta">
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                setFilters({ ...filters, endDate: e.target.value });
                setPage(1);
              }}
            />
          </FormField>
        </div>

        <div style={{ display: "flex", gap: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
          <Button variant="outline" onClick={handleResetFilters}>
            Limpiar Filtros
          </Button>
        </div>

        {/* Resumen */}
        {history?.summary && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "var(--space-md)", marginBottom: "var(--space-lg)", padding: "var(--space-md)", backgroundColor: "var(--apple-surface)", borderRadius: "var(--radius-md)" }}>
            <div>
              <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                Refuerzos
              </div>
              <div style={{ font: "var(--font-card-title)", color: "var(--apple-text-primary)" }}>
                {history.summary.totalRefills}
              </div>
              <div style={{ font: "var(--font-body)", color: "rgba(52, 199, 89, 1)" }}>
                {formatCurrency(history.summary.totalRefillsAmount)}
              </div>
            </div>
            <div>
              <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                Egresos
              </div>
              <div style={{ font: "var(--font-card-title)", color: "var(--apple-text-primary)" }}>
                {history.summary.totalExpenses}
              </div>
              <div style={{ font: "var(--font-body)", color: "rgba(255, 59, 48, 1)" }}>
                {formatCurrency(history.summary.totalExpensesAmount)}
              </div>
            </div>
            <div>
              <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                Ingresos
              </div>
              <div style={{ font: "var(--font-card-title)", color: "var(--apple-text-primary)" }}>
                {history.summary.totalIncomes}
              </div>
              <div style={{ font: "var(--font-body)", color: "rgba(52, 199, 89, 1)" }}>
                {formatCurrency(history.summary.totalIncomesAmount)}
              </div>
            </div>
          </div>
        )}

        {/* Lista de movimientos */}
        {isLoading ? (
          <LoadingState message="Cargando historial..." />
        ) : !history?.data || history.data.length === 0 ? (
          <EmptyState
            title="No hay movimientos en el historial"
            description="No se encontraron movimientos con los filtros aplicados"
          />
        ) : (
          <>
            <div style={{ overflowX: "auto", marginBottom: "var(--space-md)" }}>
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
                      Descripción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.data.map((item) => {
                    const isIncome = item.type.toLowerCase() === "refill" || item.type.toLowerCase() === "income";
                    return (
                      <tr
                        key={item.id}
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
                          {formatDate(item.date)}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Badge variant={getTypeBadgeVariant(item.type)}>
                            {getTypeLabel(item.type)}
                          </Badge>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", font: "var(--font-body)", fontWeight: 600, color: isIncome ? "rgba(52, 199, 89, 1)" : "rgba(255, 59, 48, 1)" }}>
                          {isIncome ? "+" : "-"} {formatCurrency(item.amount, item.currency)}
                        </td>
                        <td style={{ padding: "12px 16px", font: "var(--font-body)", color: "var(--apple-text-secondary)", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.description || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "var(--space-md)", borderTop: "1px solid var(--apple-border)" }}>
                <div style={{ font: "var(--font-body)", color: "var(--apple-text-secondary)" }}>
                  Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, history.total)} de {history.total} movimientos
                </div>
                <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <div style={{ display: "flex", alignItems: "center", padding: "0 var(--space-md)", font: "var(--font-body)", color: "var(--apple-text-primary)" }}>
                    Página {page} de {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

