/**
 * Helper para cargar variables de entorno en rutas API de Next.js
 * Next.js carga automáticamente las variables NEXT_PUBLIC_* pero a veces
 * no están disponibles en tiempo de ejecución en las rutas API
 */

let envLoaded = false;

/**
 * Carga las variables de entorno desde .env.local si no están disponibles
 * Solo se ejecuta una vez para evitar múltiples cargas
 */
function loadEnvIfNeeded(): void {
  if (envLoaded || typeof window !== 'undefined') return;
  
  try {
    // Intentar obtener desde process.env primero (Next.js lo carga automáticamente)
    if (process.env.NEXT_PUBLIC_API_URL) {
      envLoaded = true;
      return;
    }
    
    // Si no está disponible, cargar desde .env.local manualmente
    const dotenv = require('dotenv');
    const path = require('path');
    const fs = require('fs');
    
    const envLocalPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const result = dotenv.config({ path: envLocalPath });
      if (result && !result.error) {
        envLoaded = true;
        console.log('[ENV] Variables cargadas desde .env.local');
      }
    }
  } catch (error) {
    // Ignorar errores silenciosamente
  }
}

/**
 * Obtiene la URL del backend desde las variables de entorno
 * Con fallback a localhost para desarrollo
 * Funciona tanto en servidor (rutas API) como en cliente (componentes)
 */
export function getBackendUrl(): string {
  // En el servidor, cargar variables de entorno si es necesario
  if (typeof window === 'undefined') {
    loadEnvIfNeeded();
  }
  
  // Obtener la URL desde process.env
  // En el cliente, Next.js inyecta automáticamente NEXT_PUBLIC_* variables
  const url = process.env.NEXT_PUBLIC_API_URL;
  
  // Fallback a localhost si no está definida
  return url || 'http://localhost:3001';
}

