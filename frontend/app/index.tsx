import { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { Button } from '../src/components';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)/home');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-primary-600">
        <Text className="text-white text-2xl font-bold">Ev Arkadaşım</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header Section */}
      <View className="flex-1 items-center justify-center bg-primary-600 px-8">
        <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-6">
          <Text className="text-4xl">🏠</Text>
        </View>
        <Text className="text-white text-3xl font-bold text-center mb-2">
          Ev Arkadaşım
        </Text>
        <Text className="text-primary-100 text-center text-lg">
          Kiranı paylaş, hayatını kolaylaştır
        </Text>
      </View>

      {/* Features Section */}
      <View className="px-8 py-8">
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-4">
            <Text className="text-xl">🏡</Text>
          </View>
          <View className="flex-1">
            <Text className="text-secondary-800 font-semibold">Evime Arkadaş Arıyorum</Text>
            <Text className="text-secondary-500 text-sm">Evinize yeni kiracılar bulun</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-4">
            <Text className="text-xl">🔍</Text>
          </View>
          <View className="flex-1">
            <Text className="text-secondary-800 font-semibold">Kalacak Ev Arıyorum</Text>
            <Text className="text-secondary-500 text-sm">Size uygun evleri keşfedin</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-6">
          <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-4">
            <Text className="text-xl">🤝</Text>
          </View>
          <View className="flex-1">
            <Text className="text-secondary-800 font-semibold">Beraber Ev Arayalım</Text>
            <Text className="text-secondary-500 text-sm">Benzer özelliklerde ev arayanları bulun</Text>
          </View>
        </View>

        <Button
          title="Giriş Yap"
          onPress={() => router.push('/(auth)/login')}
          fullWidth
          className="mb-3"
        />
        
        <Button
          title="Kayıt Ol"
          variant="outline"
          onPress={() => router.push('/(auth)/register')}
          fullWidth
        />
      </View>
    </View>
  );
}
