"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore, UserRole } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon?: string;
  roles?: UserRole[];
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Works", href: "/works", icon: "🔨" },
  { label: "Suppliers", href: "/suppliers", icon: "🏢" },
  { label: "Expenses", href: "/expenses", icon: "💸" },
  { label: "Cashbox", href: "/cashbox", icon: "💰" },
  { label: "Alerts", href: "/alerts", icon: "🔔" },
  { label: "Accounting", href: "/accounting", icon: "📊" },
  { label: "Audit Log", href: "/audit", icon: "📋" },
  {
    label: "Admin",
    href: "/admin",
    icon: "⚙️",
    roles: ["admin"],
    children: [
      { label: "Users", href: "/admin/users", icon: "👥" },
      { label: "Roles", href: "/admin/roles", icon: "🔐" },
    ],
  },
];

// Role-based access rules
const getAccessibleItems = (userRole: UserRole | undefined): NavItem[] => {
  if (!userRole) return [];

  const accessibleItems: NavItem[] = [];

  navItems.forEach((item) => {
    // Check if item has role restrictions
    if (item.roles && !item.roles.includes(userRole)) {
      return; // Skip this item
    }

    // OPERATOR: ocultar Audit, Users (Admin section)
    if (userRole === "operator") {
      if (item.href === "/audit" || item.href === "/admin" || item.href.startsWith("/admin/")) {
        return; // Skip Audit and Admin sections
      }
      accessibleItems.push({ ...item, children: undefined });
      return;
    }

    // AUDITOR: solo lectura (puede ver todo pero sin acciones de creación/edición)
    if (userRole === "auditor") {
      // Auditor puede ver todo pero sin acciones de CRUD
      accessibleItems.push(item);
      return;
    }

    // ADMIN: acceso total
    if (userRole === "admin") {
      accessibleItems.push(item);
      return;
    }
  });

  return accessibleItems;
};

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore.getState().getUserSafe();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // User role is already normalized by getUserSafe
  const userRole = user?.role as UserRole | undefined;
  const accessibleItems = getAccessibleItems(userRole);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={cn(
        "bg-pmd-darkBlue min-h-screen flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-pmd-mediumBlue flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h1 className="text-2xl font-bold text-pmd-white">PMD</h1>
            <p className="text-sm text-gray-400 mt-1">Management System</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-pmd-white hover:bg-pmd-mediumBlue p-2 rounded-pmd transition-colors"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {accessibleItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isItemActive = isActive(item.href);
          const isExpanded = expandedItems.includes(item.href);

          return (
            <div key={item.href}>
              {hasChildren ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-pmd text-pmd-white transition-colors",
                      "hover:bg-pmd-mediumBlue",
                      isItemActive && "bg-pmd-mediumBlue border-l-4 border-pmd-gold"
                    )}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {!isCollapsed && (
                      <>
                        <span className="font-medium flex-1 text-left">{item.label}</span>
                        <span className={cn("transition-transform", isExpanded && "rotate-90")}>
                          ▶
                        </span>
                      </>
                    )}
                  </button>
                  {!isCollapsed && isExpanded && item.children && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const isChildActive = isActive(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2 rounded-pmd text-pmd-white transition-colors text-sm",
                              "hover:bg-pmd-mediumBlue",
                              isChildActive && "bg-pmd-mediumBlue border-l-4 border-pmd-gold"
                            )}
                          >
                            <span className="text-lg">{child.icon}</span>
                            <span className="font-medium">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-pmd text-pmd-white transition-colors",
                    "hover:bg-pmd-mediumBlue",
                    isItemActive && "bg-pmd-mediumBlue border-l-4 border-pmd-gold"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Info */}
      {user && !isCollapsed && (
        <div className="p-4 border-t border-pmd-mediumBlue">
          <div className="text-sm text-gray-400">
            <p className="text-pmd-white font-medium">{user.name}</p>
            <p className="text-xs capitalize">{String(user.role ?? '')}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
