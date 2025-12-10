"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useUsersStore } from "@/store/usersStore";
import { useRoles } from "@/hooks/api/roles";
import { LoadingState } from "@/components/ui/LoadingState";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { UserForm } from "./components/UserForm";
import { ChangeRoleModal } from "./components/ChangeRoleModal";
import { useToast } from "@/components/ui/Toast";
import { Search, Filter, X, Plus, Edit, Trash2, UserCog, UserX } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/Badge";

function UsersContent() {
  const { users, isLoading, error, fetchUsers, deleteUser, deactivateUser, activateUser } = useUsersStore();
  const { roles } = useRoles();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (organizationId) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  if (!organizationId) {
    return (
      <MainLayout>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <p className="font-semibold mb-2">No se pudo determinar la organización</p>
          <p className="text-sm">Por favor, vuelve a iniciar sesión para continuar.</p>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando usuarios…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error al cargar los usuarios: {error}
        </div>
      </MainLayout>
    );
  }

  // Filtrar usuarios
  const filteredUsers = (users || []).filter((user) => {
    // Búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = user.fullName?.toLowerCase().includes(query);
      const matchesEmail = user.email?.toLowerCase().includes(query);
      if (!matchesName && !matchesEmail) return false;
    }

    // Filtro de rol
    if (roleFilter !== "all" && user.roleId !== roleFilter) return false;

    // Filtro de estado
    if (statusFilter === "active" && !user.isActive) return false;
    if (statusFilter === "inactive" && user.isActive) return false;

    return true;
  });

  // Obtener roles únicos
  const uniqueRoleIds = Array.from(new Set((users || []).map((u) => u.roleId).filter(Boolean))) as string[];

  const getRoleName = (roleId?: string) => {
    if (!roleId) return "Sin rol";
    const role = roles.find((r: any) => r.id === roleId);
    if (!role) return roleId;
    return role.name || role.nombre || roleId;
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await deleteUser(selectedUser.id);
      toast.success("Usuario eliminado correctamente");
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      console.error("Error al eliminar usuario:", err);
      toast.error(err.message || "Error al eliminar el usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: any) => {
    setIsSubmitting(true);
    try {
      if (user.isActive) {
        await deactivateUser(user.id);
        toast.success("Usuario desactivado correctamente");
      } else {
        await activateUser(user.id);
        toast.success("Usuario activado correctamente");
      }
    } catch (err: any) {
      console.error("Error al cambiar estado:", err);
      toast.error(err.message || "Error al cambiar el estado del usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="px-1">
          <BotonVolver />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Usuarios</h1>
              <p className="text-gray-600">Gestión de usuarios del sistema PMD</p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setSelectedUser(null);
                setIsFormModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Usuario
            </Button>
          </div>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Buscar por nombre o email..."
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
            {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
                >
                  <option value="all">Todos</option>
                  {uniqueRoleIds.map((roleId) => (
                    <option key={roleId} value={roleId}>
                      {getRoleName(roleId)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tabla de Usuarios */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Creación
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron usuarios con los filtros aplicados
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 transition-colors ${!user.isActive ? "opacity-60" : ""}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="info">{getRoleName(user.roleId)}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.isActive ? "success" : "default"}>
                          {user.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString("es-AR")
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsFormModalOpen(true);
                            }}
                            className="text-gray-700 hover:text-gray-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsChangeRoleModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                            title="Cambiar rol"
                          >
                            <UserCog className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(user)}
                            disabled={isSubmitting}
                            className={user.isActive ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
                            title={user.isActive ? "Desactivar" : "Activar"}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modales */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedUser(null);
          }}
          title={selectedUser ? "Editar Usuario" : "Nuevo Usuario"}
          size="lg"
        >
          <UserForm
            user={selectedUser}
            onSuccess={() => {
              setIsFormModalOpen(false);
              setSelectedUser(null);
              fetchUsers();
            }}
            onCancel={() => {
              setIsFormModalOpen(false);
              setSelectedUser(null);
            }}
          />
        </Modal>

        <ChangeRoleModal
          isOpen={isChangeRoleModalOpen}
          onClose={() => {
            setIsChangeRoleModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={() => {
            setIsChangeRoleModalOpen(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />

        {selectedUser && (
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedUser(null);
            }}
            title="Confirmar Eliminación"
            size="md"
          >
            <div className="space-y-4">
              <p className="text-gray-700">
                ¿Estás seguro de que deseas eliminar este usuario?
              </p>
              <p className="text-sm text-gray-500 font-medium">{selectedUser.fullName}</p>
              <p className="text-sm text-gray-500">{selectedUser.email}</p>
              <p className="text-sm text-gray-500">Esta acción no se puede deshacer.</p>
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedUser(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <UsersContent />
    </ProtectedRoute>
  );
}

