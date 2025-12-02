"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ChevronDown, ChevronRight, Users, Building2, Bell } from "lucide-react";
import { useAlertsStore } from "@/store/alertsStore";
import { useWorks } from "@/hooks/api/works";

interface Employee {
  id: string;
  fullName?: string;
  name?: string;
  nombre?: string;
  role?: string;
  subrole?: string;
  workId?: string;
  isActive?: boolean;
  [key: string]: any;
}

interface TreeNode {
  id: string;
  label: string;
  role: string;
  employees: Employee[];
  children?: TreeNode[];
  isExpanded?: boolean;
}

interface OrganigramTreeProps {
  employees: Employee[];
  onEmployeeClick?: (employee: Employee) => void;
}

export function OrganigramTree({ employees, onEmployeeClick }: OrganigramTreeProps) {
  const { alerts } = useAlertsStore();
  const { works } = useWorks();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["direccion"]));

  const getWorkName = (workId?: string) => {
    if (!workId) return null;
    const work = works.find((w: any) => w.id === workId);
    if (!work) return null;
    return work.name || work.title || work.nombre || workId;
  };

  const getEmployeeAlerts = (employeeId: string) => {
    return alerts.filter((alert) => alert.personId === employeeId);
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Estructura jerárquica del organigrama
  const buildTree = (): TreeNode[] => {
    const roleHierarchy: Record<string, { parent?: string; label: string }> = {
      Dirección: { label: "Dirección" },
      Arquitectura: { parent: "Dirección", label: "Arquitectura" },
      "Gestión de Obras": { parent: "Dirección", label: "Gestión de Obras" },
      "Jefe de Obra": { parent: "Gestión de Obras", label: "Jefes de Obra" },
      Obrero: { parent: "Jefe de Obra", label: "Obreros" },
      RRHH: { parent: "Dirección", label: "RRHH" },
      Administración: { parent: "Dirección", label: "Administración" },
      Compras: { parent: "Dirección", label: "Compras" },
      Logística: { parent: "Dirección", label: "Logística" },
    };

    // Agrupar empleados por rol
    const employeesByRole: Record<string, Employee[]> = {};
    employees.forEach((emp) => {
      const role = emp.role || "Sin rol";
      if (!employeesByRole[role]) {
        employeesByRole[role] = [];
      }
      employeesByRole[role].push(emp);
    });

    // Construir árbol
    const buildNode = (roleKey: string): TreeNode | null => {
      const config = roleHierarchy[roleKey];
      if (!config) return null;

      const nodeEmployees = employeesByRole[roleKey] || [];
      const children: TreeNode[] = [];

      // Buscar hijos
      Object.keys(roleHierarchy).forEach((childKey) => {
        if (roleHierarchy[childKey].parent === roleKey) {
          const childNode = buildNode(childKey);
          if (childNode) {
            children.push(childNode);
          }
        }
      });

      return {
        id: roleKey.toLowerCase().replace(/\s+/g, "-"),
        label: config.label,
        role: roleKey,
        employees: nodeEmployees,
        children: children.length > 0 ? children : undefined,
      };
    };

    // Construir desde la raíz (Dirección)
    const root = buildNode("Dirección");
    return root ? [root] : [];
  };

  const tree = buildTree();

  const renderNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const hasEmployees = node.employees.length > 0;

    return (
      <div key={node.id} className="mb-4">
        {/* Nodo del área/rol */}
        <div
          className={`flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors ${
            level === 0 ? "font-semibold" : ""
          }`}
          onClick={() => toggleNode(node.id)}
        >
          {hasChildren && (
            <div className="text-gray-400">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          )}
          {!hasChildren && <div className="w-4" />}
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-900">{node.label}</span>
          {hasEmployees && (
            <Badge variant="default" className="text-xs ml-auto">
              {node.employees.length}
            </Badge>
          )}
        </div>

        {/* Empleados del nodo */}
        {isExpanded && hasEmployees && (
          <div className="ml-6 mb-3 space-y-2">
            {node.employees.map((employee) => {
              const name = employee.fullName || employee.name || employee.nombre || "Sin nombre";
              const isActive = employee.isActive !== false;
              const workName = getWorkName(employee.workId);
              const employeeAlerts = getEmployeeAlerts(employee.id);
              const hasAlerts = employeeAlerts.length > 0;
              const unreadAlerts = employeeAlerts.filter((a) => !a.read).length;

              return (
                <div
                  key={employee.id}
                  onClick={() => onEmployeeClick?.(employee)}
                  className={`flex items-center gap-2 p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !isActive ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{name}</p>
                    {employee.subrole && (
                      <p className="text-xs text-gray-500">{employee.subrole}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {workName && (
                      <Badge variant="info" className="text-xs">
                        <Building2 className="h-3 w-3 mr-1" />
                        {workName}
                      </Badge>
                    )}
                    {hasAlerts && (
                      <Badge variant="error" className="text-xs">
                        <Bell className="h-3 w-3 mr-1" />
                        {unreadAlerts}
                      </Badge>
                    )}
                    {!isActive && (
                      <Badge variant="default" className="text-xs">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Nodos hijos */}
        {isExpanded && hasChildren && (
          <div className="ml-6 border-l border-gray-200 pl-4">
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (tree.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-pmd p-12 text-center">
        <p className="text-gray-600">No hay personal registrado</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-pmd p-6">
      <div className="space-y-2">{tree.map((node) => renderNode(node))}</div>
    </div>
  );
}

