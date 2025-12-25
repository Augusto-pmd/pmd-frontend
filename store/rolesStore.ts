import { create } from "zustand";
import { apiClient } from "@/lib/api";
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
    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get("/roles");
      set({ roles: (data as any)?.data || data || [], isLoading: false });
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [rolesStore] Error al obtener roles:", error);
      }
      const errorMessage = error instanceof Error ? error.message : "Error al cargar roles";
      set({ error: errorMessage, isLoading: false });
    }
  },

  async fetchPermissions() {
    // Intentar obtener permisos desde el backend
    // Si el backend no tiene endpoint de permisos, usar lista estándar
    try {
      const data = await apiClient.get("/permissions");
      const permissions = (data as any)?.data || data || [];
      if (Array.isArray(permissions) && permissions.length > 0) {
        set({ permissions });
        return;
      }
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ [rolesStore] No se pudo obtener permisos del backend, usando lista estándar");
      }
    }

    // Lista estándar de permisos si el backend no los provee
    const standardPermissions = [
      "works.read", "works.create", "works.update", "works.delete", "works.manage",
      "suppliers.read", "suppliers.create", "suppliers.update", "suppliers.delete", "suppliers.manage",
      "documents.read", "documents.create", "documents.update", "documents.delete", "documents.manage",
      "accounting.read", "accounting.create", "accounting.update", "accounting.delete", "accounting.manage",
      "cashbox.read", "cashbox.create", "cashbox.update", "cashbox.delete", "cashbox.manage",
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
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [rolesStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
    }

    // Validar campos obligatorios
    if (!payload.name || payload.name.trim() === "") {
      throw new Error("El nombre del rol es obligatorio");
    }

    try {
      // Construir payload exacto según DTO
      const rolePayload: {
        name: string;
        description?: string;
        permissions: string[];
      } = {
        name: payload.name.trim(),
        permissions: [],
      };

      // Agregar campos opcionales
      if (payload.description) rolePayload.description = payload.description.trim();
      if (payload.permissions && Array.isArray(payload.permissions)) {
        rolePayload.permissions = payload.permissions;
      }

      const response = await apiClient.post("/roles", rolePayload);
      
      // Registrar en auditoría
      await logCreate("roles", "Role", (response as any)?.data?.id || "unknown", `Se creó el rol ${rolePayload.name}`);
      
      await get().fetchRoles();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [rolesStore] Error al crear rol:", error);
      }
      throw error;
    }
  },

  async updateRole(id, payload) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [rolesStore] id no está definido");
      }
      throw new Error("ID de rol no está definido");
    }

    if (!payload) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [rolesStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
    }

    // Obtener rol actual para auditoría
    const currentRole = get().roles.find((r) => r.id === id);
    const beforeState = currentRole ? { ...currentRole } : null;

    try {
      // Construir payload exacto según DTO
      const rolePayload: {
        name?: string;
        description?: string;
        permissions?: string[];
      } = {};

      if (payload.name) rolePayload.name = payload.name.trim();
      if (payload.description !== undefined) rolePayload.description = payload.description?.trim() || undefined;
      if (payload.permissions !== undefined) {
        rolePayload.permissions = Array.isArray(payload.permissions) ? payload.permissions : [];
      }

      const response = await apiClient.put(`/roles/${id}`, rolePayload);
      
      // Registrar en auditoría
      const afterState = { ...beforeState, ...rolePayload };
      await logUpdate("roles", "Role", id, beforeState, afterState, `Se actualizó el rol ${rolePayload.name || currentRole?.name || id}`);
      
      await get().fetchRoles();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [rolesStore] Error al actualizar rol:", error);
      }
      throw error;
    }
  },

  async deleteRole(id) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [rolesStore] id no está definido");
      }
      throw new Error("ID de rol no está definido");
    }

    // Obtener rol para auditoría
    const role = get().roles.find((r) => r.id === id);
    const roleName = role?.name || id;

    try {
      await apiClient.delete(`/roles/${id}`);
      
      // Registrar en auditoría
      await logDelete("roles", "Role", id, `Se eliminó el rol ${roleName}`);
      
      await get().fetchRoles();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [rolesStore] Error al eliminar rol:", error);
      }
      throw error;
    }
  },
}));

