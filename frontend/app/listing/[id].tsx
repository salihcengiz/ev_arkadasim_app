import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, Dimensions, FlatList, Modal, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Button, Badge } from '../../src/components';
import { listingService, messageService } from '../../src/services';
import { useAuthStore } from '../../src/store/authStore';
import { SEARCH_TYPES, GENDERS, OCCUPATIONS, getRoomCountLabel } from '../../src/constants';
import { formatCurrency, getTimeAgo } from '../../src/utils';
import { API_URL } from '../../src/config/api';
import type { Listing } from '../../src/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ZoomableImage = ({ uri }: { uri: string }) => {
  const scrollRef = useRef<ScrollView>(null);
  return (
    <ScrollView
      ref={scrollRef}
      style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
      contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', minHeight: SCREEN_HEIGHT }}
      maximumZoomScale={5}
      minimumZoomScale={1}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      bouncesZoom
      centerContent
    >
      <Image
        source={{ uri }}
        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.7 }}
        resizeMode="contain"
      />
    </ScrollView>
  );
};

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

// Helper to get price label based on listing type
const getPriceLabel = (listing: Listing) => {
  if (listing.searchType === 'evime_arkadas') {
    return 'Aylık Kira';
  }
  if (listing.searchType === 'beraber_ev') {
    return 'Toplam Kira Bütçesi';
  }
  return 'Bütçe';
};

export default function ListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      setIsLoading(true);
      const response = await listingService.getById(id!);
      
      if (response.success && response.data) {
        setListing(response.data);
      } else {
        Alert.alert('Hata', 'İlan bulunamadı');
        router.back();
      }
    } catch (err: any) {
      console.log('Listing fetch error:', err);
      Alert.alert('Hata', err.response?.data?.message || 'İlan yüklenirken bir hata oluştu');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = async () => {
    if (!isAuthenticated) {
      Alert.alert('Giriş Gerekli', 'Mesaj göndermek için giriş yapmalısınız.', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Giriş Yap', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    if (listing?.user?.id === user?.id) {
      Alert.alert('Uyarı', 'Kendi ilanınıza mesaj gönderemezsiniz.');
      return;
    }

    try {
      setIsSendingMessage(true);
      // Mesaj göndermeden sohbet başlat/getir
      const response = await messageService.startConversation(listing!.user!.id);
      
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

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentImageIndex(viewableItems[0].index || 0);
    }
  }).current;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-secondary-500 mt-2">Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-secondary-500 mt-2">İlan bulunamadı</Text>
      </SafeAreaView>
    );
  }

  const isOwner = user?.id === listing.user?.id;
  const hasImages = listing.images && listing.images.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-secondary-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-secondary-900 ml-2" numberOfLines={1}>
          İlan Detayı
        </Text>
        {isOwner && (
          <TouchableOpacity className="p-2">
            <Ionicons name="ellipsis-vertical" size={24} color="#334155" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Image Gallery - only for evime_arkadas */}
        {listing.searchType === 'evime_arkadas' && (
          hasImages ? (
            <View>
              <FlatList
                ref={flatListRef}
                data={listing.images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                renderItem={({ item, index }) => (
                  <TouchableOpacity 
                    activeOpacity={0.9}
                    onPress={() => { setFullscreenImageIndex(index); setShowFullscreen(true); }}
                  >
                    <Image
                      source={{ uri: getImageUrl(item) }}
                      style={{ width: SCREEN_WIDTH, height: 250 }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
              {listing.images!.length > 1 && (
                <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
                  {listing.images!.map((_, index) => (
                    <View
                      key={index}
                      className={`w-2 h-2 rounded-full mx-1 ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View className="h-48 bg-secondary-200 items-center justify-center">
              <Ionicons name="image-outline" size={64} color="#94A3B8" />
            </View>
          )
        )}

        {/* Content */}
        <View className="px-6 py-4">
          {/* Title & Badge */}
          <View className="flex-row items-start justify-between mb-2">
            <Text className="flex-1 text-2xl font-bold text-secondary-900 pr-2">
              {listing.title}
            </Text>
            <Badge
              label={SEARCH_TYPES[listing.searchType as keyof typeof SEARCH_TYPES] || listing.searchType}
              variant="primary"
            />
          </View>

          {/* Location */}
          <View className="flex-row items-center mb-4">
            <Ionicons name="location-outline" size={18} color="#64748B" />
            <Text className="text-secondary-500 ml-1">
              {listing.neighborhood ? `${listing.neighborhood}, ` : ''}
              {listing.district ? `${listing.district}, ` : ''}{listing.city}
            </Text>
          </View>

          {/* Price */}
          <View className="bg-primary-50 rounded-xl p-4 mb-4">
            <Text className="text-secondary-500 text-sm mb-1">{getPriceLabel(listing)}</Text>
            <Text className="text-2xl font-bold text-primary-600">
              {getPriceDisplay(listing)}
            </Text>
          </View>

          {/* Details */}
          <View className="flex-row flex-wrap mb-4">
            {/* Room Count */}
            {listing.roomCount && (
              <View className="flex-row items-center bg-secondary-100 rounded-lg px-3 py-2 mr-2 mb-2">
                <Ionicons name="bed-outline" size={16} color="#64748B" />
                <Text className="text-secondary-600 ml-2">
                  {listing.searchType === 'evime_arkadas' ? 'Ev: ' : ''}{getRoomCountLabel(listing.roomCount)}
                </Text>
              </View>
            )}
            
            {/* Desired Room Count (for kalacak_ev, beraber_ev) */}
            {listing.desiredRoomCount && listing.searchType !== 'evime_arkadas' && (
              <View className="flex-row items-center bg-secondary-100 rounded-lg px-3 py-2 mr-2 mb-2">
                <Ionicons name="bed-outline" size={16} color="#64748B" />
                <Text className="text-secondary-600 ml-2">{getRoomCountLabel(listing.desiredRoomCount)} tercih</Text>
              </View>
            )}
            
            {/* Square Meters */}
            {listing.squareMeters && (
              <View className="flex-row items-center bg-secondary-100 rounded-lg px-3 py-2 mr-2 mb-2">
                <Ionicons name="resize-outline" size={16} color="#64748B" />
                <Text className="text-secondary-600 ml-2">{listing.squareMeters} m²</Text>
              </View>
            )}
            
            {/* Furnished */}
            {listing.furnished !== undefined && listing.furnished !== null && (
              <View className="flex-row items-center bg-secondary-100 rounded-lg px-3 py-2 mr-2 mb-2">
                <Ionicons name="cube-outline" size={16} color="#64748B" />
                <Text className="text-secondary-600 ml-2">
                  {listing.furnished ? 'Eşyalı' : 'Eşyasız'}
                </Text>
              </View>
            )}
            
            {/* People Count (for beraber_ev) */}
            {listing.peopleCount && (
              <View className="flex-row items-center bg-secondary-100 rounded-lg px-3 py-2 mr-2 mb-2">
                <Ionicons name="people-outline" size={16} color="#64748B" />
                <Text className="text-secondary-600 ml-2">{listing.peopleCount} kişi arıyor</Text>
              </View>
            )}
            
            {/* Gender Preference */}
            {listing.preferredGender && (
              <View className="flex-row items-center bg-secondary-100 rounded-lg px-3 py-2 mr-2 mb-2">
                <Ionicons name="person-outline" size={16} color="#64748B" />
                <Text className="text-secondary-600 ml-2">
                  {GENDERS[listing.preferredGender as keyof typeof GENDERS]} tercih
                </Text>
              </View>
            )}
            
            {/* Duration */}
            {listing.duration && (
              <View className="flex-row items-center bg-secondary-100 rounded-lg px-3 py-2 mr-2 mb-2">
                <Ionicons name="calendar-outline" size={16} color="#64748B" />
                <Text className="text-secondary-600 ml-2">{listing.duration} ay</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-secondary-900 mb-2">Açıklama</Text>
            <Text className="text-secondary-600 leading-6">{listing.description}</Text>
          </View>

          {/* Posted Date */}
          <View className="flex-row items-center mb-6">
            <Ionicons name="time-outline" size={16} color="#94A3B8" />
            <Text className="text-secondary-400 text-sm ml-1">
              {getTimeAgo(listing.createdAt)} yayınlandı
            </Text>
          </View>

          {/* User Info */}
          {listing.user && (
            <View className="border-t border-secondary-100 pt-4">
              <Text className="text-lg font-semibold text-secondary-900 mb-3">İlan Sahibi</Text>
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => router.push(`/user/${listing.user!.id}`)}
              >
                <Avatar
                  name={listing.user.fullName}
                  source={listing.user.profileImage || undefined}
                  size="lg"
                />
                <View className="ml-4 flex-1">
                  <Text className="text-base font-semibold text-secondary-900">
                    {listing.user.fullName}
                  </Text>
                  <View className="flex-row items-center flex-wrap mt-1">
                    {listing.user.age && (
                      <Text className="text-secondary-500 text-sm mr-2">
                        {listing.user.age} yaşında
                      </Text>
                    )}
                    {listing.user.gender && (
                      <Text className="text-secondary-500 text-sm mr-2">
                        • {GENDERS[listing.user.gender as keyof typeof GENDERS]}
                      </Text>
                    )}
                    {listing.user.occupation && (
                      <Text className="text-secondary-500 text-sm">
                        • {OCCUPATIONS[listing.user.occupation as keyof typeof OCCUPATIONS] || listing.user.occupation}
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      {!isOwner && (
        <View className="px-6 py-4 border-t border-secondary-100">
          <Button
            title="İletişime Geç"
            onPress={handleContact}
            isLoading={isSendingMessage}
            fullWidth
            leftIcon={<Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />}
          />
        </View>
      )}

      {/* Fullscreen Image Viewer */}
      <Modal visible={showFullscreen} transparent animationType="fade" onRequestClose={() => setShowFullscreen(false)}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          {/* Top bar with close and counter */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, paddingTop: 50, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={() => setShowFullscreen(false)}
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
            >
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>

            {listing?.images && listing.images.length > 1 && (
              <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>
                  {fullscreenImageIndex + 1} / {listing.images.length}
                </Text>
              </View>
            )}

            <View style={{ width: 40 }} />
          </View>

          {/* Swipeable images with pinch-to-zoom */}
          <FlatList
            data={listing?.images || []}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={fullscreenImageIndex}
            getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setFullscreenImageIndex(idx);
            }}
            renderItem={({ item }) => (
              <ZoomableImage uri={getImageUrl(item)} />
            )}
            keyExtractor={(_, index) => `fs-${index}`}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
