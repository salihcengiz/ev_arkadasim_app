import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Button, Badge } from '../../src/components';
import { userService, listingService, messageService } from '../../src/services';
import { useAuthStore } from '../../src/store/authStore';
import { GENDERS, OCCUPATIONS, MARITAL_STATUS, SEARCH_TYPES, getRoomCountLabel } from '../../src/constants';
import { formatCurrency, getTimeAgo } from '../../src/utils';
import type { User, Listing } from '../../src/types';

export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  
  const [profile, setProfile] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const isOwnProfile = currentUser?.id === id;

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchUserListings();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getProfile(id!);
      
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        Alert.alert('Hata', 'Kullanıcı bulunamadı');
        router.back();
      }
    } catch (err: any) {
      console.log('Profile fetch error:', err);
      Alert.alert('Hata', err.response?.data?.message || 'Profil yüklenirken bir hata oluştu');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserListings = async () => {
    try {
      // Fetch all listings and filter by user
      const response = await listingService.getAll({}, 1, 50);
      if (response.success && response.data) {
        const userListings = response.data.items.filter(l => l.userId === id);
        setListings(userListings);
      }
    } catch (err) {
      console.log('User listings fetch error:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      Alert.alert('Giriş Gerekli', 'Mesaj göndermek için giriş yapmalısınız.', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Giriş Yap', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    try {
      setIsSendingMessage(true);
      // Mesaj göndermeden sohbet başlat/getir
      const response = await messageService.startConversation(id!);
      
      if (response.success && response.data) {
        router.push(`/chat/${response.data.conversationId}`);
      }
    } catch (err: any) {
      console.log('Start conversation error:', err);
      Alert.alert('Hata', err.response?.data?.message || 'Sohbet başlatılırken bir hata oluştu');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const getOccupationText = () => {
    if (!profile?.occupation) return null;
    if (profile.occupation === 'diger' && profile.occupationOther) {
      return profile.occupationOther;
    }
    return OCCUPATIONS[profile.occupation as keyof typeof OCCUPATIONS];
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-secondary-500 mt-2">Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Ionicons name="person-outline" size={48} color="#EF4444" />
        <Text className="text-secondary-500 mt-2">Kullanıcı bulunamadı</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-secondary-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-secondary-900 ml-2">
          {isOwnProfile ? 'Profilim' : 'Kullanıcı Profili'}
        </Text>
        {isOwnProfile && (
          <TouchableOpacity 
            onPress={() => router.push('/settings/edit-profile')}
            className="p-2"
          >
            <Ionicons name="create-outline" size={24} color="#4F46E5" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="items-center px-6 py-6 bg-secondary-50">
          <Avatar
            name={profile.fullName}
            source={profile.profileImage || undefined}
            size="xl"
          />
          <Text className="text-2xl font-bold text-secondary-900 mt-4">
            {profile.fullName}
          </Text>
          
          {/* Basic Info */}
          <View className="flex-row items-center mt-2">
            {profile.age && (
              <View className="flex-row items-center mr-4">
                <Ionicons name="calendar-outline" size={16} color="#64748B" />
                <Text className="text-secondary-500 ml-1">{profile.age} yaşında</Text>
              </View>
            )}
            {profile.gender && (
              <View className="flex-row items-center">
                <Ionicons name="person-outline" size={16} color="#64748B" />
                <Text className="text-secondary-500 ml-1">
                  {GENDERS[profile.gender as keyof typeof GENDERS]}
                </Text>
              </View>
            )}
          </View>

          {/* Member Since */}
          <Text className="text-secondary-400 text-sm mt-2">
            {getTimeAgo(profile.createdAt)} üye oldu
          </Text>
        </View>

        {/* Details */}
        <View className="px-6 py-4">
          {/* About Section */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-secondary-900 mb-3">Hakkında</Text>
            
            <View className="bg-secondary-50 rounded-xl p-4">
              {/* Occupation */}
              {getOccupationText() && (
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center">
                    <Ionicons name="briefcase-outline" size={20} color="#4F46E5" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-secondary-500 text-sm">Meslek</Text>
                    <Text className="text-secondary-900 font-medium">{getOccupationText()}</Text>
                  </View>
                </View>
              )}

              {/* Marital Status */}
              {profile.maritalStatus && (
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center">
                    <Ionicons name="heart-outline" size={20} color="#4F46E5" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-secondary-500 text-sm">Medeni Durum</Text>
                    <Text className="text-secondary-900 font-medium">
                      {MARITAL_STATUS[profile.maritalStatus as keyof typeof MARITAL_STATUS]}
                    </Text>
                  </View>
                </View>
              )}

              {/* Bio */}
              {profile.bio && (
                <View className="mt-2 pt-3 border-t border-secondary-200">
                  <Text className="text-secondary-600 leading-6">{profile.bio}</Text>
                </View>
              )}

              {!getOccupationText() && !profile.maritalStatus && !profile.bio && (
                <Text className="text-secondary-400 text-center py-4">
                  Henüz bilgi eklenmemiş
                </Text>
              )}
            </View>
          </View>

          {/* Listings Section */}
          {listings.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-secondary-900 mb-3">
                İlanları ({listings.length})
              </Text>
              
              {listings.map((listing) => (
                <TouchableOpacity
                  key={listing.id}
                  onPress={() => router.push(`/listing/${listing.id}`)}
                  className="bg-secondary-50 rounded-xl p-4 mb-3"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-secondary-900" numberOfLines={1}>
                        {listing.title}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="location-outline" size={14} color="#64748B" />
                        <Text className="text-secondary-500 text-sm ml-1">
                          {listing.district ? `${listing.district}, ` : ''}{listing.city}
                        </Text>
                      </View>
                    </View>
                    <Badge
                      label={SEARCH_TYPES[listing.searchType as keyof typeof SEARCH_TYPES]?.split(' ')[0] || ''}
                      variant="primary"
                      size="sm"
                    />
                  </View>
                  
                  {/* Price */}
                  <Text className="text-lg font-bold text-primary-600 mt-2">
                    {listing.searchType === 'evime_arkadas' && listing.rentPrice
                      ? formatCurrency(listing.rentPrice)
                      : `${formatCurrency(listing.minBudget || 0)} - ${formatCurrency(listing.maxBudget || 0)}`
                    }
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      {!isOwnProfile && (
        <View className="px-6 py-4 border-t border-secondary-100">
          <Button
            title="Mesaj Gönder"
            onPress={handleSendMessage}
            isLoading={isSendingMessage}
            fullWidth
            leftIcon={<Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
