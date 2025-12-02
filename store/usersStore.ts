import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_USERS } from "@/lib/useSimulation";

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
}

interface UsersState {
  users: UserPMD[];
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  createUser: (payload: Partial<UserPMD> & { password?: string }) => Promise<void>;
  updateUser: (id: string, payload: Partial<UserPMD> & { password?: string }) => Promise<void>;
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
    // Modo simulación: usar datos dummy
    if (SIMULATION_MODE) {
      set({ users: SIMULATED_USERS as UserPMD[], isLoading: false, error: null });
      return;
    }

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [usersStore] organizationId no está definido");
      set({ error: "No hay organización seleccionada", isLoading: false });
      return;
    }

    const url = safeApiUrlWithParams("/", organizationId, "users");
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

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [usersStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    // En modo simulación, solo actualizar el estado local
    if (SIMULATION_MODE) {
      const newUser: UserPMD = {
        id: `usr-${Date.now()}`,
        email: payload.email || "",
        fullName: payload.fullName || "",
        roleId: payload.roleId,
        isActive: payload.isActive !== false,
        createdAt: new Date().toISOString(),
        notes: payload.notes,
      };
      set((state) => ({
        users: [newUser, ...state.users],
      }));
      return;
    }

    const url = safeApiUrlWithParams("/", organizationId, "users");
    if (!url) {
      throw new Error("URL de API inválida");
    }

    try {
      await apiClient.post(url, payload);
      await get().fetchUsers();
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

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [usersStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    // En modo simulación, solo actualizar el estado local
    if (SIMULATION_MODE) {
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, ...payload, updatedAt: new Date().toISOString() } : user
        ),
      }));
      return;
    }

    const url = safeApiUrlWithParams("/", organizationId, "users", id);
    if (!url) {
      throw new Error("URL de actualización inválida");
    }

    try {
      await apiClient.put(url, payload);
      await get().fetchUsers();
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

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [usersStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    // En modo simulación, solo actualizar el estado local
    if (SIMULATION_MODE) {
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
      }));
      return;
    }

    const url = safeApiUrlWithParams("/", organizationId, "users", id);
    if (!url) {
      throw new Error("URL de eliminación inválida");
    }

    try {
      await apiClient.delete(url);
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

    if (!roleId) {
      console.warn("❗ [usersStore] roleId no está definido");
      throw new Error("ID de rol no está definido");
    }

    await get().updateUser(id, { roleId });
  },

  async deactivateUser(id) {
    if (!id) {
      console.warn("❗ [usersStore] id no está definido");
      throw new Error("ID de usuario no está definido");
    }

    await get().updateUser(id, { isActive: false });
  },

  async activateUser(id) {
    if (!id) {
      console.warn("❗ [usersStore] id no está definido");
      throw new Error("ID de usuario no está definido");
    }

    await get().updateUser(id, { isActive: true });
  },
}));

