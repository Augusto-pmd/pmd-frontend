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
 * - nombre: string (requerido)
 * - direccion?: string
 * - fechaInicio?: string (ISO date: YYYY-MM-DD)
 * - fechaFin?: string (ISO date: YYYY-MM-DD)
 * - estado?: string
 * - descripcion?: string
 * - metrosCuadrados?: number
 * - responsableId?: string (UUID)
 * - presupuesto?: number
 */
export function mapCreateWorkPayload(form: any): {
  nombre: string;
  direccion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: string;
  descripcion?: string;
  metrosCuadrados?: number;
  responsableId?: string;
  presupuesto?: number;
} {
  return {
    nombre: (form.nombre || form.name || "").trim(),
    direccion: (form.direccion || form.address)?.trim() || undefined,
    fechaInicio: formatDateYYYYMMDD(form.fechaInicio || form.startDate),
    fechaFin: form.fechaFin || form.endDate ? formatDateYYYYMMDD(form.fechaFin || form.endDate) : undefined,
    estado: (form.estado || form.status) || undefined,
    descripcion: (form.descripcion || form.description)?.trim() || undefined,
    metrosCuadrados: form.metrosCuadrados || form.squareMeters ? Number(form.metrosCuadrados || form.squareMeters) || undefined : undefined,
    responsableId: (form.responsableId || form.managerId)?.trim() || undefined,
    presupuesto: form.presupuesto || form.budget ? Number(form.presupuesto || form.budget) || undefined : undefined,
  };
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
