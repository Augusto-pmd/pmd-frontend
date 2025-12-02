import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_DOCUMENTS } from "@/lib/useSimulation";

export interface Document {
  id: string;
  workId?: string;
  type: string;
  name: string;
  version?: string;
  uploadedAt: string;
  uploadedBy?: string;
  status?: "aprobado" | "en revisión" | "pendiente" | "rechazado";
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DocumentsState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;

  fetchDocuments: (workId?: string) => Promise<void>;
  createDocument: (payload: Partial<Document>) => Promise<void>;
  updateDocument: (id: string, payload: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,

  async fetchDocuments(workId) {
    // Modo simulación: usar datos dummy
    if (SIMULATION_MODE) {
      let filteredDocuments = [...SIMULATED_DOCUMENTS];
      
      if (workId) {
        filteredDocuments = filteredDocuments.filter((doc) => doc.workId === workId);
      }
      
      set({ documents: filteredDocuments as Document[], isLoading: false, error: null });
      return;
    }

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("⚠️ [documentsStore] organizationId vacío. Cancelando fetch.");
      set({ error: "No hay organización seleccionada", isLoading: false });
      return;
    }

    const baseUrl = safeApiUrlWithParams("/", organizationId, "documents");
    if (!baseUrl) {
      console.error("🔴 [documentsStore] URL inválida");
      set({ error: "URL de API inválida", isLoading: false });
      return;
    }

    const url = workId ? `${baseUrl}?workId=${workId}` : baseUrl;

    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get(url);
      set({ documents: data?.data || data || [], isLoading: false });
    } catch (error: any) {
      console.error("🔴 [documentsStore] Error al obtener documentos:", error);
      set({ error: error.message || "Error al cargar documentos", isLoading: false });
    }
  },

  async createDocument(payload) {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("⚠️ [documentsStore] organizationId vacío. Cancelando creación.");
      throw new Error("No hay organización seleccionada");
    }

    const url = safeApiUrlWithParams("/", organizationId, "documents");
    if (!url) {
      throw new Error("URL de API inválida");
    }

    try {
      await apiClient.post(url, payload);
      await get().fetchDocuments();
    } catch (error: any) {
      console.error("🔴 [documentsStore] Error al crear documento:", error);
      throw error;
    }
  },

  async updateDocument(id, payload) {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("⚠️ [documentsStore] organizationId vacío. Cancelando actualización.");
      throw new Error("No hay organización seleccionada");
    }

    if (!id) {
      throw new Error("ID de documento no está definido");
    }

    const url = safeApiUrlWithParams("/", organizationId, "documents", id);
    if (!url) {
      throw new Error("URL de actualización inválida");
    }

    try {
      await apiClient.put(url, payload);
      await get().fetchDocuments();
    } catch (error: any) {
      console.error("🔴 [documentsStore] Error al actualizar documento:", error);
      throw error;
    }
  },

  async deleteDocument(id) {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("⚠️ [documentsStore] organizationId vacío. Cancelando eliminación.");
      throw new Error("No hay organización seleccionada");
    }

    if (!id) {
      throw new Error("ID de documento no está definido");
    }

    const url = safeApiUrlWithParams("/", organizationId, "documents", id);
    if (!url) {
      throw new Error("URL de eliminación inválida");
    }

    try {
      await apiClient.delete(url);
      await get().fetchDocuments();
    } catch (error: any) {
      console.error("🔴 [documentsStore] Error al eliminar documento:", error);
      throw error;
    }
  },
}));

