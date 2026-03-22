import api from './api';
import { Property, PropertyFilter, ApiResponse, PaginatedResponse } from '../types';

const PROPERTY_ENDPOINT = '/properties';

export const propertyService = {
  /**
   * Konutları listele
   */
  getAll: async (
    filter?: PropertyFilter,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Property>>> => {
    const response = await api.get(PROPERTY_ENDPOINT, {
      params: { ...filter, page, limit },
    });
    return response.data;
  },

  /**
   * Konut detayı
   */
  getById: async (id: string): Promise<ApiResponse<Property>> => {
    const response = await api.get(`${PROPERTY_ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * Konut oluştur
   */
  create: async (data: Partial<Property>): Promise<ApiResponse<Property>> => {
    const response = await api.post(PROPERTY_ENDPOINT, data);
    return response.data;
  },

  /**
   * Konut güncelle
   */
  update: async (id: string, data: Partial<Property>): Promise<ApiResponse<Property>> => {
    const response = await api.put(`${PROPERTY_ENDPOINT}/${id}`, data);
    return response.data;
  },

  /**
   * Konut sil
   */
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`${PROPERTY_ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * Kullanıcının konutları
   */
  getMyProperties: async (): Promise<ApiResponse<Property[]>> => {
    const response = await api.get(`${PROPERTY_ENDPOINT}/my`);
    return response.data;
  },

  /**
   * Konut resmi yükle
   */
  uploadImage: async (id: string, formData: FormData): Promise<ApiResponse<{ url: string }>> => {
    const response = await api.post(`${PROPERTY_ENDPOINT}/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
