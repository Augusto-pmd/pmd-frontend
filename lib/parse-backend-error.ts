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
export function parseBackendError(error: unknown): string {
  // Si ya es un string, retornarlo directamente
  if (typeof error === "string") {
    return error;
  }

  // Si tiene message directo, usarlo
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  // Intentar extraer de response.data (axios error)
  const responseData = (error && typeof error === "object" && "response" in error && typeof error.response === "object" && error.response && "data" in error.response)
    ? error.response.data
    : (error && typeof error === "object" && "data" in error)
      ? error.data
      : undefined;
  
  if (responseData && typeof responseData === "object") {
    const data = responseData as Record<string, unknown>;
    // NestJS validation error: { statusCode: 400, message: string | string[] }
    if (Array.isArray(data.message)) {
      // Si es array, unir los mensajes
      return data.message.join(", ");
    }
    
    if (typeof data.message === "string") {
      return data.message;
    }

    // Si tiene error field
    if (typeof data.error === "string") {
      return data.error;
    }
  }

  // Fallback genérico
  return "Error desconocido. Por favor, intente nuevamente.";
}

