import api from "./api";

// Generic API client functions for CRUD operations
export const apiClient = {
  // GET - List all
  getAll: async <T>(endpoint: string): Promise<T[]> => {
    console.log('🔍 [apiClient.getAll] endpoint:', endpoint);
    const response = await api.get<T[]>(endpoint);
    return response.data;
  },

  // GET - Get by ID
  getById: async <T>(endpoint: string, id: string | number): Promise<T> => {
    const fullUrl = `${endpoint}/${id}`;
    console.log('🔍 [apiClient.getById] endpoint:', endpoint, 'id:', id, 'fullUrl:', fullUrl);
    const response = await api.get<T>(fullUrl);
    return response.data;
  },

  // POST - Create
  create: async <T>(endpoint: string, data: any): Promise<T> => {
    console.log('🔍 [apiClient.create] endpoint:', endpoint);
    const response = await api.post<T>(endpoint, data);
    return response.data;
  },

  // PUT - Update
  update: async <T>(endpoint: string, id: string | number, data: any): Promise<T> => {
    const fullUrl = `${endpoint}/${id}`;
    console.log('🔍 [apiClient.update] endpoint:', endpoint, 'id:', id, 'fullUrl:', fullUrl);
    const response = await api.put<T>(fullUrl, data);
    return response.data;
  },

  // DELETE - Delete
  delete: async (endpoint: string, id: string | number): Promise<void> => {
    const fullUrl = `${endpoint}/${id}`;
    console.log('🔍 [apiClient.delete] endpoint:', endpoint, 'id:', id, 'fullUrl:', fullUrl);
    await api.delete(fullUrl);
  },

  // PATCH - Partial update
  patch: async <T>(endpoint: string, id: string | number, data: any): Promise<T> => {
    const fullUrl = `${endpoint}/${id}`;
    console.log('🔍 [apiClient.patch] endpoint:', endpoint, 'id:', id, 'fullUrl:', fullUrl);
    const response = await api.patch<T>(fullUrl, data);
    return response.data;
  },
};

