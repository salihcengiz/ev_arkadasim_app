import api from './api';
import { LoginRequest, RegisterRequest, AuthResponse, ApiResponse, User } from '../types';
import { API_URL } from '../config/api';

const AUTH_ENDPOINT = '/auth';

export const authService = {
  /**
   * Kullanıcı girişi
   */
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    console.log('=== LOGIN İSTEĞİ ===');
    console.log('URL:', `${API_URL}${AUTH_ENDPOINT}/login`);
    console.log('Data:', JSON.stringify(data, null, 2));
    
    try {
      const response = await api.post(`${AUTH_ENDPOINT}/login`, data);
      console.log('Login Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.log('Login Error:', error.message);
      console.log('Error Response:', error.response?.data);
      throw error;
    }
  },

  /**
   * Kullanıcı kaydı
   */
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    console.log('=== KAYIT İSTEĞİ ===');
    console.log('URL:', `${API_URL}${AUTH_ENDPOINT}/register`);
    console.log('Data:', JSON.stringify(data, null, 2));
    
    try {
      const response = await api.post(`${AUTH_ENDPOINT}/register`, data);
      console.log('Register Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.log('Register Error:', error.message);
      console.log('Error Response:', error.response?.data);
      throw error;
    }
  },

  /**
   * Çıkış
   */
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await api.post(`${AUTH_ENDPOINT}/logout`);
    return response.data;
  },

  /**
   * Mevcut kullanıcı bilgisi
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get(`${AUTH_ENDPOINT}/me`);
    return response.data;
  },

  /**
   * Şifre sıfırlama isteği
   */
  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    const response = await api.post(`${AUTH_ENDPOINT}/forgot-password`, { email });
    return response.data;
  },

  /**
   * Şifre sıfırlama
   */
  resetPassword: async (token: string, password: string): Promise<ApiResponse<null>> => {
    const response = await api.post(`${AUTH_ENDPOINT}/reset-password`, { token, password });
    return response.data;
  },

  /**
   * Token yenileme
   */
  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ token: string }>> => {
    const response = await api.post(`${AUTH_ENDPOINT}/refresh`, { refreshToken });
    return response.data;
  },
};
