"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, UserRole } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSidebar } from "./SidebarContext";
import {
  LayoutDashboard,
  Building2,
  List,
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
  AlertTriangle,
  Clock,
  Shield,
  Settings,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  children?: NavItem[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Dashboard",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Obras",
    items: [
      { label: "Listado", href: "/works", icon: List },
    ],
  },
  {
    title: "Proveedores",
    items: [
      { label: "Listado", href: "/suppliers", icon: List },
    ],
  },
  {
    title: "RRHH",
    items: [
      { label: "Empleados", href: "/rrhh", icon: Users },
      { label: "Organigrama", href: "/organigrama", icon: Network },
    ],
  },
  {
    title: "Contabilidad",
    items: [
      { label: "Movimientos", href: "/accounting", icon: Calculator },
    ],
  },
  {
    title: "Cajas",
    items: [
      { label: "Cajas abiertas", href: "/cashbox", icon: Wallet },
      { label: "Movimientos", href: "/cash-movements", icon: FileText },
    ],
  },
  {
    title: "Documentación",
    items: [
      { label: "Documentos", href: "/documents", icon: FileText },
    ],
  },
  {
    title: "Alertas",
    items: [
      { label: "Todas", href: "/alerts", icon: Bell },
    ],
  },
  {
    title: "Auditoría",
    items: [
      { label: "Cambios del sistema", href: "/audit", icon: Shield },
    ],
  },
  {
    title: "Configuración",
    items: [
      { label: "Configuración", href: "/settings", icon: Settings },
      {
        label: "Usuarios",
        href: "/admin/users",
        icon: Users,
        roles: ["admin"],
      },
      {
        label: "Roles",
        href: "/admin/roles",
        icon: Shield,
        roles: ["admin"],
      },
    ],
  },
];

// Role-based access rules
const getAccessibleGroups = (userRole: UserRole | undefined): NavGroup[] => {
  if (!userRole) return [];

  const accessibleGroups: NavGroup[] = [];

  navGroups.forEach((group) => {
    const accessibleItems: NavItem[] = [];

    group.items.forEach((item) => {
      // Check if item has role restrictions
      if (item.roles && !item.roles.includes(userRole)) {
        return; // Skip this item
      }

      // OPERATOR: ocultar Audit, Users (Admin section)
      if (userRole === "operator") {
        if (
          item.href === "/audit" ||
          item.href.startsWith("/admin/") ||
          group.title === "Auditoría"
        ) {
          return; // Skip Audit and Admin sections
        }
        accessibleItems.push(item);
        return;
      }

      // AUDITOR: puede ver todo pero sin acciones de creación/edición
      if (userRole === "auditor") {
        accessibleItems.push(item);
        return;
      }

      // ADMIN: acceso total
      if (userRole === "admin") {
        accessibleItems.push(item);
        return;
      }
    });

    // Solo agregar el grupo si tiene items accesibles
    if (accessibleItems.length > 0) {
      accessibleGroups.push({
        ...group,
        items: accessibleItems,
      });
    }
  });

  return accessibleGroups;
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore.getState().getUserSafe();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["Dashboard", "Obras", "Contabilidad"])
  );

  // Cerrar sidebar en mobile cuando cambia la ruta
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  // Asegurar que NINGÚN componente del Dashboard se monte si user no está normalizado
  if (!user || typeof user.role === "object") return null;

  // User role is already normalized by getUserSafe
  const userRole = user?.role as UserRole | undefined;
  const accessibleGroups = getAccessibleGroups(userRole);

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
    // Cerrar sidebar en mobile al hacer click
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
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
              {/* Group Header - Acordeón */}
              <button
                onClick={() => toggleGroup(group.title)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700 transition-colors",
                  "lg:py-2"
                )}
              >
                <span>{group.title}</span>
                <div
                  className={cn(
                    "transition-transform duration-200 ease-out",
                    isGroupExpanded ? "rotate-0" : "-rotate-90"
                  )}
                >
                  <ChevronDown className="h-3 w-3 lg:h-3 lg:w-3" />
                </div>
              </button>

              {/* Group Items - Animación suave */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-out",
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
                          "flex items-center gap-3 px-4 py-3 text-sm text-gray-700 rounded transition-colors",
                          "hover:bg-gray-100",
                          "lg:px-3 lg:py-2",
                          isItemActive &&
                            "bg-gray-50 border-l-2 border-[#162F7F] text-[#162F7F] font-medium"
                        )}
                      >
                        <Icon
                          className={cn(
                            "flex-shrink-0 h-6 w-6 lg:h-4 lg:w-4 transition-colors",
                            isItemActive ? "text-[#162F7F]" : "text-gray-500"
                          )}
                        />
                        <span className="truncate">{item.label}</span>
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
            <p className="text-gray-900 font-medium truncate">{user.fullName}</p>
            <p className="text-gray-500 capitalize">{String(user.role ?? "")}</p>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Overlay con backdrop blur */}
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
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
