"use client";

import { useRouter } from "next/navigation";
import { PMDButton } from "@/components/ui/PMDButton";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      title: "Gestión de Obras",
      description: "Administra proyectos, presupuestos y seguimiento de obras en tiempo real.",
      icon: "🏗️",
    },
    {
      title: "Proveedores",
      description: "Gestiona relaciones con proveedores, contratos y documentación.",
      icon: "🏢",
    },
    {
      title: "Contabilidad y Finanzas",
      description: "Control financiero completo con reportes y análisis detallados.",
      icon: "💰",
    },
    {
      title: "Auditoría Interna",
      description: "Sistema de trazabilidad y registro de todas las operaciones del sistema.",
      icon: "📋",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Hero Section */}
      <section className="flex items-center justify-center min-h-[80vh] px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-pmd-darkBlue tracking-tight">
              PMD Arquitectura
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium text-pmd-mediumBlue">
              Sistema Interno de Gestión
            </h2>
          </div>

          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Plataforma diseñada para la administración integral de obras, proveedores, contabilidad
            y procesos internos.
          </p>

          <div className="pt-4">
            <PMDButton onClick={() => router.push("/login")}>
              Ingresar al Sistema
            </PMDButton>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-pmd-darkBlue text-center mb-12">
            ¿Qué puedo hacer aquí?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#F7F7F7] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-pmd-darkBlue mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional Quote Section */}
      <section className="py-20 px-4 bg-pmd-darkBlue">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl md:text-3xl lg:text-4xl font-light text-white italic leading-relaxed">
            PMD — Excelencia en gestión, diseño y construcción.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} PMD Arquitectura. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
