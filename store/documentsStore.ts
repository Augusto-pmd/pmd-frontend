import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";

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
  fileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DocumentPayload extends Partial<Document> {
  file?: File;
  notes?: string;
}

interface DocumentsState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;

  fetchDocuments: (workId?: string) => Promise<void>;
  createDocument: (payload: DocumentPayload) => Promise<void>;
  updateDocument: (id: string, payload: DocumentPayload) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,

  async fetchDocuments(workId) {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [documentsStore] organizationId no está definido");
      set({ error: "No hay organización seleccionada", isLoading: false });
      return;
    }

    const baseUrl = safeApiUrlWithParams("/", organizationId, "documents");
    if (!baseUrl) {
      console.error("🔴 [documentsStore] URL inválida");
      set({ error: "URL de API inválida", isLoading: false });
      return;
    }

    // Construir URL con query string de forma segura
    let url = baseUrl;
    if (workId && workId.trim()) {
      url = `${baseUrl}?workId=${encodeURIComponent(workId)}`;
    }

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
    if (!payload) {
      console.warn("❗ [documentsStore] payload no está definido");
      throw new Error("Payload no está definido");
    }

    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [documentsStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    // Validar campos obligatorios
    if (!payload.name || payload.name.trim() === "") {
      throw new Error("El nombre del documento es obligatorio");
    }
    if (!payload.type || payload.type.trim() === "") {
      throw new Error("El tipo de documento es obligatorio");
    }
    if (!payload.workId || payload.workId.trim() === "") {
      throw new Error("La obra es obligatoria");
    }

    const url = safeApiUrlWithParams("/", organizationId, "documents");
    if (!url) {
      throw new Error("URL de API inválida");
    }

    try {
      // Si hay un archivo, usar FormData para multipart/form-data
      if (payload.file && payload.file instanceof File) {
        const formData = new FormData();
        formData.append("file", payload.file);
        formData.append("name", payload.name);
        formData.append("type", payload.type);
        formData.append("workId", payload.workId);
        if (payload.version) formData.append("version", payload.version);
        if (payload.status) formData.append("status", payload.status);
        if (payload.uploadedBy) formData.append("uploadedBy", payload.uploadedBy);
        if (payload.notes) formData.append("notes", payload.notes);

        // Usar apiClient.post con FormData (axios maneja multipart automáticamente)
        const response = await apiClient.post(url, formData);
        await get().fetchDocuments(payload.workId);
        return response;
      } else {
        // Si no hay archivo, enviar JSON normal
        const response = await apiClient.post(url, payload);
        await get().fetchDocuments(payload.workId);
        return response;
      }
    } catch (error: any) {
      console.error("🔴 [documentsStore] Error al crear documento:", error);
      throw error;
    }
  },

  async updateDocument(id, payload) {
    if (!id) {
      console.warn("❗ [documentsStore] id no está definido");
      throw new Error("ID de documento no está definido");
    }

    if (!payload) {
      console.warn("❗ [documentsStore] payload no está definido");
      throw new Error("Payload no está definido");
    }

    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [documentsStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    const url = safeApiUrlWithParams("/", organizationId, "documents", id);
    if (!url) {
      throw new Error("URL de actualización inválida");
    }

    try {
      // Si hay un archivo nuevo, usar FormData
      if (payload.file && payload.file instanceof File) {
        const formData = new FormData();
        if (payload.name) formData.append("name", payload.name);
        if (payload.type) formData.append("type", payload.type);
        if (payload.workId) formData.append("workId", payload.workId);
        if (payload.version) formData.append("version", payload.version);
        if (payload.status) formData.append("status", payload.status);
        if (payload.uploadedBy) formData.append("uploadedBy", payload.uploadedBy);
        if (payload.notes) formData.append("notes", payload.notes);
        formData.append("file", payload.file);

        await apiClient.put(url, formData);
      } else {
        // Si no hay archivo, enviar JSON normal
        await apiClient.put(url, payload);
      }
      
      // Refrescar lista (con workId si está disponible)
      await get().fetchDocuments(payload.workId);
    } catch (error: any) {
      console.error("🔴 [documentsStore] Error al actualizar documento:", error);
      throw error;
    }
  },

  async deleteDocument(id) {
    if (!id) {
      console.warn("❗ [documentsStore] id no está definido");
      throw new Error("ID de documento no está definido");
    }

    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [documentsStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    const url = safeApiUrlWithParams("/", organizationId, "documents", id);
    if (!url) {
      throw new Error("URL de eliminación inválida");
    }

    try {
      // Obtener workId del documento antes de eliminarlo para refrescar correctamente
      const document = get().documents.find((d) => d.id === id);
      const workId = document?.workId;

      await apiClient.delete(url);
      await get().fetchDocuments(workId);
    } catch (error: any) {
      console.error("🔴 [documentsStore] Error al eliminar documento:", error);
      throw error;
    }
  },
}));

