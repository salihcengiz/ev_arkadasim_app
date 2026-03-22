import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
import { listingService, messageService } from '../../src/services';
import { USER_TYPES, OCCUPATIONS, MARITAL_STATUS, GENDERS } from '../../src/constants';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState({ listings: 0, favorites: 0, messages: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      // Kullanıcının ilanlarını say
      const listingsResponse = await listingService.getMyListings();
      const listingsCount = listingsResponse.success && listingsResponse.data 
        ? listingsResponse.data.length 
        : 0;

      // Okunmamış mesaj sayısı
      const messagesResponse = await messageService.getUnreadCount();
      const messagesCount = messagesResponse.success && messagesResponse.data 
        ? messagesResponse.data.count 
        : 0;

      setStats({
        listings: listingsCount,
        favorites: 0, // TODO: Favorileri implement et
        messages: messagesCount,
      });
    } catch (err) {
      console.log('Stats fetch error:', err);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchStats();
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Profili Düzenle',
      onPress: () => router.push('/settings/edit-profile'),
    },
    {
      icon: 'home-outline',
      title: 'İlanlarım',
      onPress: () => router.push('/my-listings'),
    },
    {
      icon: 'heart-outline',
      title: 'Favorilerim',
      onPress: () => router.push('/favorites'),
    },
    {
      icon: 'settings-outline',
      title: 'Ayarlar',
      onPress: () => router.push('/settings'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Yardım & Destek',
      onPress: () => Alert.alert('Yardım', 'Yardım sayfası yakında eklenecek.'),
    },
    {
      icon: 'information-circle-outline',
      title: 'Hakkında',
      onPress: () => Alert.alert('Ev Arkadaşım', 'Versiyon 1.0.0\n\nEv arkadaşı bulmak hiç bu kadar kolay olmamıştı!'),
    },
  ];

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-secondary-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="person-outline" size={40} color="#94A3B8" />
          </View>
          <Text className="text-xl font-semibold text-secondary-800 mb-2">
            Giriş Yapın
          </Text>
          <Text className="text-secondary-500 text-center mb-6">
            Profilinizi görüntülemek ve ilanları yönetmek için giriş yapın.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="bg-primary-600 px-8 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary-50" edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View className="bg-white px-6 pt-4 pb-6">
          <Text className="text-2xl font-bold text-secondary-900 mb-6">Profil</Text>
          
          <View className="items-center">
            <Avatar
              name={user?.fullName}
              source={user?.profileImage || undefined}
              size="xl"
            />
            <Text className="text-xl font-bold text-secondary-900 mt-4">
              {user?.fullName}
            </Text>
            <Text className="text-secondary-500">{user?.email}</Text>
            
            {/* User Tags */}
            <View className="flex-row flex-wrap justify-center mt-4">
              {user?.userType && (
                <View className="bg-primary-100 px-3 py-1 rounded-full mr-2 mb-2">
                  <Text className="text-primary-700 text-sm font-medium">
                    {USER_TYPES[user.userType as keyof typeof USER_TYPES]}
                  </Text>
                </View>
              )}
              {user?.occupation && (
                <View className="bg-secondary-100 px-3 py-1 rounded-full mr-2 mb-2">
                  <Text className="text-secondary-700 text-sm font-medium">
                    {user.occupation === 'diger' && user.occupationOther 
                      ? user.occupationOther 
                      : OCCUPATIONS[user.occupation as keyof typeof OCCUPATIONS]}
                  </Text>
                </View>
              )}
              {user?.gender && (
                <View className="bg-secondary-100 px-3 py-1 rounded-full mr-2 mb-2">
                  <Text className="text-secondary-700 text-sm font-medium">
                    {GENDERS[user.gender as keyof typeof GENDERS]}
                  </Text>
                </View>
              )}
              {user?.age && (
                <View className="bg-secondary-100 px-3 py-1 rounded-full mr-2 mb-2">
                  <Text className="text-secondary-700 text-sm font-medium">
                    {user.age} yaş
                  </Text>
                </View>
              )}
            </View>

            {/* Additional Info */}
            <View className="flex-row items-center mt-2">
              {user?.phone && (
                <View className="flex-row items-center mr-4">
                  <Ionicons name="call-outline" size={14} color="#64748B" />
                  <Text className="text-secondary-500 text-sm ml-1">{user.phone}</Text>
                </View>
              )}
              {user?.maritalStatus && (
                <View className="flex-row items-center">
                  <Ionicons name="heart-outline" size={14} color="#64748B" />
                  <Text className="text-secondary-500 text-sm ml-1">
                    {MARITAL_STATUS[user.maritalStatus as keyof typeof MARITAL_STATUS]}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row px-6 py-4 bg-white mt-2">
          <TouchableOpacity 
            className="flex-1 items-center"
            onPress={() => router.push('/my-listings')}
          >
            <Text className="text-2xl font-bold text-secondary-900">{stats.listings}</Text>
            <Text className="text-secondary-500 text-sm">İlanlarım</Text>
          </TouchableOpacity>
          <View className="w-px bg-secondary-200" />
          <TouchableOpacity 
            className="flex-1 items-center"
            onPress={() => router.push('/favorites')}
          >
            <Text className="text-2xl font-bold text-secondary-900">{stats.favorites}</Text>
            <Text className="text-secondary-500 text-sm">Favorilerim</Text>
          </TouchableOpacity>
          <View className="w-px bg-secondary-200" />
          <TouchableOpacity 
            className="flex-1 items-center"
            onPress={() => router.push('/(tabs)/messages')}
          >
            <Text className="text-2xl font-bold text-secondary-900">{stats.messages}</Text>
            <Text className="text-secondary-500 text-sm">Okunmamış</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View className="mt-4 bg-white">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              onPress={item.onPress}
              className={`flex-row items-center px-6 py-4 ${
                index !== menuItems.length - 1 ? 'border-b border-secondary-100' : ''
              }`}
            >
              <View className="w-10 h-10 bg-secondary-100 rounded-full items-center justify-center mr-4">
                <Ionicons name={item.icon as any} size={20} color="#64748B" />
              </View>
              <Text className="flex-1 text-secondary-800 font-medium">
                {item.title}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center px-6 py-4 mt-4 bg-white"
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="text-red-500 font-medium ml-2">Çıkış Yap</Text>
        </TouchableOpacity>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
