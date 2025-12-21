/**
 * Payload Mappers
 * 
 * Funciones de mapeo ESPECÍFICAS por entidad para alinear EXACTAMENTE
 * los payloads del frontend con los DTOs de creación del backend.
 * 
 * El backend usa ValidationPipe con:
 * - whitelist: true
 * - forbidNonWhitelisted: true
 * 
 * Por lo tanto, cualquier campo extra o campo faltante causará 400.
 * 
 * PROHIBIDO:
 * - Reusar payloads entre módulos
 * - Traducir keys dinámicamente
 * - Mandar campos visuales o auxiliares
 */

/**
 * Formatea una fecha a formato YYYY-MM-DD
 */
function formatDateYYYYMMDD(date: string | Date | undefined | null): string | undefined {
  if (!date) return undefined;
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return undefined;
    
    // Si ya está en formato YYYY-MM-DD, retornar directamente
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    // Formatear a YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    
    return `${year}-${month}-${day}`;
  } catch {
    return undefined;
  }
}

/**
 * Convierte una fecha a formato ISO8601 completo (con hora y timezone)
 */
function toISODateTime(date: string | Date | undefined | null): string {
  if (!date) {
    throw new Error("La fecha es requerida");
  }
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      throw new Error("La fecha no es válida");
    }
    
    return dateObj.toISOString();
  } catch (error) {
    throw new Error("La fecha no es válida");
  }
}

/**
 * --- SUPPLIER ---
 * 
 * Mapea los datos del formulario de Supplier al payload exacto del DTO del backend.
 * 
 * DTO esperado (CreateSupplierDto):
 * - name: string (requerido)
 * - cuit?: string
 * - email?: string
 * - phone?: string
 * - category?: string
 * - status?: "provisional" | "approved" | "blocked" | "rejected"
 * - address?: string
 */
export function mapCreateSupplierPayload(form: any): {
  name: string;
  cuit?: string;
  email?: string;
  phone?: string;
  category?: string;
  status?: "provisional" | "approved" | "blocked" | "rejected";
  address?: string;
} {
  return {
    name: (form.nombre || form.name || "").trim(),
    cuit: form.cuit?.trim() || undefined,
    email: form.email?.trim() || undefined,
    phone: (form.telefono || form.phone)?.trim() || undefined,
    category: form.category?.trim() || undefined,
    status: (form.existstatus || form.status) || undefined,
    address: (form.direccion || form.address)?.trim() || undefined,
  };
}

/**
 * --- WORK ---
 * 
 * Mapea los datos del formulario de Work al payload exacto del DTO del backend.
 * 
 * DTO esperado (CreateWorkDto):
 * - name: string (requerido)
 * - client: string (requerido)
 * - address: string (requerido)
 * - start_date: string (requerido, ISO date: YYYY-MM-DD)
 * - end_date?: string (opcional, ISO date: YYYY-MM-DD)
 * - status?: WorkStatus (opcional, enum: "active" | "paused" | "finished" | "administratively_closed" | "archived")
 * - currency: Currency (requerido, enum: "ARS" | "USD")
 * - supervisor_id?: string (opcional, UUID)
 * - total_budget?: number (opcional)
 */
export function mapCreateWorkPayload(form: any): {
  name: string;
  client: string;
  address: string;
  start_date: string;
  end_date?: string;
  status?: string;
  currency: string;
  supervisor_id?: string;
  total_budget?: number;
} {
  // ✅ Formulario ahora usa modelo único alineado al backend (start_date directamente)
  const startDate = formatDateYYYYMMDD(form.start_date);
  if (!startDate) {
    throw new Error("La fecha de inicio es requerida y debe ser válida");
  }

  const payload: any = {
    name: (form.name || "").trim(),
    client: (form.client || "").trim(),
    address: (form.address || "").trim(),
    start_date: startDate,
    currency: form.currency || "USD",
  };

  // Campos opcionales - solo incluir si tienen valor
  const endDate = formatDateYYYYMMDD(form.end_date);
  if (endDate) {
    payload.end_date = endDate;
  }

  const status = form.status;
  if (status && ["active", "paused", "finished", "administratively_closed", "archived"].includes(status)) {
    payload.status = status;
  }

  const supervisorId = form.supervisor_id?.trim();
  if (supervisorId) {
    payload.supervisor_id = supervisorId;
  }

  if (form.total_budget !== undefined && form.total_budget !== null && form.total_budget !== "") {
    const budgetNum = Number(form.total_budget);
    if (!isNaN(budgetNum) && budgetNum >= 0) {
      payload.total_budget = budgetNum;
    }
  }

  return payload;
}

/**
 * --- CASHBOX ---
 * 
 * Mapea los datos del formulario de Cashbox al payload exacto del DTO del backend.
 * 
 * DTO esperado (CreateCashboxDto):
 * - opening_date: string (ISO8601 date string, requerido)
 * - user_id: string (UUID, requerido)
 */
export function mapCreateCashboxPayload(form: any, userId: string): {
  opening_date: string;
  user_id: string;
} {
  if (!userId) {
    throw new Error("El ID de usuario es requerido");
  }
  
  return {
    opening_date: toISODateTime(form.opening_date),
    user_id: userId,
  };
}
