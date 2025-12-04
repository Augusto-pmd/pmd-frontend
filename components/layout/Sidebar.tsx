"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAlertsStore } from "@/store/alertsStore";
import { useDocumentsStore } from "@/store/documentsStore";
import { useCashboxStore } from "@/store/cashboxStore";
import { useCan } from "@/lib/acl";
import { useEffect, useMemo, memo } from "react";
import LogoPMD from "@/components/LogoPMD";
import {
  LayoutDashboard,
  Building2,
  Truck,
  Users,
  Calculator,
  Wallet,
  FileText,
  Bell,
  Shield,
  Settings,
  UserCog,
  BookOpen,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: string;
  section?: string;
}

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

// Mover lista de módulos fuera del componente para evitar re-renders
const ALL_NAV_ITEMS: NavItem[] = [
  // Gestión
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "always", section: "Gestión" },
  { label: "Obras", href: "/works", icon: Building2, permission: "works.read", section: "Gestión" },
  { label: "Clientes", href: "/clients", icon: Users, permission: "clients.read", section: "Gestión" },
  
  // Operaciones
  { label: "Proveedores", href: "/suppliers", icon: Truck, permission: "suppliers.read", section: "Operaciones" },
  { label: "RRHH", href: "/rrhh", icon: Users, permission: "staff.read", section: "Operaciones" },
  { label: "Cajas", href: "/cashbox", icon: Wallet, permission: "cashbox.read", section: "Operaciones" },
  { label: "Documentación", href: "/documents", icon: FileText, permission: "documents.read", section: "Operaciones" },
  
  // Administración
  { label: "Contabilidad", href: "/accounting", icon: Calculator, permission: "accounting.read", section: "Administración" },
  { label: "Alertas", href: "/alerts", icon: Bell, permission: "alerts.read", section: "Administración" },
  { label: "Auditoría", href: "/audit", icon: Shield, permission: "audit.read", section: "Administración" },
  
  // Sistema
  { label: "Usuarios", href: "/settings/users", icon: UserCog, permission: "users.read", section: "Sistema" },
  { label: "Roles", href: "/roles", icon: BookOpen, permission: "roles.read", section: "Sistema" },
  { label: "Configuración", href: "/settings", icon: Settings, permission: "settings.read", section: "Sistema" },
];

function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { alerts, fetchAlerts } = useAlertsStore();
  const { documents, fetchDocuments } = useDocumentsStore();
  const { cashboxes, fetchCashboxes } = useCashboxStore();
  const user = useAuthStore.getState().getUserSafe();

  // ACL hooks - deben ejecutarse siempre antes de cualquier return
  const canWorks = useCan("works.read");
  const canSuppliers = useCan("suppliers.read");
  const canStaff = useCan("staff.read");
  const canAccounting = useCan("accounting.read");
  const canCashbox = useCan("cashbox.read");
  const canClients = useCan("clients.read");
  const canDocuments = useCan("documents.read");
  const canAlerts = useCan("alerts.read");
  const canAudit = useCan("audit.read");
  const canUsers = useCan("users.read");
  const canRoles = useCan("roles.read");
  const canSettings = useCan("settings.read");

  useEffect(() => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    if (organizationId) {
      fetchAlerts();
      fetchDocuments();
      fetchCashboxes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Memoizar items visibles según permisos ACL - antes del early return
  const visibleItems = useMemo(() => {
    return ALL_NAV_ITEMS.filter((item) => {
      // Dashboard siempre visible si hay usuario
      if (item.permission === "always" || item.href === "/dashboard") return true;
      
      // Verificar permiso específico
      switch (item.permission) {
        case "works.read":
          return canWorks;
        case "suppliers.read":
          return canSuppliers;
        case "staff.read":
          return canStaff;
        case "accounting.read":
          return canAccounting;
        case "cashbox.read":
          return canCashbox;
        case "clients.read":
          return canClients;
        case "documents.read":
          return canDocuments;
        case "alerts.read":
          return canAlerts;
        case "audit.read":
          return canAudit;
        case "users.read":
          return canUsers;
        case "roles.read":
          return canRoles;
        case "settings.read":
          return canSettings;
        default:
          return true;
      }
    });
  }, [canWorks, canSuppliers, canStaff, canAccounting, canCashbox, canClients, canDocuments, canAlerts, canAudit, canUsers, canRoles, canSettings]);

  // Memoizar agrupación por sección - antes del early return
  const itemsBySection = useMemo(() => {
    return visibleItems.reduce((acc, item) => {
      const section = item.section || "Otros";
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(item);
      return acc;
    }, {} as Record<string, NavItem[]>);
  }, [visibleItems]);

  // Early return después de todos los hooks
  if (!user) return null;

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;
  const pendingDocsCount = documents.filter((d) => d.status === "pendiente").length;
  const openCashboxesCount = cashboxes.filter((c) => !c.isClosed).length;

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const getBadgeCount = (href: string) => {
    if (href === "/alerts" && unreadAlertsCount > 0) {
      return unreadAlertsCount;
    }
    if (href === "/documents" && pendingDocsCount > 0) {
      return pendingDocsCount;
    }
    if (href === "/cashbox" && openCashboxesCount > 0) {
      return openCashboxesCount;
    }
    return null;
  };

  const getBadgeVariant = (href: string): "error" | "warning" | "info" => {
    if (href === "/alerts") {
      const highAlerts = alerts.filter((a) => !a.read && a.severity === "alta").length;
      if (highAlerts > 0) return "error";
      const mediumAlerts = alerts.filter((a) => !a.read && a.severity === "media").length;
      if (mediumAlerts > 0) return "warning";
      return "info";
    }
    if (href === "/documents") return "warning";
    if (href === "/cashbox") return "info";
    return "info";
  };

  const handleItemClick = (href: string) => {
    if (onClose) {
      onClose();
    }
    router.push(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-all"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64
          bg-[#162F7F]/90 backdrop-blur-2xl
          border-r border-white/20
          text-white
          z-50
          touch-none select-none
          overflow-y-auto scrollbar-none
          transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:flex
        `}
      >
        {/* Logo Section */}
        <div className="flex justify-center items-center py-6 border-b border-white/10">
          <LogoPMD size={56} className="opacity-95 drop-shadow-md" />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-3 py-4">
          {Object.entries(itemsBySection).map(([section, items]) => (
            <div key={section} className="mb-2">
              {/* Section Title */}
              <p className="px-5 mt-4 mb-1 text-xs uppercase tracking-wide text-white/50 font-medium">
                {section}
              </p>

              {/* Section Items */}
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const badgeCount = getBadgeCount(item.href);
                const badgeVariant = badgeCount ? getBadgeVariant(item.href) : null;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleItemClick(item.href);
                    }}
                    className={`
                      flex items-center gap-3 px-5 py-3
                      rounded-xl
                      transition-all duration-200
                      cursor-pointer
                      text-sm font-semibold text-white
                      touch-none select-none
                      active:scale-95
                      ${
                        active
                          ? "bg-white/25 border-l-4 border-white shadow-[0_0_10px_rgba(255,255,255,0.15)]"
                          : "hover:bg-white/15"
                      }
                    `}
                  >
                    {/* Icon */}
                    <Icon className="w-5 h-5 text-white/90 flex-shrink-0" />

                    {/* Label */}
                    <span className="flex-1">{item.label}</span>

                    {/* Badge */}
                    {badgeCount !== null && badgeCount > 0 && (
                      <span
                        className={`
                          flex items-center justify-center
                          min-w-[20px] h-5 px-1.5
                          rounded-full text-xs font-semibold
                          ${
                            badgeVariant === "error"
                              ? "bg-red-500/90 text-white"
                              : badgeVariant === "warning"
                              ? "bg-yellow-500/90 text-white"
                              : "bg-blue-500/90 text-white"
                          }
                        `}
                      >
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Section */}
        {user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#162F7F]/50 backdrop-blur-sm">
            <p className="text-sm font-semibold text-white truncate">
              {user.fullName || user.email}
            </p>
            <p className="text-xs text-white/70 mt-0.5 truncate">
              {typeof user.role === "string"
                ? user.role
                : user.role?.name || user.roleId || "Sin rol"}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}

// Memoizar el componente para evitar re-renders innecesarios
export default memo(Sidebar);
