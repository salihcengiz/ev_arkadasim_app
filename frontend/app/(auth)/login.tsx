import { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '../../src/components';
import { AuthHero } from '../../src/components/auth';
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

  useEffect(() => {
    clearError();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    const success = await login(data);
    if (success) router.replace('/(tabs)/home');
  };

  return (
    <View className="flex-1 bg-brand-surface">
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
          <AuthHero
            image={require('../../assets/two-friends.png')}
            title="Ev Arkadaşım"
            onBack={() => router.back()}
          />

          <View className="flex-1 px-6 pt-8 pb-10">
            <Text className="text-brand-dark text-3xl font-bold tracking-tight">
              Tekrar Hoş Geldin
            </Text>
            <Text className="text-brand-muted text-base mt-2 mb-8">
              Hayalindeki ev arkadaşını bulmak için giriş yap.
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
                  placeholder="E-posta adresiniz"
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
              className="self-end mb-8"
            >
              <Text className="text-primary-600 font-semibold text-sm">
                Şifremi Unuttum
              </Text>
            </TouchableOpacity>

            <Button
              title="Giriş Yap"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              fullWidth
            />

            <View className="flex-row justify-center mt-8">
              <Text className="text-secondary-500 font-medium">Hesabın yok mu? </Text>
              <TouchableOpacity
                onPress={() => {
                  clearError();
                  router.push('/(auth)/register');
                }}
              >
                <Text className="text-primary-600 font-bold">Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
