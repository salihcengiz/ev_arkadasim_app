import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, EmptyState } from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
import { listingService } from '../../src/services';
import { SEARCH_TYPES, getRoomCountLabel } from '../../src/constants';
import { formatCurrency } from '../../src/utils';
import { API_URL } from '../../src/config/api';
import type { Listing } from '../../src/types';

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

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Tümü', icon: 'apps-outline' },
    { id: 'evime_arkadas', label: 'Evime Arkadaş', icon: 'home-outline' },
    { id: 'kalacak_ev', label: 'Kalacak Ev', icon: 'search-outline' },
    { id: 'beraber_ev', label: 'Beraber Ev', icon: 'people-outline' },
  ];

  const fetchListings = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const filter = selectedCategory !== 'all' 
        ? { searchType: selectedCategory as any } 
        : undefined;

      const response = await listingService.getAll(filter, 1, 10);
      
      if (response.success && response.data) {
        setListings(response.data.items || []);
      } else {
        setListings([]);
      }
    } catch (err: any) {
      console.log('Listings fetch error:', err);
      setError('İlanlar yüklenirken bir hata oluştu');
      setListings([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const onRefresh = () => {
    fetchListings(true);
  };

  const renderCategoryItem = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      onPress={() => setSelectedCategory(item.id)}
      className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
        selectedCategory === item.id
          ? 'bg-primary-600'
          : 'bg-secondary-100'
      }`}
    >
      <Ionicons
        name={item.icon as any}
        size={18}
        color={selectedCategory === item.id ? '#FFFFFF' : '#64748B'}
      />
      <Text
        className={`ml-2 font-medium ${
          selectedCategory === item.id ? 'text-white' : 'text-secondary-600'
        }`}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderListingItem = (item: Listing) => (
    <Card
      key={item.id}
      className="mb-4"
      onPress={() => router.push(`/listing/${item.id}`)}
    >
      {/* Image - only for evime_arkadas */}
      {item.searchType === 'evime_arkadas' && (
        item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: getImageUrl(item.images[0]) }}
            className="h-40 w-full rounded-xl mb-3"
            resizeMode="cover"
          />
        ) : (
          <View className="h-40 bg-secondary-200 rounded-xl mb-3 items-center justify-center">
            <Ionicons name="image-outline" size={40} color="#94A3B8" />
          </View>
        )
      )}

      {/* Content */}
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
          label={SEARCH_TYPES[item.searchType as keyof typeof SEARCH_TYPES] || item.searchType}
          variant={item.searchType === 'evime_arkadas' ? 'primary' : 'secondary'}
          size="sm"
        />
      </View>

      {/* Details - room count, m², furnished */}
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
          {item.furnished !== undefined && (
            <View className="flex-row items-center">
              <Ionicons name="cube-outline" size={14} color="#64748B" />
              <Text className="text-secondary-500 text-sm ml-1">
                {item.furnished ? 'Eşyalı' : 'Eşyasız'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Price & User Info */}
      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-xl font-bold text-primary-600">
          {getPriceDisplay(item)}
        </Text>
        {item.user && (
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={14} color="#64748B" />
            <Text className="text-secondary-500 text-sm ml-1">
              {item.user.fullName?.split(' ')[0]}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-secondary-50" edges={['top']}>
      {/* Header */}
      <View className="px-6 pt-4 pb-4 bg-white">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-secondary-500 text-sm">Hoş geldin,</Text>
            <Text className="text-xl font-bold text-secondary-900">
              {user?.fullName || 'Misafir'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/notifications')}
            className="w-10 h-10 bg-secondary-100 rounded-full items-center justify-center"
          >
            <Ionicons name="notifications-outline" size={24} color="#334155" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/search')}
          className="flex-row items-center bg-secondary-100 rounded-xl px-4 py-3"
        >
          <Ionicons name="search-outline" size={20} color="#94A3B8" />
          <Text className="ml-3 text-secondary-400 flex-1">
            Ev veya ev arkadaşı ara...
          </Text>
          <Ionicons name="options-outline" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Categories */}
        <View className="py-4">
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          />
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-4">
          <Text className="text-lg font-semibold text-secondary-900 mb-3">
            Ne Yapmak İstiyorsun?
          </Text>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/create')}
              className="flex-1 bg-primary-50 rounded-xl p-4 mr-2"
            >
              <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="add-circle-outline" size={24} color="#4F46E5" />
              </View>
              <Text className="text-primary-700 font-semibold">İlan Ver</Text>
              <Text className="text-primary-500 text-xs mt-1">
                Ev veya arkadaş ilanı oluştur
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/search')}
              className="flex-1 bg-secondary-100 rounded-xl p-4 ml-2"
            >
              <View className="w-10 h-10 bg-secondary-200 rounded-full items-center justify-center mb-2">
                <Ionicons name="compass-outline" size={24} color="#64748B" />
              </View>
              <Text className="text-secondary-700 font-semibold">Keşfet</Text>
              <Text className="text-secondary-500 text-xs mt-1">
                İlanları incele
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Listings */}
        <View className="px-6 pb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-secondary-900">
              Son İlanlar
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
              <Text className="text-primary-600 font-medium">Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text className="text-secondary-500 mt-2">Yükleniyor...</Text>
            </View>
          ) : error ? (
            <View className="py-10 items-center">
              <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
              <Text className="text-secondary-500 mt-2">{error}</Text>
              <TouchableOpacity 
                onPress={() => fetchListings()} 
                className="mt-4 bg-primary-600 px-4 py-2 rounded-lg"
              >
                <Text className="text-white">Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          ) : listings.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="Henüz ilan yok"
              description="İlk ilanı sen oluştur!"
              actionLabel="İlan Oluştur"
              onAction={() => router.push('/(tabs)/create')}
            />
          ) : selectedCategory === 'all' ? (
            // Tümü seçiliyken ilan tiplerini grupla
            <>
              {/* Evime Arkadaş Arıyorum */}
              {listings.filter(l => l.searchType === 'evime_arkadas').length > 0 && (
                <View className="mb-6">
                  <View className="flex-row items-center mb-3 bg-primary-50 p-3 rounded-xl">
                    <View className="w-8 h-8 bg-primary-100 rounded-full items-center justify-center mr-3">
                      <Ionicons name="home-outline" size={18} color="#4F46E5" />
                    </View>
                    <Text className="text-primary-700 font-semibold flex-1">Evime Arkadaş Arıyorum</Text>
                    <Badge label={`${listings.filter(l => l.searchType === 'evime_arkadas').length}`} variant="primary" size="sm" />
                  </View>
                  {listings.filter(l => l.searchType === 'evime_arkadas').map(item => renderListingItem(item))}
                </View>
              )}

              {/* Kalacak Ev Arıyorum */}
              {listings.filter(l => l.searchType === 'kalacak_ev').length > 0 && (
                <View className="mb-6">
                  <View className="flex-row items-center mb-3 bg-secondary-100 p-3 rounded-xl">
                    <View className="w-8 h-8 bg-secondary-200 rounded-full items-center justify-center mr-3">
                      <Ionicons name="search-outline" size={18} color="#64748B" />
                    </View>
                    <Text className="text-secondary-700 font-semibold flex-1">Kalacak Ev Arıyorum</Text>
                    <Badge label={`${listings.filter(l => l.searchType === 'kalacak_ev').length}`} variant="secondary" size="sm" />
                  </View>
                  {listings.filter(l => l.searchType === 'kalacak_ev').map(item => renderListingItem(item))}
                </View>
              )}

              {/* Beraber Ev Arayalım */}
              {listings.filter(l => l.searchType === 'beraber_ev').length > 0 && (
                <View className="mb-6">
                  <View className="flex-row items-center mb-3 bg-green-50 p-3 rounded-xl">
                    <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                      <Ionicons name="people-outline" size={18} color="#16A34A" />
                    </View>
                    <Text className="text-green-700 font-semibold flex-1">Beraber Ev Arayalım</Text>
                    <Badge label={`${listings.filter(l => l.searchType === 'beraber_ev').length}`} variant="success" size="sm" />
                  </View>
                  {listings.filter(l => l.searchType === 'beraber_ev').map(item => renderListingItem(item))}
                </View>
              )}
            </>
          ) : (
            // Tek kategori seçiliyken normal liste
            listings.map((item) => renderListingItem(item))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
