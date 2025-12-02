/**
 * Motor de generación automática de alertas PMD
 * 
 * Genera alertas basadas en reglas de negocio:
 * - Seguros personales por vencer
 * - Documentación pendiente/rechazada
 * - Inicio de obra atrasado
 * - Gastos elevados en contabilidad
 */

import { SIMULATION_MODE } from "./useSimulation";
import { SIMULATED_STAFF, SIMULATED_WORKS, SIMULATED_DOCUMENTS, SIMULATED_ACCOUNTING_ENTRIES } from "./useSimulation";
import type { Alert } from "@/store/alertsStore";

interface StaffMember {
  id: string;
  insuranceExpiry?: string;
  [key: string]: any;
}

interface Work {
  id: string;
  startDate?: string;
  status?: string;
  [key: string]: any;
}

interface Document {
  id: string;
  status?: string;
  workId?: string;
  [key: string]: any;
}

interface AccountingEntry {
  id: string;
  type: string;
  amount: number;
  [key: string]: any;
}

/**
 * Genera alertas automáticas basadas en reglas de negocio
 * Solo funciona en modo simulación por ahora
 */
export function generateAutomaticAlerts(): Alert[] {
  if (!SIMULATION_MODE) {
    return [];
  }

  const alerts: Alert[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // A) Seguros personales por vencer (RRHH)
  const staff = SIMULATED_STAFF as StaffMember[];
  staff.forEach((member) => {
    if (member.insuranceExpiry) {
      const expiryDate = new Date(member.insuranceExpiry);
      expiryDate.setHours(0, 0, 0, 0);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
        alerts.push({
          id: `auto-insurance-${member.id}-${Date.now()}`,
          type: "seguro",
          personId: member.id,
          message: `Seguro de ${member.fullName || member.name || "empleado"} vence en ${daysUntilExpiry} días`,
          severity: daysUntilExpiry <= 10 ? "alta" : "media",
          date: today.toISOString().split("T")[0],
          read: false,
          title: "Vencimiento de seguro personal",
        });
      }
    }
  });

  // B) Documentación pendiente
  const documents = SIMULATED_DOCUMENTS as Document[];
  const pendingDocs = documents.filter((doc) => doc.status === "pendiente");
  if (pendingDocs.length > 0) {
    alerts.push({
      id: `auto-doc-pending-${Date.now()}`,
      type: "documentacion",
      workId: pendingDocs[0].workId,
      message: `${pendingDocs.length} documento${pendingDocs.length > 1 ? "s" : ""} pendiente${pendingDocs.length > 1 ? "s" : ""} de revisión`,
      severity: "media",
      date: today.toISOString().split("T")[0],
      read: false,
      title: "Documentación pendiente",
    });
  }

  // C) Documentación rechazada
  const rejectedDocs = documents.filter((doc) => doc.status === "rechazado");
  if (rejectedDocs.length > 0) {
    rejectedDocs.forEach((doc) => {
      alerts.push({
        id: `auto-doc-rejected-${doc.id}`,
        type: "documentacion",
        workId: doc.workId,
        message: `Documento "${doc.name}" rechazado y requiere corrección`,
        severity: "alta",
        date: today.toISOString().split("T")[0],
        read: false,
        title: "Documentación rechazada",
      });
    });
  }

  // D) Inicio de obra atrasado
  const works = SIMULATED_WORKS as Work[];
  works.forEach((work) => {
    if (work.status === "planned" && work.startDate) {
      const startDate = new Date(work.startDate);
      startDate.setHours(0, 0, 0, 0);
      const daysDelayed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDelayed > 0) {
        alerts.push({
          id: `auto-work-delayed-${work.id}`,
          type: "obra",
          workId: work.id,
          message: `Inicio de obra "${work.name || work.title || work.nombre || work.id}" retrasado ${daysDelayed} día${daysDelayed > 1 ? "s" : ""}`,
          severity: "alta",
          date: today.toISOString().split("T")[0],
          read: false,
          title: "Inicio de obra atrasado",
        });
      }
    }
  });

  // E) Gasto elevado en contabilidad
  const accountingEntries = SIMULATED_ACCOUNTING_ENTRIES as AccountingEntry[];
  const threshold = 300000; // $300,000
  const highExpenses = accountingEntries.filter(
    (entry) => entry.type === "egreso" && entry.amount > threshold
  );

  if (highExpenses.length > 0) {
    highExpenses.forEach((entry) => {
      alerts.push({
        id: `auto-expense-high-${entry.id}`,
        type: "contable",
        workId: entry.workId,
        message: `Gasto elevado registrado: $${entry.amount.toLocaleString("es-AR")}`,
        severity: "media",
        date: entry.date || today.toISOString().split("T")[0],
        read: false,
        title: "Gasto elevado",
      });
    });
  }

  return alerts;
}

