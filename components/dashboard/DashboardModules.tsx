"use client";

import { ModuleCard } from "./ModuleCard";

const modules = [
  {
    title: "Works",
    description: "Gestiona obras, proyectos y actividades de construcción",
    icon: "🔨",
    route: "/works",
  },
  {
    title: "Suppliers",
    description: "Administra proveedores y sus contratos",
    icon: "🏢",
    route: "/suppliers",
  },
  {
    title: "Accounting",
    description: "Contabilidad, reportes financieros y análisis",
    icon: "📊",
    route: "/accounting",
  },
  {
    title: "Users",
    description: "Gestiona usuarios del sistema y sus permisos",
    icon: "👥",
    route: "/admin/users",
  },
  {
    title: "Roles",
    description: "Administra roles y permisos del sistema",
    icon: "🔐",
    route: "/admin/roles",
  },
  {
    title: "Alerts",
    description: "Notificaciones y alertas del sistema",
    icon: "🔔",
    route: "/alerts",
  },
  {
    title: "Audit",
    description: "Registro de auditoría y actividad del sistema",
    icon: "📋",
    route: "/audit",
  },
  {
    title: "Cashboxes",
    description: "Gestiona cajas de efectivo y saldos",
    icon: "💰",
    route: "/cashbox",
  },
  {
    title: "Cash Movements",
    description: "Movimientos de efectivo y transacciones",
    icon: "💵",
    route: "/cash",
  },
];

export function DashboardModules() {
  return (
    <div className="space-y-6">
      <div>
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

