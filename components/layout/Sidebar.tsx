"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAlertsStore } from "@/store/alertsStore";
import { useDocumentsStore } from "@/store/documentsStore";
import { useCashboxStore } from "@/store/cashboxStore";
import { useCan, can } from "@/lib/acl";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSidebar } from "./SidebarContext";
import {
  LayoutDashboard,
  Building2,
  Plus,
  Truck,
  Users,
  Network,
  Calculator,
  TrendingUp,
  Wallet,
  FileText,
  Upload,
  Bell,
  Shield,
  Settings,
  ChevronDown,
  X,
  UserCog,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  badge?: {
    count: number;
    variant: "error" | "warning" | "info";
  };
}

interface NavGroup {
  title: string;
  items: NavItem[];
  permission?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const { alerts, fetchAlerts } = useAlertsStore();
  const { documents, fetchDocuments } = useDocumentsStore();
  const { cashboxes, fetchCashboxes } = useCashboxStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["Dashboard", "Obras", "Contabilidad"])
  );

  const user = useAuthStore.getState().getUserSafe();

  // Cargar datos para badges
  useEffect(() => {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    if (organizationId) {
      fetchAlerts();
      fetchDocuments();
      fetchCashboxes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cerrar sidebar en mobile cuando cambia la ruta
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  if (!user || typeof user.role === "object") return null;

  // Calcular badges
  const highAlertsCount = alerts.filter((a) => !a.read && a.severity === "alta").length;
  const mediumAlertsCount = alerts.filter((a) => !a.read && a.severity === "media").length;
  const pendingDocsCount = documents.filter((d) => d.status === "pendiente").length;
  const reviewDocsCount = documents.filter((d) => d.status === "en revisión").length;
  const openCashboxesCount = cashboxes.filter((c) => !c.isClosed).length;

  // Estructura completa del sidebar con permisos
  const allNavGroups: NavGroup[] = [
    {
      title: "Dashboard",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Obras",
      permission: "works.read",
      items: [
        { label: "Listado", href: "/works", icon: Building2 },
        { label: "Nueva Obra", href: "/works/new", icon: Plus, permission: "works.create" },
      ],
    },
    {
      title: "Proveedores",
      permission: "suppliers.read",
      items: [
        { label: "Listado", href: "/suppliers", icon: Truck },
      ],
    },
    {
      title: "RRHH",
      permission: "staff.read",
      items: [
        { label: "Empleados", href: "/rrhh", icon: Users },
        { label: "Organigrama", href: "/organigrama", icon: Network },
      ],
    },
    {
      title: "Contabilidad",
      permission: "accounting.read",
      items: [
        { label: "Movimientos", href: "/accounting", icon: Calculator },
        { label: "Resumen", href: "/accounting/resumen", icon: TrendingUp },
      ],
    },
    {
      title: "Cajas",
      permission: "cashbox.read",
      items: [
        {
          label: "Cajas Abiertas",
          href: "/cashbox",
          icon: Wallet,
          badge: openCashboxesCount > 0 ? { count: openCashboxesCount, variant: "info" } : undefined,
        },
        { label: "Abrir Caja", href: "/cashbox/open", icon: Plus, permission: "cashbox.create" },
        { label: "Movimientos", href: "/cashbox/movements", icon: FileText },
      ],
    },
    {
      title: "Clientes",
      permission: "clients.read",
      items: [
        { label: "CRM", href: "/clients", icon: Users },
      ],
    },
    {
      title: "Documentación",
      permission: "documents.read",
      items: [
        {
          label: "Documentos",
          href: "/documents",
          icon: FileText,
          badge:
            pendingDocsCount > 0
              ? { count: pendingDocsCount, variant: "warning" }
              : reviewDocsCount > 0
              ? { count: reviewDocsCount, variant: "info" }
              : undefined,
        },
        { label: "Subir Documento", href: "/documents/upload", icon: Upload, permission: "documents.create" },
      ],
    },
    {
      title: "Alertas",
      permission: "alerts.read",
      items: [
        {
          label: "Todas",
          href: "/alerts",
          icon: Bell,
          badge:
            highAlertsCount > 0
              ? { count: highAlertsCount, variant: "error" }
              : mediumAlertsCount > 0
              ? { count: mediumAlertsCount, variant: "warning" }
              : undefined,
        },
      ],
    },
    {
      title: "Auditoría",
      permission: "audit.read",
      items: [
        { label: "Cambios del sistema", href: "/audit", icon: Shield },
      ],
    },
    {
      title: "Configuración",
      permission: "settings.read",
      items: [
        { label: "Configuración", href: "/settings", icon: Settings },
        { label: "Roles", href: "/roles", icon: Shield },
        { label: "Usuarios", href: "/users", icon: UserCog },
      ],
    },
  ];

  // Filtrar grupos e items por permisos
  const accessibleGroups = allNavGroups
    .filter((group) => {
      if (group.permission) {
        return can(group.permission as any);
      }
      return true;
    })
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.permission) {
          return can(item.permission as any);
        }
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupTitle)) {
        newSet.delete(groupTitle);
      } else {
        newSet.add(groupTitle);
      }
      return newSet;
    });
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  const getBadgeClass = (variant: "error" | "warning" | "info") => {
    if (variant === "error") return "bg-red-500 text-white";
    if (variant === "warning") return "bg-yellow-500 text-white";
    return "bg-blue-500 text-white";
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#162F7F] rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">PMD</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">PMD</h1>
            <p className="text-xs text-gray-500">Management</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden text-gray-500 hover:text-gray-700 p-2 -mr-2"
          aria-label="Cerrar sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {accessibleGroups.map((group) => {
          const isGroupExpanded = expandedGroups.has(group.title);
          const hasActiveChild = group.items.some((item) => isActive(item.href));

          return (
            <div key={group.title} className="mb-1">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.title)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700 transition-all duration-150",
                  "lg:py-1.5"
                )}
              >
                <span>{group.title}</span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform duration-150",
                    isGroupExpanded ? "rotate-0" : "-rotate-90"
                  )}
                />
              </button>

              {/* Group Items */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-150 ease-out",
                  isGroupExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="space-y-0.5 pb-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isItemActive = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-sm text-gray-700 rounded transition-all duration-150",
                          "hover:bg-gray-100",
                          "lg:px-3 lg:py-2",
                          isItemActive &&
                            "bg-gray-50 border-l-2 border-[#162F7F] text-[#162F7F] font-medium"
                        )}
                      >
                        <Icon
                          className={cn(
                            "flex-shrink-0 h-5 w-5 lg:h-4 lg:w-4 transition-colors",
                            isItemActive ? "text-[#162F7F]" : "text-gray-500"
                          )}
                        />
                        <span className="truncate flex-1">{item.label}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              "flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center",
                              getBadgeClass(item.badge.variant)
                            )}
                          >
                            {item.badge.count > 99 ? "99+" : item.badge.count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Info */}
      {user && (
        <div className="px-4 py-3 border-t border-gray-200 lg:px-3 lg:py-2">
          <div className="text-xs">
            <p className="text-gray-900 font-medium truncate">{user.fullName || user.email}</p>
            <p className="text-gray-500 capitalize">{String(user.role ?? "")}</p>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-gray-200 min-h-screen flex flex-col z-50",
          "lg:static lg:translate-x-0 lg:shadow-none",
          "fixed left-0 top-0 w-64 shadow-xl",
          "transition-all duration-300 ease-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
