import api from './api';
import { User, UserTraits, ApiResponse } from '../types';

const USER_ENDPOINT = '/users';

export const userService = {
  /**
   * Kullanıcı profili getir
   */
  getProfile: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`${USER_ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * Profil güncelle
   */
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put(`${USER_ENDPOINT}/profile`, data);
    return response.data;
  },

  /**
   * Profil resmi güncelle
   */
  updateProfileImage: async (formData: FormData): Promise<ApiResponse<{ url: string }>> => {
    const response = await api.post(`${USER_ENDPOINT}/profile/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Kullanıcı özelliklerini getir
   */
  getTraits: async (userId: string): Promise<ApiResponse<UserTraits>> => {
    const response = await api.get(`${USER_ENDPOINT}/${userId}/traits`);
    return response.data;
  },

  /**
   * Kullanıcı özelliklerini güncelle
   */
  updateTraits: async (data: Partial<UserTraits>): Promise<ApiResponse<UserTraits>> => {
    const response = await api.put(`${USER_ENDPOINT}/traits`, data);
    return response.data;
  },

  /**
   * Şifre değiştir
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    const response = await api.put(`${USER_ENDPOINT}/password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  /**
   * Hesabı sil
   */
  deleteAccount: async (): Promise<ApiResponse<null>> => {
    const response = await api.delete(`${USER_ENDPOINT}/account`);
    return response.data;
  },
};
