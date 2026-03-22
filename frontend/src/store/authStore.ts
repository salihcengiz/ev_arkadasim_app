import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../services';
import { STORAGE_KEYS } from '../constants';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  login: (data: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  login: async (data: LoginRequest) => {
    console.log('=== AUTH STORE LOGIN ===');
    console.log('Login data:', data);
    set({ isLoading: true, error: null });
    
    try {
      console.log('Calling authService.login...');
      const response = await authService.login(data);
      console.log('authService.login response:', response);
      
      if (response.success && response.data) {
        const { user, token, refreshToken } = response.data;
        
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        console.log('Login successful!');
        return true;
      }
      console.log('Login failed - response not successful');
      set({ error: response.message || 'Giriş başarısız', isLoading: false });
      return false;
    } catch (error: any) {
      console.log('=== LOGIN ERROR ===');
      console.log('Error type:', typeof error);
      console.log('Error message:', error.message);
      console.log('Error response:', error.response);
      console.log('Error request:', error.request ? 'Request exists' : 'No request');
      
      let errorMessage = 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 'Girilen e-posta veya şifre hatalı';
      } else if (error.request) {
        errorMessage = 'Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.';
      } else {
        errorMessage = error.message || 'Bir hata oluştu';
      }
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      return false;
    }
  },

  register: async (data: RegisterRequest) => {
    console.log('=== AUTH STORE REGISTER ===');
    console.log('Register data:', JSON.stringify(data, null, 2));
    set({ isLoading: true, error: null });
    
    try {
      console.log('Calling authService.register...');
      const response = await authService.register(data);
      console.log('authService.register response:', response);
      
      if (response.success && response.data) {
        const { user, token, refreshToken } = response.data;
        
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        console.log('Register successful!');
        return true;
      }
      console.log('Register failed - response not successful');
      set({ error: response.message || 'Kayıt başarısız', isLoading: false });
      return false;
    } catch (error: any) {
      console.log('=== REGISTER ERROR ===');
      console.log('Error type:', typeof error);
      console.log('Error message:', error.message);
      console.log('Error response:', error.response);
      console.log('Error request:', error.request ? 'Request exists' : 'No request');
      
      let errorMessage = 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 'Kayıt işlemi başarısız oldu';
      } else if (error.request) {
        errorMessage = 'Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.';
      } else {
        errorMessage = error.message || 'Bir hata oluştu';
      }
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore logout API errors
    }
    
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  
  setUser: (user: User) => set({ user }),
}));
