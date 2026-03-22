import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const {
    user,
    token,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    loadUser,
    clearError,
    setUser,
  } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    clearError,
    setUser,
  };
};
