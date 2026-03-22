import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, EmptyState, Button } from '../src/components';
import { listingService } from '../src/services';
import { useAuthStore } from '../src/store/authStore';
import { SEARCH_TYPES, getRoomCountLabel } from '../src/constants';
import { formatCurrency, getTimeAgo } from '../src/utils';
import { API_URL } from '../src/config/api';
import type { Listing } from '../src/types';

// Helper to get full image URL
const getImageUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${path}`;
};

// Helper to get price display based on listing type
const getPriceDisplay = (listing: Listing) => {
  if (listing.searchType === 'evime_arkadas' && listing.rentPrice) {
    return formatCurrency(listing.rentPrice);
  }
  if (listing.minBudget !== undefined && listing.maxBudget !== undefined) {
    return `${formatCurrency(listing.minBudget)} - ${formatCurrency(listing.maxBudget)}`;
  }
  return 'Fiyat belirtilmemiş';
};

export default function MyListingsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchListings = useCallback(async (showRefresh = false) => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await listingService.getMyListings();
      
      if (response.success && response.data) {
        setListings(response.data);
      } else {
        setListings([]);
      }
    } catch (err) {
      console.log('My listings fetch error:', err);
      setListings([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      fetchListings();
    }, [fetchListings])
  );

  const onRefresh = () => {
    fetchListings(true);
  };

  const handleDelete = (listingId: string) => {
    Alert.alert(
      'İlanı Sil',
      'Bu ilanı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await listingService.delete(listingId);
              if (response.success) {
                setListings(prev => prev.filter(l => l.id !== listingId));
                Alert.alert('Başarılı', 'İlan silindi');
              }
            } catch (err: any) {
              Alert.alert('Hata', err.response?.data?.message || 'İlan silinirken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  const renderListingItem = ({ item }: { item: Listing }) => (
    <Card className="mb-4">
      <TouchableOpacity onPress={() => router.push(`/listing/${item.id}`)}>
        {/* Image - only for evime_arkadas */}
        {item.searchType === 'evime_arkadas' && (
          item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: getImageUrl(item.images[0]) }}
              className="h-32 w-full rounded-xl mb-3"
              resizeMode="cover"
            />
          ) : (
            <View className="h-32 bg-secondary-200 rounded-xl mb-3 items-center justify-center">
              <Ionicons name="image-outline" size={32} color="#94A3B8" />
            </View>
          )
        )}

        {/* Header */}
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-secondary-900" numberOfLines={1}>
              {item.title}
            </Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={14} color="#64748B" />
              <Text className="text-secondary-500 text-sm ml-1" numberOfLines={1}>
                {item.neighborhood ? `${item.neighborhood}, ` : ''}
                {item.district ? `${item.district}, ` : ''}{item.city}
              </Text>
            </View>
          </View>
          <Badge
            label={item.isActive ? 'Aktif' : 'Pasif'}
            variant={item.isActive ? 'success' : 'secondary'}
            size="sm"
          />
        </View>

        {/* Details */}
        {(item.roomCount || item.squareMeters || item.furnished !== undefined) && (
          <View className="flex-row flex-wrap mb-2">
            {item.roomCount && (
              <View className="flex-row items-center mr-3">
                <Ionicons name="bed-outline" size={14} color="#64748B" />
                <Text className="text-secondary-500 text-sm ml-1">{getRoomCountLabel(item.roomCount)}</Text>
              </View>
            )}
            {item.squareMeters && (
              <View className="flex-row items-center mr-3">
                <Ionicons name="resize-outline" size={14} color="#64748B" />
                <Text className="text-secondary-500 text-sm ml-1">{item.squareMeters} m²</Text>
              </View>
            )}
            {item.furnished !== undefined && item.furnished !== null && (
              <View className="flex-row items-center">
                <Ionicons name="cube-outline" size={14} color="#64748B" />
                <Text className="text-secondary-500 text-sm ml-1">
                  {item.furnished ? 'Eşyalı' : 'Eşyasız'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Price */}
        <Text className="text-xl font-bold text-primary-600 mb-2">
          {getPriceDisplay(item)}
        </Text>

        {/* Meta */}
        <View className="flex-row items-center mb-3">
          <Badge
            label={SEARCH_TYPES[item.searchType as keyof typeof SEARCH_TYPES] || item.searchType}
            variant="primary"
            size="sm"
          />
          <Text className="text-secondary-400 text-sm ml-auto">
            {getTimeAgo(item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Actions */}
      <View className="flex-row border-t border-secondary-100 pt-3 mt-1">
        <TouchableOpacity 
          className="flex-1 flex-row items-center justify-center py-2"
          onPress={() => router.push(`/listing/${item.id}/edit`)}
        >
          <Ionicons name="create-outline" size={18} color="#4F46E5" />
          <Text className="text-primary-600 font-medium ml-2">Düzenle</Text>
        </TouchableOpacity>
        <View className="w-px bg-secondary-100" />
        <TouchableOpacity 
          className="flex-1 flex-row items-center justify-center py-2"
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text className="text-red-500 font-medium ml-2">Sil</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-secondary-50">
        <View className="flex-row items-center px-4 py-3 bg-white border-b border-secondary-100">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#334155" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-secondary-900 ml-2">İlanlarım</Text>
        </View>
        <EmptyState
          icon="log-in-outline"
          title="Giriş Yapın"
          description="İlanlarınızı görmek için giriş yapmalısınız."
          actionLabel="Giriş Yap"
          onAction={() => router.push('/(auth)/login')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-secondary-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-secondary-900 ml-2">İlanlarım</Text>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/create')}
          className="p-2"
        >
          <Ionicons name="add" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="text-secondary-500 mt-2">Yükleniyor...</Text>
        </View>
      ) : listings.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="Henüz İlan Yok"
          description="İlk ilanınızı oluşturun ve ev arkadaşı bulmaya başlayın!"
          actionLabel="İlan Oluştur"
          onAction={() => router.push('/(tabs)/create')}
        />
      ) : (
        <FlatList
          data={listings}
          renderItem={renderListingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <Text className="text-secondary-500 mb-4">{listings.length} ilan</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
