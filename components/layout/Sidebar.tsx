"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAlertsStore } from "@/store/alertsStore";
import { useDocumentsStore } from "@/store/documentsStore";
import { useCashboxStore } from "@/store/cashboxStore";
import { useCan, can } from "@/lib/acl";
import { useState, useEffect } from "react";
import { SidebarItem } from "@/components/ui/SidebarItem";
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
  const { alerts, fetchAlerts } = useAlertsStore();
  const { documents, fetchDocuments } = useDocumentsStore();
  const { cashboxes, fetchCashboxes } = useCashboxStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["Dashboard", "Obras", "Contabilidad"])
  );

  const user = useAuthStore.getState().getUserSafe();

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

  if (!user || typeof user.role === "object") return null;

  const highAlertsCount = alerts.filter((a) => !a.read && a.severity === "alta").length;
  const mediumAlertsCount = alerts.filter((a) => !a.read && a.severity === "media").length;
  const pendingDocsCount = documents.filter((d) => d.status === "pendiente").length;
  const reviewDocsCount = documents.filter((d) => d.status === "en revisión").length;
  const openCashboxesCount = cashboxes.filter((c) => !c.isClosed).length;

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


  // Apple Sidebar Styles - Always visible, fixed position
  const sidebarStyle: React.CSSProperties = {
    width: "240px",
    backgroundColor: "var(--apple-surface)",
    borderRight: "1px solid var(--apple-border)",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: "var(--space-lg) var(--space-md)",
    gap: "var(--space-sm)",
    fontFamily: "Inter, system-ui, sans-serif",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 10,
    overflowY: "auto",
  };

  const logoSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "var(--space-md)",
    paddingBottom: "var(--space-md)",
    borderBottom: "1px solid var(--apple-border)",
  };

  const logoBoxStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    backgroundColor: "var(--apple-text-primary)",
    borderRadius: "var(--radius-md)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--apple-surface)",
    fontSize: "12px",
    fontWeight: 600,
    flexShrink: 0,
  };

  const logoTextStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
  };

  const logoTitleStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 600,
    color: "var(--apple-text-primary)",
    margin: 0,
    lineHeight: 1.2,
  };

  const logoSubtitleStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "var(--apple-text-secondary)",
    margin: 0,
    lineHeight: 1.2,
  };

  const navStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-xs)",
  };

  const groupTitleStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--apple-text-secondary)",
    letterSpacing: "0.3px",
    marginTop: "var(--space-md)",
    marginBottom: "var(--space-xs)",
    textTransform: "uppercase",
    fontFamily: "Inter, system-ui, sans-serif",
  };

  const groupContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  };

  const userSectionStyle: React.CSSProperties = {
    paddingTop: "var(--space-md)",
    borderTop: "1px solid var(--apple-border)",
    marginTop: "auto",
  };

  const userNameStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--apple-text-primary)",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const userRoleStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "var(--apple-text-secondary)",
    margin: "4px 0 0 0",
    textTransform: "capitalize",
  };

  return (
    <aside style={sidebarStyle}>
      {/* Logo Section */}
      <div style={logoSectionStyle}>
        <div style={logoBoxStyle}>PMD</div>
        <div style={logoTextStyle}>
          <h1 style={logoTitleStyle}>PMD</h1>
          <p style={logoSubtitleStyle}>Management</p>
        </div>
      </div>

        {/* Navigation */}
        <nav style={navStyle}>
          {accessibleGroups.map((group, groupIndex) => {
            const isGroupExpanded = expandedGroups.has(group.title);
            const hasActiveChild = group.items.some((item) => isActive(item.href));

            return (
              <div key={group.title} style={groupContainerStyle}>
                {/* Group Title */}
                {groupIndex > 0 && (
                  <div style={groupTitleStyle}>{group.title}</div>
                )}

                {/* Group Items */}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const itemIsActive = isActive(item.href);
                  const badgeCount = item.badge?.count;

                  return (
                    <SidebarItem
                      key={item.href}
                      href={item.href}
                      icon={Icon as any}
                      label={item.label}
                      isActive={itemIsActive}
                      badge={badgeCount}
                    />
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User Info */}
        {user && (
          <div style={userSectionStyle}>
            <p style={userNameStyle}>{user.fullName || user.email}</p>
            <p style={userRoleStyle}>{String(user.role ?? "")}</p>
          </div>
        )}
    </aside>
  );
}
