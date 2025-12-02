"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useEmployees } from "@/hooks/api/employees";
import { useAlertsStore } from "@/store/alertsStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { OrganigramGrid } from "@/components/organigrama/OrganigramGrid";
import { OrganigramTree } from "@/components/organigrama/OrganigramTree";
import { EmployeeDetailModal } from "@/components/organigrama/EmployeeDetailModal";
import { AssignWorkModal } from "@/components/organigrama/AssignWorkModal";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Filter, X, Grid3x3, Network } from "lucide-react";
import { useWorks } from "@/hooks/api/works";

type ViewMode = "grid" | "tree";

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

function OrganigramaContent() {
  const router = useRouter();
  const { employees, isLoading, error } = useEmployees();
  const { alerts, fetchAlerts } = useAlertsStore();
  const { works } = useWorks();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [subroleFilter, setSubroleFilter] = useState("all");
  const [workFilter, setWorkFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [alertsFilter, setAlertsFilter] = useState<"all" | "with" | "without">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAssignWorkModalOpen, setIsAssignWorkModalOpen] = useState(false);

  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando organigrama…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar el organigrama: {error.message || "Error desconocido"}
        </div>
      </MainLayout>
    );
  }

  // Filtrar empleados
  const filteredEmployees = (employees || []).filter((employee: Employee) => {
    const name = (employee.fullName || employee.name || employee.nombre || "").toLowerCase();
    const role = employee.role || "";
    const subrole = employee.subrole || "";
    const isActive = employee.isActive !== false;
    const workId = employee.workId || "";
    const employeeAlerts = alerts.filter((alert) => alert.personId === employee.id);

    // Búsqueda
    if (searchQuery && !name.includes(searchQuery.toLowerCase())) return false;

    // Filtro de rol
    if (roleFilter !== "all" && role !== roleFilter) return false;

    // Filtro de subrol
    if (subroleFilter !== "all" && subrole !== subroleFilter) return false;

    // Filtro de obra
    if (workFilter !== "all" && workId !== workFilter) return false;

    // Filtro de estado
    if (statusFilter === "active" && !isActive) return false;
    if (statusFilter === "inactive" && isActive) return false;

    // Filtro de alertas
    if (alertsFilter === "with" && employeeAlerts.length === 0) return false;
    if (alertsFilter === "without" && employeeAlerts.length > 0) return false;

    return true;
  });

  // Obtener valores únicos para filtros
  const roles = Array.from(new Set((employees || []).map((e: Employee) => e.role).filter(Boolean))) as string[];
  const subroles = Array.from(
    new Set((employees || []).map((e: Employee) => e.subrole).filter(Boolean))
  ) as string[];

  const handleViewDetail = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    router.push(`/rrhh/${employee.id}`);
  };

  const handleAssignWork = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsAssignWorkModalOpen(true);
  };

  const handleViewAlerts = (employee: Employee) => {
    router.push(`/alerts?personId=${employee.id}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="px-1">
          <BotonVolver />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Organigrama PMD</h1>
              <p className="text-gray-600">Estructura del personal y áreas internas</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "primary" : "outline"}
                onClick={() => setViewMode("grid")}
                className="flex items-center gap-2"
              >
                <Grid3x3 className="h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === "tree" ? "primary" : "outline"}
                onClick={() => setViewMode("tree")}
                className="flex items-center gap-2"
              >
                <Network className="h-4 w-4" />
                Tree
              </Button>
            </div>
          </div>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="bg-white rounded-lg shadow-pmd p-4 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            {(searchQuery ||
              roleFilter !== "all" ||
              subroleFilter !== "all" ||
              workFilter !== "all" ||
              statusFilter !== "all" ||
              alertsFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                  setSubroleFilter("all");
                  setWorkFilter("all");
                  setStatusFilter("all");
                  setAlertsFilter("all");
                }}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none text-sm"
                >
                  <option value="all">Todos</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subrol</label>
                <select
                  value={subroleFilter}
                  onChange={(e) => setSubroleFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none text-sm"
                >
                  <option value="all">Todos</option>
                  {subroles.map((subrole) => (
                    <option key={subrole} value={subrole}>
                      {subrole}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Obra</label>
                <select
                  value={workFilter}
                  onChange={(e) => setWorkFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none text-sm"
                >
                  <option value="all">Todas</option>
                  {works.map((work: any) => {
                    const workName = work.name || work.title || work.nombre || work.id;
                    return (
                      <option key={work.id} value={work.id}>
                        {workName}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alertas</label>
                <select
                  value={alertsFilter}
                  onChange={(e) => setAlertsFilter(e.target.value as "all" | "with" | "without")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none text-sm"
                >
                  <option value="all">Todas</option>
                  <option value="with">Con alertas</option>
                  <option value="without">Sin alertas</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Vista seleccionada */}
        {viewMode === "grid" ? (
          <OrganigramGrid
            employees={filteredEmployees}
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onAssignWork={handleAssignWork}
          />
        ) : (
          <OrganigramTree
            employees={filteredEmployees}
            onEmployeeClick={handleViewDetail}
          />
        )}

        {/* Modales */}
        <EmployeeDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
          onEdit={handleEdit}
          onAssignWork={handleAssignWork}
          onViewAlerts={handleViewAlerts}
        />

        <AssignWorkModal
          isOpen={isAssignWorkModalOpen}
          onClose={() => {
            setIsAssignWorkModalOpen(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
          onSuccess={() => {
            // Recargar datos si es necesario
          }}
        />
      </div>
    </MainLayout>
  );
}

export default function OrganigramaPage() {
  return (
    <ProtectedRoute>
      <OrganigramaContent />
    </ProtectedRoute>
  );
}

