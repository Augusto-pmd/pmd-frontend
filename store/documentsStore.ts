import { create } from "zustand";
import { apiClient } from "@/lib/api";

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
    // Construir URL con query string de forma segura
    let url = "/work-documents";
    if (workId && workId.trim()) {
      url = `${url}?workId=${encodeURIComponent(workId)}`;
    }

    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get(url);
      set({ documents: data?.data || data || [], isLoading: false });
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [documentsStore] Error al obtener documentos:", error);
      }
      const errorMessage = error instanceof Error ? error.message : "Error al cargar documentos";
      set({ error: errorMessage, isLoading: false });
    }
  },

  async createDocument(payload) {
    if (!payload) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [documentsStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
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
        const response = await apiClient.post("/work-documents", formData);
        await get().fetchDocuments(payload.workId);
        return response;
      } else {
        // Si no hay archivo, enviar JSON normal
        const response = await apiClient.post("/work-documents", payload);
        await get().fetchDocuments(payload.workId);
        return response;
      }
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [documentsStore] Error al crear documento:", error);
      }
      throw error;
    }
  },

  async updateDocument(id, payload) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [documentsStore] id no está definido");
      }
      throw new Error("ID de documento no está definido");
    }

    if (!payload) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [documentsStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
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

        await apiClient.put(`/work-documents/${id}`, formData);
      } else {
        // Si no hay archivo, enviar JSON normal
        await apiClient.put(`/work-documents/${id}`, payload);
      }
      
      // Refrescar lista (con workId si está disponible)
      await get().fetchDocuments(payload.workId);
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [documentsStore] Error al actualizar documento:", error);
      }
      throw error;
    }
  },

  async deleteDocument(id) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [documentsStore] id no está definido");
      }
      throw new Error("ID de documento no está definido");
    }

    try {
      // Obtener workId del documento antes de eliminarlo para refrescar correctamente
      const document = get().documents.find((d) => d.id === id);
      const workId = document?.workId;

      await apiClient.delete(`/work-documents/${id}`);
      await get().fetchDocuments(workId);
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [documentsStore] Error al eliminar documento:", error);
      }
      throw error;
    }
  },
}));

