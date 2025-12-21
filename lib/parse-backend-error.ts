/**
 * Helper para parsear errores del backend NestJS
 * Extrae mensajes de validación y errores de forma consistente
 */

export interface BackendError {
  message: string;
  statusCode?: number;
  error?: string;
}

/**
 * Parsea un error de axios/backend y extrae un mensaje claro para el usuario
 * @param error - Error de axios o cualquier error
 * @returns Mensaje de error parseado
 */
export function parseBackendError(error: any): string {
  // Si ya es un string, retornarlo directamente
  if (typeof error === "string") {
    return error;
  }

  // Si tiene message directo, usarlo
  if (error?.message && typeof error.message === "string") {
    return error.message;
  }

  // Intentar extraer de response.data (axios error)
  const responseData = error?.response?.data || error?.data;
  
  if (responseData) {
    // NestJS validation error: { statusCode: 400, message: string | string[] }
    if (Array.isArray(responseData.message)) {
      // Si es array, unir los mensajes
      return responseData.message.join(", ");
    }
    
    if (typeof responseData.message === "string") {
      return responseData.message;
    }

    // Si tiene error field
    if (typeof responseData.error === "string") {
      return responseData.error;
    }
  }

  // Fallback genérico
  return "Error desconocido. Por favor, intente nuevamente.";
}

