import api from './api';
import { Listing, ListingFilter, ApiResponse, PaginatedResponse } from '../types';

const LISTING_ENDPOINT = '/listings';

export const listingService = {
  /**
   * İlanları listele
   */
  getAll: async (
    filter?: ListingFilter,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Listing>>> => {
    const response = await api.get(LISTING_ENDPOINT, {
      params: { ...filter, page, limit },
    });
    return response.data;
  },

  /**
   * İlan detayı
   */
  getById: async (id: string): Promise<ApiResponse<Listing>> => {
    const response = await api.get(`${LISTING_ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * İlan oluştur
   */
  create: async (data: Partial<Listing>): Promise<ApiResponse<Listing>> => {
    const response = await api.post(LISTING_ENDPOINT, data);
    return response.data;
  },

  /**
   * İlan güncelle
   */
  update: async (id: string, data: Partial<Listing>): Promise<ApiResponse<Listing>> => {
    const response = await api.put(`${LISTING_ENDPOINT}/${id}`, data);
    return response.data;
  },

  /**
   * İlan sil
   */
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`${LISTING_ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * Kullanıcının ilanları
   */
  getMyListings: async (): Promise<ApiResponse<Listing[]>> => {
    const response = await api.get(`${LISTING_ENDPOINT}/my`);
    return response.data;
  },
};
