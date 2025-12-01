"use client";

import { ModuleCard } from "./ModuleCard";

const modules = [
  {
    title: "Obras",
    description: "Gestiona obras, proyectos y actividades de construcción",
    icon: "🔨",
    route: "/works",
  },
  {
    title: "Proveedores",
    description: "Administra proveedores y sus contratos",
    icon: "🏢",
    route: "/suppliers",
  },
  {
    title: "Contabilidad",
    description: "Contabilidad, reportes financieros y análisis",
    icon: "📊",
    route: "/accounting",
  },
  {
    title: "Roles",
    description: "Administra roles y permisos del sistema",
    icon: "🔐",
    route: "/admin/roles",
  },
  {
    title: "Usuarios",
    description: "Gestiona usuarios del sistema y sus permisos",
    icon: "👥",
    route: "/admin/users",
  },
  {
    title: "Alertas",
    description: "Notificaciones y alertas del sistema",
    icon: "🔔",
    route: "/alerts",
  },
  {
    title: "Caja",
    description: "Gestiona cajas de efectivo y saldos",
    icon: "💰",
    route: "/cashbox",
  },
  {
    title: "Movimientos de Caja",
    description: "Movimientos de efectivo y transacciones",
    icon: "💵",
    route: "/cash",
  },
  {
    title: "Auditoría",
    description: "Registro de auditoría y actividad del sistema",
    icon: "📋",
    route: "/audit",
  },
];

export function DashboardModules() {
  return (
    <div className="space-y-6 py-6">
      <div className="px-1">
        <h2 className="text-2xl font-bold text-pmd-darkBlue mb-2">Módulos Principales</h2>
        <p className="text-gray-600">Accede a las funcionalidades principales del sistema</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <ModuleCard
            key={module.route}
            title={module.title}
            description={module.description}
            icon={module.icon}
            route={module.route}
          />
        ))}
      </div>
    </div>
  );
}

