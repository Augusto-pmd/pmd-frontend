/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
}

// Validar variables de entorno en tiempo de build
if (process.env.NEXT_PUBLIC_API_URL) {
  console.log("✅ [BUILD] NEXT_PUBLIC_API_URL está definida:", process.env.NEXT_PUBLIC_API_URL);
} else {
  console.error("❌ [BUILD] NEXT_PUBLIC_API_URL NO está definida");
  console.error("❌ [BUILD] Por favor, configura NEXT_PUBLIC_API_URL en las variables de entorno de Vercel");
  console.error("❌ [BUILD] Ejemplo: NEXT_PUBLIC_API_URL=https://pmd-backend-l47d.onrender.com");
  // No lanzar error para permitir build con fallback, pero loguear claramente
}

module.exports = nextConfig

