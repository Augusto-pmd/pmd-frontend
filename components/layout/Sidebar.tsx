"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAlertsStore } from "@/store/alertsStore";
import { useDocumentsStore } from "@/store/documentsStore";
import { useCashboxStore } from "@/store/cashboxStore";
import { useCan } from "@/lib/acl";
import { useEffect, useMemo, memo, useState } from "react";
import LogoPMD from "@/components/LogoPMD";
import styles from "./Sidebar.module.css";
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
  
  // Operaciones
  { label: "Proveedores", href: "/suppliers", icon: Truck, permission: "suppliers.read", section: "Operaciones" },
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

// 🔍 AUDITORÍA: Contador de renders del Sidebar
let sidebarRenderCount = 0;
let lastUserId: string | null = null;

function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  useEffect(() => {
    console.log("[SIDEBAR REAL] mounted");
  }, []);

  const pathname = usePathname();
  const router = useRouter();
  const { alerts, fetchAlerts } = useAlertsStore();
  const { documents, fetchDocuments } = useDocumentsStore();
  const { cashboxes, fetchCashboxes } = useCashboxStore();
  // ✅ FUENTE ÚNICA DE VERDAD: useAuthStore desde @/store/authStore
  // Este hook está conectado al store persistido en localStorage con key "pmd-auth-storage"
  // El componente se re-renderiza reactivamente cuando state.user cambia
  const userFromStore = useAuthStore((state) => state.user);
  
  // 🔍 SONDA TEMPORAL DE DIAGNÓSTICO: Leer user directamente desde localStorage
  const [userFromStorage, setUserFromStorage] = useState<any>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pmd-auth-storage");
        if (stored) {
          const parsed = JSON.parse(stored);
          const storageUser = parsed?.state?.user || null;
          console.log("🔍 [SIDEBAR STORAGE PROBE] Raw localStorage:", stored);
          console.log("🔍 [SIDEBAR STORAGE PROBE] Parsed state:", parsed?.state);
          console.log("🔍 [SIDEBAR STORAGE USER]:", storageUser);
          console.log("🔍 [SIDEBAR STORAGE USER ID]:", storageUser?.id);
          console.log("🔍 [SIDEBAR STORAGE USER ROLE]:", storageUser?.role);
          console.log("🔍 [SIDEBAR STORAGE USER PERMISSIONS]:", storageUser?.role?.permissions);
          setUserFromStorage(storageUser);
        } else {
          console.log("🔍 [SIDEBAR STORAGE PROBE] No hay datos en localStorage bajo 'pmd-auth-storage'");
        }
      } catch (error) {
        console.error("🔍 [SIDEBAR STORAGE PROBE] Error al leer localStorage:", error);
      }
    }
  }, []);
  
  // 🔍 TEMPORAL: Usar userFromStorage si existe, sino usar userFromStore
  const user = userFromStorage || userFromStore;
  
  // 🔍 AUDITORÍA: Detectar re-render cuando user cambia
  sidebarRenderCount++;
  const currentUserId = user?.id || null;
  const userChanged = currentUserId !== lastUserId;
  if (userChanged) {
    console.log("🟡 [SIDEBAR] ⚡ RE-RENDER DETECTADO: user cambió");
    console.log("🟡 [SIDEBAR] lastUserId:", lastUserId);
    console.log("🟡 [SIDEBAR] currentUserId:", currentUserId);
    lastUserId = currentUserId;
  }
  console.log(`🟡 [SIDEBAR] Render #${sidebarRenderCount} | user.id: ${currentUserId} | userChanged: ${userChanged}`);

  // 🔍 AUDITORÍA: Validar un solo user y permissions no vacío
  console.log("🔵 [AUDIT] ========================================");
  console.log("🔵 [AUDIT] 1. UN SOLO USER:");
  console.log("🔵 [AUDIT]    user existe:", !!user);
  console.log("🔵 [AUDIT]    user.id:", user?.id);
  console.log("🔵 [AUDIT]    user.email:", user?.email);
  
  // ✅ Variable normalizada: siempre es string[]
  const permissions: string[] = user?.role?.permissions ?? [];
  
  console.log("🔵 [AUDIT] 2. PERMISSIONS NO VACÍO:");
  const permissionsLength = permissions.length;
  console.log("🔵 [AUDIT]    permissions existe:", permissions.length > 0);
  console.log("🔵 [AUDIT]    permissions es Array:", Array.isArray(permissions));
  console.log("🔵 [AUDIT]    permissions.length:", permissionsLength);
  if (permissionsLength > 0) {
    console.log("🔵 [AUDIT]    ✅ PASS: permissions no vacío");
    console.log("🔵 [AUDIT]    permissions sample:", permissions.slice(0, 5));
  } else {
    console.error("🔵 [AUDIT]    ❌ FAIL: permissions vacío o no existe");
  }
  
  console.log("🔵 [AUDIT] 3. RE-RENDER CUANDO USER CAMBIA:");
  console.log("🔵 [AUDIT]    renderCount:", sidebarRenderCount);
  console.log("🔵 [AUDIT]    userChanged:", userChanged);
  if (userChanged && sidebarRenderCount > 1) {
    console.log("🔵 [AUDIT]    ✅ PASS: Sidebar re-renderiza cuando user cambia");
  } else if (sidebarRenderCount === 1) {
    console.log("🔵 [AUDIT]    ⏳ PENDING: Primer render, esperando cambio de user");
  } else {
    console.log("🔵 [AUDIT]    ⚠️ WARNING: user no cambió en este render");
  }
  console.log("🔵 [AUDIT] ========================================");

  // 🔍 AUDITORÍA RUNTIME: Validaciones explícitas
  console.log("🔵 [SIDEBAR AUDIT] ========================================");
  console.log("🔵 [SIDEBAR AUDIT] user completo:", JSON.stringify(user, null, 2));
  
  // VALIDACIÓN 1: user existe
  if (!user) {
    console.error("🔵 [SIDEBAR AUDIT] ❌ FAIL: user no existe");
  } else {
    console.log("🔵 [SIDEBAR AUDIT] ✅ PASS: user existe");
    
    // VALIDACIÓN 2: user.role existe
    if (!user.role) {
      console.error("🔵 [SIDEBAR AUDIT] ❌ FAIL: user.role no existe");
    } else {
      console.log("🔵 [SIDEBAR AUDIT] ✅ PASS: user.role existe");
      console.log("🔵 [SIDEBAR AUDIT] user.role.name:", user.role.name);
      
      // VALIDACIÓN 3: permissions existe (usando variable normalizada)
      if (permissions.length === 0) {
        console.error("🔵 [SIDEBAR AUDIT] ❌ FAIL: permissions no existe o está vacío");
      } else {
        console.log("🔵 [SIDEBAR AUDIT] ✅ PASS: permissions existe");
        
        // VALIDACIÓN 4: permissions es Array (usando variable normalizada)
        if (!Array.isArray(permissions)) {
          console.error("🔵 [SIDEBAR AUDIT] ❌ FAIL: permissions no es Array. Tipo:", typeof permissions);
        } else {
          console.log("🔵 [SIDEBAR AUDIT] ✅ PASS: permissions es Array");
          
          // VALIDACIÓN 5: permissions no es vacío (usando variable normalizada)
          if (permissions.length === 0) {
            console.error("🔵 [SIDEBAR AUDIT] ❌ FAIL: permissions está vacío (length: 0)");
          } else {
            console.log("🔵 [SIDEBAR AUDIT] ✅ PASS: permissions no está vacío (length:", permissions.length, ")");
            console.log("🔵 [SIDEBAR AUDIT] permissions:", permissions);
          }
        }
      }
    }
  }

  // ACL hooks - deben ejecutarse siempre antes de cualquier return
  const canWorks = useCan("works.read");
  const canSuppliers = useCan("suppliers.read");
  const canAccounting = useCan("accounting.read");
  const canCashbox = useCan("cashbox.read");
  const canDocuments = useCan("documents.read");
  const canAlerts = useCan("alerts.read");
  const canAudit = useCan("audit.read");
  const canUsers = useCan("users.read");
  const canRoles = useCan("roles.read");
  const canSettings = useCan("settings.read");

  // 🔍 DIAGNÓSTICO: Log de todos los permisos
  console.log("🔵 [SIDEBAR] Permisos verificados:");
  console.log("  - canWorks:", canWorks);
  console.log("  - canSuppliers:", canSuppliers);
  console.log("  - canAccounting:", canAccounting);
  console.log("  - canCashbox:", canCashbox);
  console.log("  - canDocuments:", canDocuments);
  console.log("  - canAlerts:", canAlerts);
  console.log("  - canAudit:", canAudit);
  console.log("  - canUsers:", canUsers);
  console.log("  - canRoles:", canRoles);
  console.log("  - canSettings:", canSettings);

  // Hook reactivo para organizationId
  const organizationId = useAuthStore((state) => state.user?.organizationId);

  useEffect(() => {
    if (organizationId) {
      fetchAlerts();
      fetchDocuments();
      fetchCashboxes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  // Memoizar items visibles según permisos ACL - solo se calcula cuando user existe
  const visibleItems = useMemo(() => {
    // Si no hay user, retornar solo Dashboard para evitar cálculo innecesario
    if (!user) {
      const dashboardItem = ALL_NAV_ITEMS.find(item => item.href === "/dashboard");
      return dashboardItem ? [dashboardItem] : [];
    }

    const filtered = ALL_NAV_ITEMS.filter((item) => {
      // Dashboard siempre visible si hay usuario
      if (item.permission === "always" || item.href === "/dashboard") {
        console.log(`🔵 [SIDEBAR] Item "${item.label}" visible (always/dashboard)`);
        return true;
      }
      
      // Verificar permiso específico
      let hasPermission = false;
      switch (item.permission) {
        case "works.read":
          hasPermission = canWorks;
          break;
        case "suppliers.read":
          hasPermission = canSuppliers;
          break;
        case "accounting.read":
          hasPermission = canAccounting;
          break;
        case "cashbox.read":
          hasPermission = canCashbox;
          break;
        case "documents.read":
          hasPermission = canDocuments;
          break;
        case "alerts.read":
          hasPermission = canAlerts;
          break;
        case "audit.read":
          hasPermission = canAudit;
          break;
        case "users.read":
          hasPermission = canUsers;
          break;
        case "roles.read":
          hasPermission = canRoles;
          break;
        case "settings.read":
          hasPermission = canSettings;
          break;
        default:
          hasPermission = true;
      }
      
      console.log(`🔵 [SIDEBAR] Item "${item.label}" (${item.permission}): ${hasPermission ? "✅ VISIBLE" : "❌ OCULTO"}`);
      return hasPermission;
    });
    
    console.log("🔵 [SIDEBAR] Total items visibles:", filtered.length, "de", ALL_NAV_ITEMS.length);
    console.log("🔵 [SIDEBAR] Items visibles:", filtered.map(i => i.label));
    console.log("🔵 [SIDEBAR] ========================================");
    
    // Fallback defensivo: asegurar que al menos Dashboard esté visible
    if (filtered.length === 0) {
      const dashboardItem = ALL_NAV_ITEMS.find(item => item.href === "/dashboard");
      if (dashboardItem) {
        console.log("🔵 [SIDEBAR] ⚠️ Fallback: agregando Dashboard como último recurso");
        return [dashboardItem];
      }
    }
    
    return filtered;
  }, [user, canWorks, canSuppliers, canAccounting, canCashbox, canDocuments, canAlerts, canAudit, canUsers, canRoles, canSettings]);

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
  if (!user) {
    console.log("🔴 [SIDEBAR] EARLY RETURN: user no existe");
    return null;
  }

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;
  const pendingDocsCount = documents.filter((d) => d.status === "pendiente").length;
  const openCashboxesCount = cashboxes.filter((c) => !c.isClosed).length;

  const isActive = (href: string) => {
    if (!pathname) return false;
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
      const criticalAlerts = alerts.filter((a) => !a.read && a.severity === "critical").length;
      if (criticalAlerts > 0) return "error";
      const warningAlerts = alerts.filter((a) => !a.read && a.severity === "warning").length;
      if (warningAlerts > 0) return "warning";
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
      {/* Sidebar */}
      <aside
        className={`${styles.sidebarWrapper} 
          /* Base styles - siempre aplicados */
          bg-[#162F7F] border-r border-white/20 
          touch-pan-y touch-manipulation scrollbar-none text-white touch-none select-none
          /* Desktop (md+): siempre visible, static, ancho fijo */
          md:static md:translate-x-0 md:w-64 md:z-auto
          /* Mobile: fixed, condicional según mobileOpen */
          fixed top-0 left-0 z-[9998] 
          transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
          ${
            mobileOpen
              ? "translate-x-0" /* Mobile: visible cuando mobileOpen es true */
              : "-translate-x-full" /* Mobile: oculto cuando mobileOpen es false */
          }
        `}
        style={{ 
          width: mobileOpen ? "min(85vw, 256px)" : undefined 
        }}
      >
        {/* Logo Section */}
        <div className={`${styles.logoSection} flex justify-center items-center py-6 border-b border-white/10`}>
          <LogoPMD size={56} className="opacity-95 drop-shadow-md" />
        </div>

        {/* Navigation - Scrollable */}
        <nav className={`${styles.menuScroll} flex flex-col gap-2 px-3 py-4 scrollbar-none`}>
          {Object.entries(itemsBySection).map(([section, items]) => (
            <div key={section} className="mb-2">
              {/* Section Title */}
              <p className="px-5 mt-4 mb-1 text-xs uppercase tracking-wide text-white font-medium">
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
                      flex items-center gap-3 px-5 py-4
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
                    style={{ minHeight: "48px" }}
                  >
                    {/* Icon */}
                    <Icon className="w-5 h-5 text-white flex-shrink-0" />

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

        {/* User Section - Anchored at Bottom */}
        {user && (
          <div className={styles.userBlock}>
            <p className="text-sm font-semibold text-white truncate">
              {user.fullName || user.email}
            </p>
            <p className="text-xs text-white truncate opacity-90">
              {user.role?.name || user.roleId || "Sin rol"}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}

// Memoizar el componente para evitar re-renders innecesarios
export default memo(Sidebar);
