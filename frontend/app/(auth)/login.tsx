import { useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta adresi gerekli')
    .email('Geçerli bir e-posta adresi girin'),
  password: z
    .string()
    .min(1, 'Şifre gerekli')
    .min(6, 'Şifre en az 6 karakter olmalı'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  // Ekrana girince hata mesajını temizle
  useEffect(() => {
    clearError();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    const success = await login(data);
    if (success) {
      router.replace('/(tabs)/home');
    }
  };

  const handleNavigateToRegister = () => {
    clearError();
    router.push('/(auth)/register');
  };

  const handleGoBack = () => {
    clearError();
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="px-6 pt-4">
            <TouchableOpacity
              onPress={handleGoBack}
              className="w-10 h-10 rounded-full bg-secondary-100 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="#334155" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="flex-1 px-6 pt-8">
            <Text className="text-3xl font-bold text-secondary-900 mb-2">
              Hoş Geldiniz
            </Text>
            <Text className="text-secondary-500 text-base mb-8">
              Hesabınıza giriş yapın
            </Text>

            {error && (
              <View className="bg-red-50 border border-red-400 rounded-xl p-4 mb-6">
                <Text className="text-red-600">{error}</Text>
              </View>
            )}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="E-posta"
                  placeholder="ornek@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  leftIcon="mail-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Şifre"
                  placeholder="••••••••"
                  isPassword
                  leftIcon="lock-closed-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              className="self-end mb-6"
            >
              <Text className="text-primary-600 font-medium">
                Şifremi Unuttum
              </Text>
            </TouchableOpacity>

            <Button
              title="Giriş Yap"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              fullWidth
            />

            <View className="flex-row justify-center mt-6">
              <Text className="text-secondary-500">Hesabınız yok mu? </Text>
              <TouchableOpacity onPress={handleNavigateToRegister}>
                <Text className="text-primary-600 font-semibold">Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
