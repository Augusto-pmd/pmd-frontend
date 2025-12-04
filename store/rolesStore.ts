import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { buildApiRoute } from "@/lib/safeApi";
import { logCreate, logUpdate, logDelete } from "@/lib/auditHelper";

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
  userCount?: number;
  cantidadUsuarios?: number;
}

interface RolesState {
  roles: Role[];
  permissions: string[];
  isLoading: boolean;
  error: string | null;

  fetchRoles: () => Promise<void>;
  fetchPermissions: () => Promise<void>;
  createRole: (payload: Partial<Role>) => Promise<void>;
  updateRole: (id: string, payload: Partial<Role>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
}

export const useRolesStore = create<RolesState>((set, get) => ({
  roles: [],
  permissions: [],
  isLoading: false,
  error: null,

  async fetchRoles() {
    // Regla 1: Nunca llamar un endpoint sin organizationId
    const authState = useAuthStore.getState();
    const orgId = authState.user?.organizationId;
    
    if (!orgId) {
      console.warn("❗Error: organizationId undefined en rolesStore");
      set({ error: "No hay organización seleccionada", isLoading: false });
      return;
    }

    // Regla 2: Actualizar todas las rutas a /api/${orgId}/recurso
    const url = buildApiRoute(orgId, "roles");
    if (!url) {
      console.error("🔴 [rolesStore] URL inválida");
      set({ error: "URL de API inválida", isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get(url);
      set({ roles: data?.data || data || [], isLoading: false });
    } catch (error: any) {
      console.error("🔴 [rolesStore] Error al obtener roles:", error);
      set({ error: error.message || "Error al cargar roles", isLoading: false });
    }
  },

  async fetchPermissions() {
    // Regla 1: Nunca llamar un endpoint sin organizationId
    const authState = useAuthStore.getState();
    const orgId = authState.user?.organizationId;
    
    if (!orgId) {
      console.warn("❗Error: organizationId undefined en rolesStore");
      set({ error: "No hay organización seleccionada", isLoading: false });
      return;
    }

    // Intentar obtener permisos desde el backend
    // Si el backend no tiene endpoint de permisos, usar lista estándar
    try {
      // Regla 2: Actualizar todas las rutas a /api/${orgId}/recurso
      const url = buildApiRoute(orgId, "permissions");
      if (url) {
        const data = await apiClient.get(url);
        const permissions = data?.data || data || [];
        if (Array.isArray(permissions) && permissions.length > 0) {
          set({ permissions });
          return;
        }
      }
    } catch (error: any) {
      console.warn("⚠️ [rolesStore] No se pudo obtener permisos del backend, usando lista estándar");
    }

    // Lista estándar de permisos si el backend no los provee
    const standardPermissions = [
      "works.read", "works.create", "works.update", "works.delete", "works.manage",
      "staff.read", "staff.create", "staff.update", "staff.delete", "staff.manage",
      "suppliers.read", "suppliers.create", "suppliers.update", "suppliers.delete", "suppliers.manage",
      "documents.read", "documents.create", "documents.update", "documents.delete", "documents.manage",
      "accounting.read", "accounting.create", "accounting.update", "accounting.delete", "accounting.manage",
      "cashbox.read", "cashbox.create", "cashbox.update", "cashbox.delete", "cashbox.manage",
      "clients.read", "clients.create", "clients.update", "clients.delete", "clients.manage",
      "alerts.read", "alerts.create", "alerts.update", "alerts.delete", "alerts.manage",
      "audit.read", "audit.delete", "audit.manage",
      "settings.read", "settings.update", "settings.manage",
      "users.read", "users.create", "users.update", "users.delete", "users.manage",
      "roles.read", "roles.create", "roles.update", "roles.delete", "roles.manage",
    ];
    set({ permissions: standardPermissions });
  },

  async createRole(payload) {
    if (!payload) {
      console.warn("❗ [rolesStore] payload no está definido");
      throw new Error("Payload no está definido");
    }

    // Regla 1: Nunca llamar un endpoint sin organizationId
    const authState = useAuthStore.getState();
    const orgId = authState.user?.organizationId;
    
    if (!orgId) {
      console.warn("❗Error: organizationId undefined en rolesStore");
      throw new Error("No hay organización seleccionada");
    }

    // Validar campos obligatorios
    if (!payload.name || payload.name.trim() === "") {
      throw new Error("El nombre del rol es obligatorio");
    }

    // Regla 2: Actualizar todas las rutas a /api/${orgId}/recurso
    const url = buildApiRoute(orgId, "roles");
    if (!url) {
      throw new Error("URL de API inválida");
    }

    try {
      // Construir payload exacto según DTO
      const rolePayload: any = {
        name: payload.name.trim(),
      };

      // Agregar campos opcionales
      if (payload.description) rolePayload.description = payload.description.trim();
      if (payload.permissions && Array.isArray(payload.permissions)) {
        rolePayload.permissions = payload.permissions;
      } else {
        rolePayload.permissions = [];
      }

      const response = await apiClient.post(url, rolePayload);
      
      // Registrar en auditoría
      await logCreate("roles", "Role", response?.data?.id || "unknown", `Se creó el rol ${rolePayload.name}`);
      
      await get().fetchRoles();
      return response;
    } catch (error: any) {
      console.error("🔴 [rolesStore] Error al crear rol:", error);
      throw error;
    }
  },

  async updateRole(id, payload) {
    if (!id) {
      console.warn("❗ [rolesStore] id no está definido");
      throw new Error("ID de rol no está definido");
    }

    if (!payload) {
      console.warn("❗ [rolesStore] payload no está definido");
      throw new Error("Payload no está definido");
    }

    // Regla 1: Nunca llamar un endpoint sin organizationId
    const authState = useAuthStore.getState();
    const orgId = authState.user?.organizationId;
    
    if (!orgId) {
      console.warn("❗Error: organizationId undefined en rolesStore");
      throw new Error("No hay organización seleccionada");
    }

    // Obtener rol actual para auditoría
    const currentRole = get().roles.find((r) => r.id === id);
    const beforeState = currentRole ? { ...currentRole } : null;

    // Regla 2: Actualizar todas las rutas a /api/${orgId}/recurso
    const url = buildApiRoute(orgId, "roles", id);
    if (!url) {
      throw new Error("URL de actualización inválida");
    }

    try {
      // Construir payload exacto según DTO
      const rolePayload: any = {};

      if (payload.name) rolePayload.name = payload.name.trim();
      if (payload.description !== undefined) rolePayload.description = payload.description?.trim() || undefined;
      if (payload.permissions !== undefined) {
        rolePayload.permissions = Array.isArray(payload.permissions) ? payload.permissions : [];
      }

      const response = await apiClient.put(url, rolePayload);
      
      // Registrar en auditoría
      const afterState = { ...beforeState, ...rolePayload };
      await logUpdate("roles", "Role", id, beforeState, afterState, `Se actualizó el rol ${rolePayload.name || currentRole?.name || id}`);
      
      await get().fetchRoles();
      return response;
    } catch (error: any) {
      console.error("🔴 [rolesStore] Error al actualizar rol:", error);
      throw error;
    }
  },

  async deleteRole(id) {
    if (!id) {
      console.warn("❗ [rolesStore] id no está definido");
      throw new Error("ID de rol no está definido");
    }

    // Regla 1: Nunca llamar un endpoint sin organizationId
    const authState = useAuthStore.getState();
    const orgId = authState.user?.organizationId;
    
    if (!orgId) {
      console.warn("❗Error: organizationId undefined en rolesStore");
      throw new Error("No hay organización seleccionada");
    }

    // Obtener rol para auditoría
    const role = get().roles.find((r) => r.id === id);
    const roleName = role?.name || id;

    // Regla 2: Actualizar todas las rutas a /api/${orgId}/recurso
    const url = buildApiRoute(orgId, "roles", id);
    if (!url) {
      throw new Error("URL de eliminación inválida");
    }

    try {
      await apiClient.delete(url);
      
      // Registrar en auditoría
      await logDelete("roles", "Role", id, `Se eliminó el rol ${roleName}`);
      
      await get().fetchRoles();
    } catch (error: any) {
      console.error("🔴 [rolesStore] Error al eliminar rol:", error);
      throw error;
    }
  },
}));

