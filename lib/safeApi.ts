/**
 * Helper para construir URLs de API de forma segura
 * Previene URLs con "undefined" o "null" en los paths
 */

/**
 * Valida que una URL no contenga "undefined" o "null" como string
 * @param url - URL a validar
 * @returns true si la URL es válida, false si contiene undefined/null
 */
export function isValidApiUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (typeof url !== "string") return false;
  
  // Detectar "undefined" o "null" como strings en la URL
  if (url.includes("undefined") || url.includes("null")) {
    console.warn("⚠️ [safeApi] URL contiene undefined/null:", url);
    return false;
  }
  
  // Detectar dobles barras (excepto después de http:// o https://)
  if (url.includes("//") && !url.match(/^https?:\/\//)) {
    console.warn("⚠️ [safeApi] URL contiene dobles barras:", url);
    return false;
  }
  
  return true;
}

/**
 * Construye una URL de API de forma segura
 * @param parts - Partes de la URL a unir
 * @returns URL válida o null si alguna parte es inválida
 */
export function buildSafeApiUrl(...parts: (string | null | undefined)[]): string | null {
  // Filtrar partes nulas/undefined y convertir a string
  const validParts = parts
    .filter((part): part is string => {
      if (part === null || part === undefined) {
        console.warn("⚠️ [safeApi] Parte de URL es null/undefined, omitiendo");
        return false;
      }
      if (typeof part !== "string") {
        console.warn("⚠️ [safeApi] Parte de URL no es string:", typeof part);
        return false;
      }
      return true;
    })
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (validParts.length === 0) {
    console.warn("⚠️ [safeApi] No hay partes válidas para construir URL");
    return null;
  }

  // Unir partes, eliminando barras duplicadas
  let url = validParts.join("/");
  
  // Normalizar: eliminar dobles barras (excepto después de http:// o https://)
  url = url.replace(/([^:]\/)\/+/g, "$1");
  
  // Asegurar que no termine con barra (excepto si es solo la base)
  if (url.endsWith("/") && url.split("/").length > 4) {
    url = url.slice(0, -1);
  }

  // Validar la URL final
  if (!isValidApiUrl(url)) {
    return null;
  }

  return url;
}

/**
 * Obtiene la URL base de la API de forma segura
 * @returns URL base o null si no está definida
 */
export function getApiBaseUrl(): string | null {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    console.error("🔴 [safeApi] NEXT_PUBLIC_API_URL no está definido en variables de entorno");
    return null;
  }
  
  if (!isValidApiUrl(apiUrl)) {
    console.error("🔴 [safeApi] NEXT_PUBLIC_API_URL contiene valores inválidos:", apiUrl);
    return null;
  }
  
  return apiUrl;
}

/**
 * Construye una URL completa de API de forma segura
 * @param endpoint - Endpoint relativo (ej: "/works", "/suppliers/123")
 * @returns URL completa o null si es inválida
 */
export function safeApiUrl(endpoint: string | null | undefined): string | null {
  if (!endpoint) {
    console.warn("⚠️ [safeApi] Endpoint es null/undefined");
    return null;
  }
  
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return null;
  }
  
  // Normalizar endpoint: asegurar que empiece con /
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  return buildSafeApiUrl(baseUrl, normalizedEndpoint);
}

/**
 * Valida y construye una URL con parámetros dinámicos
 * @param baseEndpoint - Endpoint base (ej: "/works")
 * @param params - Parámetros dinámicos (ej: ["123", "suppliers"])
 * @returns URL válida o null si algún parámetro es inválido
 */
export function safeApiUrlWithParams(
  baseEndpoint: string,
  ...params: (string | number | null | undefined)[]
): string | null {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return null;
  }
  
  // Validar que todos los parámetros sean válidos
  const validParams = params
    .map((param) => {
      if (param === null || param === undefined) {
        console.warn("⚠️ [safeApi] Parámetro es null/undefined");
        return null;
      }
      return String(param).trim();
    })
    .filter((param): param is string => param !== null && param.length > 0);
  
  if (validParams.length !== params.length) {
    console.warn("⚠️ [safeApi] Algunos parámetros son inválidos");
    return null;
  }
  
  // Construir URL
  const normalizedEndpoint = baseEndpoint.startsWith("/") ? baseEndpoint : `/${baseEndpoint}`;
  return buildSafeApiUrl(baseUrl, normalizedEndpoint, ...validParams);
}

