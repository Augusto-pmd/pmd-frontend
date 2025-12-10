import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { buildApiRoute } from "@/lib/safeApi";
import { logCreate, logUpdate, logDelete } from "@/lib/auditHelper";

export interface UserPMD {
  id: string;
  email: string;
  fullName: string;
  roleId?: string;
  role?: {
    id: string;
    name: string;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  phone?: string;
  position?: string;
}

interface UsersState {
  users: UserPMD[];
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  createUser: (payload: Partial<UserPMD> & { password?: string; phone?: string; position?: string }) => Promise<void>;
  updateUser: (id: string, payload: Partial<UserPMD> & { password?: string; phone?: string; position?: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  changeUserRole: (id: string, roleId: string) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
  activateUser: (id: string) => Promise<void>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  async fetchUsers() {
    // Regla 1: Nunca llamar un endpoint sin organizationId
    const authState = useAuthStore.getState();
    const orgId = authState.user?.organizationId;
    
    if (!orgId) {
      console.warn("❗Error: organizationId undefined en usersStore");
      set({ error: "No hay organización seleccionada", isLoading: false });
      return;
    }

    // Regla 2: Actualizar todas las rutas a /api/${orgId}/recurso
    const url = buildApiRoute(null, "users");
    if (!url) {
      console.error("🔴 [usersStore] URL inválida");
      set({ error: "URL de API inválida", isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get(url);
      set({ users: data?.data || data || [], isLoading: false });
    } catch (error: any) {
      console.error("🔴 [usersStore] Error al obtener usuarios:", error);
      set({ error: error.message || "Error al cargar usuarios", isLoading: false });
    }
  },

  async createUser(payload) {
    if (!payload) {
      console.warn("❗ [usersStore] payload no está definido");
      throw new Error("Payload no está definido");
    }

    // Regla 1: Nunca llamar un endpoint sin organizationId
    const authState = useAuthStore.getState();
    const orgId = authState.user?.organizationId;
    
    if (!orgId) {
      console.warn("❗Error: organizationId undefined en usersStore");
      throw new Error("No hay organización seleccionada");
    }

    // Validar campos obligatorios
    if (!payload.fullName || payload.fullName.trim() === "") {
      throw new Error("El nombre completo es obligatorio");
    }
    if (!payload.email || payload.email.trim() === "") {
      throw new Error("El email es obligatorio");
    }
    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      throw new Error("El email no es válido");
    }
    if (!payload.password || payload.password.trim() === "") {
      throw new Error("La contraseña es obligatoria al crear usuario");
    }
    if (payload.password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    // Regla 2: Actualizar todas las rutas a /api/${orgId}/recurso
    const url = buildApiRoute(null, "users");
    if (!url) {
      throw new Error("URL de API inválida");
    }

    try {
      // Construir payload exacto según DTO
      const userPayload: any = {
        fullName: payload.fullName.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        isActive: payload.isActive !== false,
      };

      // Agregar campos opcionales
      if (payload.roleId) userPayload.roleId = payload.roleId;
      if (payload.notes) userPayload.notes = payload.notes.trim();
      if (payload.phone) userPayload.phone = payload.phone.trim();
      if (payload.position) userPayload.position = payload.position.trim();

      const response = await apiClient.post(url, userPayload);
      
      // Registrar en auditoría
      await logCreate("users", "User", response?.data?.id || "unknown", `Se creó el usuario ${userPayload.fullName}`);
      
      await get().fetchUsers();
      return response;
    } catch (error: any) {
      console.error("🔴 [usersStore] Error al crear usuario:", error);
      throw error;
    }
  },

  async updateUser(id, payload) {
    if (!id) {
      console.warn("❗ [usersStore] id no está definido");
      throw new Error("ID de usuario no está definido");
    }

    if (!payload) {
      console.warn("❗ [usersStore] payload no está definido");
      throw new Error("Payload no está definido");
    }

    // Regla 1: Nunca llamar un endpoint sin organizationId
    const authState = useAuthStore.getState();
    const orgId = authState.user?.organizationId;
    
    if (!orgId) {
      console.warn("❗Error: organizationId undefined en usersStore");
      throw new Error("No hay organización seleccionada");
    }

    // Obtener usuario actual para auditoría
    const currentUser = get().users.find((u) => u.id === id);
    const beforeState = currentUser ? { ...currentUser } : null;

    // Validar email si se proporciona
    if (payload.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.email)) {
        throw new Error("El email no es válido");
      }
    }

    // Validar contraseña si se proporciona
    if (payload.password && payload.password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    // Regla 2: Actualizar todas las rutas a /api/${orgId}/recurso
    const url = buildApiRoute(null, "users", id);
    if (!url) {
      throw new Error("URL de actualización inválida");
    }

    try {
      // Construir payload exacto según DTO
      const userPayload: any = {};

      if (payload.fullName) userPayload.fullName = payload.fullName.trim();
      if (payload.email) userPayload.email = payload.email.trim().toLowerCase();
      if (payload.password) userPayload.password = payload.password;
      if (payload.roleId !== undefined) userPayload.roleId = payload.roleId || undefined;
      if (payload.isActive !== undefined) userPayload.isActive = payload.isActive;
      if (payload.notes !== undefined) userPayload.notes = payload.notes?.trim() || undefined;
      if (payload.phone !== undefined) userPayload.phone = payload.phone?.trim() || undefined;
      if (payload.position !== undefined) userPayload.position = payload.position?.trim() || undefined;

      const response = await apiClient.put(url, userPayload);
      
      // Registrar en auditoría
      const afterState = { ...beforeState, ...userPayload };
      await logUpdate("users", "User", id, beforeState, afterState, `Se actualizó el usuario ${userPayload.fullName || currentUser?.fullName || id}`);
      
      await get().fetchUsers();
      return response;
    } catch (error: any) {
      console.error("🔴 [usersStore] Error al actualizar usuario:", error);
      throw error;
    }
  },

  async deleteUser(id) {
    if (!id) {
      console.warn("❗ [usersStore] id no está definido");
      throw new Error("ID de usuario no está definido");
    }

    // Regla 1: Nunca llamar un endpoint sin organizationId
    const authState = useAuthStore.getState();
    const orgId = authState.user?.organizationId;
    
    if (!orgId) {
      console.warn("❗Error: organizationId undefined en usersStore");
      throw new Error("No hay organización seleccionada");
    }

    // Obtener usuario para auditoría
    const user = get().users.find((u) => u.id === id);
    const userName = user?.fullName || user?.email || id;

    // Regla 2: Actualizar todas las rutas a /api/${orgId}/recurso
    const url = buildApiRoute(null, "users", id);
    if (!url) {
      throw new Error("URL de eliminación inválida");
    }

    try {
      await apiClient.delete(url);
      
      // Registrar en auditoría
      await logDelete("users", "User", id, `Se eliminó el usuario ${userName}`);
      
      await get().fetchUsers();
    } catch (error: any) {
      console.error("🔴 [usersStore] Error al eliminar usuario:", error);
      throw error;
    }
  },

  async changeUserRole(id, roleId) {
    if (!id) {
      console.warn("❗ [usersStore] id no está definido");
      throw new Error("ID de usuario no está definido");
    }

    // roleId puede ser vacío para quitar el rol
    // Regla 1: Nunca llamar un endpoint sin organizationId
    const authState = useAuthStore.getState();
    const orgId = authState.user?.organizationId;
    
    if (!orgId) {
      console.warn("❗Error: organizationId undefined en usersStore");
      throw new Error("No hay organización seleccionada");
    }

    // Obtener usuario actual para auditoría
    const user = get().users.find((u) => u.id === id);
    const beforeRoleId = user?.roleId || null;

    try {
      await get().updateUser(id, { roleId: roleId || undefined });
      
      // Registrar cambio de rol específicamente en auditoría
      const roleChange = roleId 
        ? `Se cambió el rol del usuario ${user?.fullName || id} de ${beforeRoleId || "sin rol"} a ${roleId}`
        : `Se removió el rol del usuario ${user?.fullName || id}`;
      
      await logUpdate("users", "User", id, { roleId: beforeRoleId || undefined }, { roleId: roleId || undefined }, roleChange);
    } catch (error: any) {
      console.error("🔴 [usersStore] Error al cambiar rol:", error);
      throw error;
    }
  },

  async deactivateUser(id) {
    if (!id) {
      console.warn("❗ [usersStore] id no está definido");
      throw new Error("ID de usuario no está definido");
    }

    const user = get().users.find((u) => u.id === id);
    const userName = user?.fullName || user?.email || id;

    try {
      await get().updateUser(id, { isActive: false });
      
      // Registrar en auditoría
      await logUpdate("users", "User", id, { isActive: true }, { isActive: false }, `Se desactivó el usuario ${userName}`);
    } catch (error: any) {
      console.error("🔴 [usersStore] Error al desactivar usuario:", error);
      throw error;
    }
  },

  async activateUser(id) {
    if (!id) {
      console.warn("❗ [usersStore] id no está definido");
      throw new Error("ID de usuario no está definido");
    }

    const user = get().users.find((u) => u.id === id);
    const userName = user?.fullName || user?.email || id;

    try {
      await get().updateUser(id, { isActive: true });
      
      // Registrar en auditoría
      await logUpdate("users", "User", id, { isActive: false }, { isActive: true }, `Se activó el usuario ${userName}`);
    } catch (error: any) {
      console.error("🔴 [usersStore] Error al activar usuario:", error);
      throw error;
    }
  },
}));

