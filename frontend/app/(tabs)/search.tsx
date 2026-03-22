import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, TextInput, RefreshControl, ActivityIndicator, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, EmptyState } from '../../src/components';
import { listingService } from '../../src/services';
import { SEARCH_TYPES, GENDERS, ROOM_COUNTS, getRoomCountLabel } from '../../src/constants';
import { TURKEY_CITIES } from '../../src/constants/turkey';
import { formatCurrency } from '../../src/utils';
import { API_URL } from '../../src/config/api';
import type { Listing, SearchType, ListingFilter } from '../../src/types';

const getImageUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  return `${API_URL.replace('/api', '')}${path}`;
};

const getPriceDisplay = (listing: Listing) => {
  if (listing.searchType === 'evime_arkadas' && listing.rentPrice) {
    return formatCurrency(listing.rentPrice);
  }
  if (listing.minBudget !== undefined && listing.maxBudget !== undefined) {
    return `${formatCurrency(listing.minBudget)} - ${formatCurrency(listing.maxBudget)}`;
  }
  return 'Fiyat belirtilmemiş';
};

const CITIES_LIST = TURKEY_CITIES.map(c => c.name);

interface Filters {
  searchType: string | null;
  city: string | null;
  district: string | null;
  neighborhood: string;
  gender: string | null;
  furnished: string | null;
  minBudget: string;
  maxBudget: string;
  minSquareMeters: string;
  maxSquareMeters: string;
  roomCount: number | null;
  desiredRoomCount: number | null;
  peopleCount: string;
}

const emptyFilters: Filters = {
  searchType: null, city: null, district: null, neighborhood: '',
  gender: null, furnished: null, minBudget: '', maxBudget: '',
  minSquareMeters: '', maxSquareMeters: '', roomCount: null,
  desiredRoomCount: null, peopleCount: '',
};

export default function SearchScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Applied filters (triggers API call)
  const [filters, setFilters] = useState<Filters>({ ...emptyFilters });
  // Temp filters (in modal, before applying)
  const [tempFilters, setTempFilters] = useState<Filters>({ ...emptyFilters });

  // City/district selection sub-modals
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchType) count++;
    if (filters.city) count++;
    if (filters.district) count++;
    if (filters.neighborhood) count++;
    if (filters.gender) count++;
    if (filters.furnished !== null) count++;
    if (filters.minBudget || filters.maxBudget) count++;
    if (filters.minSquareMeters || filters.maxSquareMeters) count++;
    if (filters.roomCount) count++;
    if (filters.desiredRoomCount) count++;
    if (filters.peopleCount) count++;
    return count;
  }, [filters]);

  const buildApiFilter = useCallback((f: Filters): ListingFilter => {
    const apiFilter: ListingFilter = {};
    if (f.searchType) apiFilter.searchType = f.searchType as SearchType;
    if (f.city) apiFilter.city = f.city;
    if (f.district) apiFilter.district = f.district;
    if (f.neighborhood) apiFilter.neighborhood = f.neighborhood;
    if (f.gender) apiFilter.gender = f.gender as any;
    if (f.furnished !== null) apiFilter.furnished = f.furnished;
    if (f.minBudget) apiFilter.minBudget = Number(f.minBudget);
    if (f.maxBudget) apiFilter.maxBudget = Number(f.maxBudget);
    if (f.minSquareMeters) apiFilter.minSquareMeters = Number(f.minSquareMeters);
    if (f.maxSquareMeters) apiFilter.maxSquareMeters = Number(f.maxSquareMeters);
    if (f.roomCount) apiFilter.roomCount = f.roomCount;
    if (f.desiredRoomCount) apiFilter.desiredRoomCount = f.desiredRoomCount;
    if (f.peopleCount) apiFilter.peopleCount = Number(f.peopleCount);
    return apiFilter;
  }, []);

  const fetchListings = useCallback(async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      const apiFilter = buildApiFilter(filters);
      const response = await listingService.getAll(apiFilter, pageNum, 20);
      
      if (response.success && response.data) {
        const newListings = response.data.items || [];
        if (pageNum === 1) setListings(newListings);
        else setListings(prev => [...prev, ...newListings]);
        setHasMore(newListings.length === 20);
        setPage(pageNum);
      }
    } catch (err) {
      console.log('Search error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [filters, buildApiFilter]);

  useEffect(() => {
    fetchListings(1);
  }, [filters]);

  const filteredListings = useMemo(() => {
    if (!searchText) return listings;
    const s = searchText.toLowerCase();
    return listings.filter(item =>
      item.title.toLowerCase().includes(s) ||
      item.city.toLowerCase().includes(s) ||
      (item.district?.toLowerCase().includes(s) ?? false) ||
      (item.neighborhood?.toLowerCase().includes(s) ?? false)
    );
  }, [listings, searchText]);

  const openFilterModal = () => {
    setTempFilters({ ...filters });
    setShowFilterModal(true);
  };

  const applyFilters = () => {
    setFilters({ ...tempFilters });
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setTempFilters({ ...emptyFilters });
  };

  const clearAllAndClose = () => {
    setFilters({ ...emptyFilters });
    setShowFilterModal(false);
  };

  // Get districts for selected city
  const availableDistricts = useMemo(() => {
    if (!tempFilters.city) return [];
    const city = TURKEY_CITIES.find(c => c.name === tempFilters.city);
    return city?.districts || [];
  }, [tempFilters.city]);

  const filteredCities = useMemo(() => {
    if (!citySearch) return CITIES_LIST;
    return CITIES_LIST.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()));
  }, [citySearch]);

  const filteredDistricts = useMemo(() => {
    if (!districtSearch) return availableDistricts;
    return availableDistricts.filter(d => d.toLowerCase().includes(districtSearch.toLowerCase()));
  }, [availableDistricts, districtSearch]);

  // -- Render helpers --
  const ChipSelect = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full mr-2 mb-2 ${selected ? 'bg-primary-600' : 'bg-secondary-100'}`}
    >
      <Text className={selected ? 'text-white font-medium' : 'text-secondary-600'}>{label}</Text>
    </TouchableOpacity>
  );

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View className="mb-5">
      <Text className="text-secondary-700 font-semibold mb-2">{title}</Text>
      {children}
    </View>
  );

  const renderResultItem = ({ item }: { item: Listing }) => (
    <Card className="mb-4" onPress={() => router.push(`/listing/${item.id}`)}>
      {item.searchType === 'evime_arkadas' && (
        item.images && item.images.length > 0 ? (
          <Image source={{ uri: getImageUrl(item.images[0]) }} className="h-32 w-full rounded-xl mb-3" resizeMode="cover" />
        ) : (
          <View className="h-32 bg-secondary-200 rounded-xl mb-3 items-center justify-center">
            <Ionicons name="image-outline" size={32} color="#94A3B8" />
          </View>
        )
      )}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 pr-2">
          <Text className="text-base font-semibold text-secondary-900" numberOfLines={1}>{item.title}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="location-outline" size={14} color="#64748B" />
            <Text className="text-secondary-500 text-sm ml-1" numberOfLines={1}>
              {item.neighborhood ? `${item.neighborhood}, ` : ''}{item.district ? `${item.district}, ` : ''}{item.city}
            </Text>
          </View>
        </View>
        <Badge
          label={SEARCH_TYPES[item.searchType as keyof typeof SEARCH_TYPES]?.split(' ')[0] || item.searchType}
          variant={item.searchType === 'evime_arkadas' ? 'primary' : item.searchType === 'beraber_ev' ? 'success' : 'secondary'}
          size="sm"
        />
      </View>
      {(item.roomCount || item.squareMeters || item.furnished !== undefined) && (
        <View className="flex-row flex-wrap mb-2">
          {item.roomCount ? <View className="flex-row items-center mr-3"><Ionicons name="bed-outline" size={14} color="#64748B" /><Text className="text-secondary-500 text-sm ml-1">{getRoomCountLabel(item.roomCount)}</Text></View> : null}
          {item.squareMeters ? <View className="flex-row items-center mr-3"><Ionicons name="resize-outline" size={14} color="#64748B" /><Text className="text-secondary-500 text-sm ml-1">{item.squareMeters} m²</Text></View> : null}
          {item.furnished !== undefined && item.furnished !== null ? <View className="flex-row items-center"><Ionicons name="cube-outline" size={14} color="#64748B" /><Text className="text-secondary-500 text-sm ml-1">{item.furnished ? 'Eşyalı' : 'Eşyasız'}</Text></View> : null}
        </View>
      )}
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-primary-600">{getPriceDisplay(item)}</Text>
        {item.user && (
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={14} color="#64748B" />
            <Text className="text-secondary-500 text-sm ml-1">{item.user.fullName?.split(' ')[0]}</Text>
          </View>
        )}
      </View>
    </Card>
  );

  const renderGroupedView = () => {
    const types = [
      { key: 'evime_arkadas', label: 'Evime Arkadaş Arıyorum', icon: 'home-outline', bgColor: 'bg-primary-50', iconBg: 'bg-primary-100', iconColor: '#4F46E5', textColor: 'text-primary-700', badgeVariant: 'primary' as const },
      { key: 'kalacak_ev', label: 'Kalacak Ev Arıyorum', icon: 'search-outline', bgColor: 'bg-secondary-100', iconBg: 'bg-secondary-200', iconColor: '#64748B', textColor: 'text-secondary-700', badgeVariant: 'secondary' as const },
      { key: 'beraber_ev', label: 'Beraber Ev Arayalım', icon: 'people-outline', bgColor: 'bg-green-50', iconBg: 'bg-green-100', iconColor: '#16A34A', textColor: 'text-green-700', badgeVariant: 'success' as const },
    ];

    return types.map(type => {
      const items = filteredListings.filter(l => l.searchType === type.key);
      if (items.length === 0) return null;
      return (
        <View key={type.key} className="mb-6">
          <View className={`flex-row items-center mb-3 ${type.bgColor} p-3 rounded-xl`}>
            <View className={`w-8 h-8 ${type.iconBg} rounded-full items-center justify-center mr-3`}>
              <Ionicons name={type.icon as any} size={18} color={type.iconColor} />
            </View>
            <Text className={`${type.textColor} font-semibold flex-1`}>{type.label}</Text>
            <Badge label={`${items.length}`} variant={type.badgeVariant} size="sm" />
          </View>
          {items.map(item => <View key={item.id}>{renderResultItem({ item })}</View>)}
        </View>
      );
    });
  };

  // Common filters for all types
  const renderCommonFilters = () => (
    <>
      {/* İlan Türü */}
      <FilterSection title="İlan Türü">
        <View className="flex-row flex-wrap">
          <ChipSelect label="Tümü" selected={!tempFilters.searchType} onPress={() => setTempFilters(f => ({ ...f, searchType: null }))} />
          {Object.entries(SEARCH_TYPES).map(([key, label]) => (
            <ChipSelect key={key} label={label} selected={tempFilters.searchType === key} onPress={() => setTempFilters(f => ({ ...f, searchType: key }))} />
          ))}
        </View>
      </FilterSection>

      {/* Cinsiyet */}
      <FilterSection title="Cinsiyet Tercihi">
        <View className="flex-row flex-wrap">
          <ChipSelect label="Farketmez" selected={!tempFilters.gender} onPress={() => setTempFilters(f => ({ ...f, gender: null }))} />
          {Object.entries(GENDERS).map(([key, label]) => (
            <ChipSelect key={key} label={label} selected={tempFilters.gender === key} onPress={() => setTempFilters(f => ({ ...f, gender: key }))} />
          ))}
        </View>
      </FilterSection>

      {/* İl */}
      <FilterSection title="İl">
        <TouchableOpacity 
          onPress={() => { setCitySearch(''); setShowCityPicker(true); }}
          className="flex-row items-center bg-secondary-100 rounded-xl px-4 py-3"
        >
          <Ionicons name="location-outline" size={20} color="#64748B" />
          <Text className={`flex-1 ml-3 ${tempFilters.city ? 'text-secondary-900' : 'text-secondary-400'}`}>
            {tempFilters.city || 'İl seçin'}
          </Text>
          {tempFilters.city && (
            <TouchableOpacity onPress={() => setTempFilters(f => ({ ...f, city: null, district: null }))}>
              <Ionicons name="close-circle" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </FilterSection>

      {/* İlçe */}
      {tempFilters.city && (
        <FilterSection title="İlçe">
          <TouchableOpacity
            onPress={() => { setDistrictSearch(''); setShowDistrictPicker(true); }}
            className="flex-row items-center bg-secondary-100 rounded-xl px-4 py-3"
          >
            <Ionicons name="navigate-outline" size={20} color="#64748B" />
            <Text className={`flex-1 ml-3 ${tempFilters.district ? 'text-secondary-900' : 'text-secondary-400'}`}>
              {tempFilters.district || 'İlçe seçin (opsiyonel)'}
            </Text>
            {tempFilters.district && (
              <TouchableOpacity onPress={() => setTempFilters(f => ({ ...f, district: null }))}>
                <Ionicons name="close-circle" size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </FilterSection>
      )}

      {/* Mahalle */}
      <FilterSection title="Mahalle">
        <TextInput
          className="bg-secondary-100 rounded-xl px-4 py-3 text-secondary-900"
          placeholder="Mahalle adı yazın..."
          placeholderTextColor="#94A3B8"
          value={tempFilters.neighborhood}
          onChangeText={(t) => setTempFilters(f => ({ ...f, neighborhood: t }))}
        />
      </FilterSection>

      {/* Bütçe */}
      <FilterSection title="Bütçe Aralığı (₺)">
        <View className="flex-row">
          <TextInput
            className="flex-1 bg-secondary-100 rounded-xl px-4 py-3 text-secondary-900 mr-2"
            placeholder="Min"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={tempFilters.minBudget}
            onChangeText={(t) => setTempFilters(f => ({ ...f, minBudget: t }))}
          />
          <TextInput
            className="flex-1 bg-secondary-100 rounded-xl px-4 py-3 text-secondary-900 ml-2"
            placeholder="Max"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={tempFilters.maxBudget}
            onChangeText={(t) => setTempFilters(f => ({ ...f, maxBudget: t }))}
          />
        </View>
      </FilterSection>

      {/* Metrekare */}
      <FilterSection title="Metrekare Aralığı">
        <View className="flex-row">
          <TextInput
            className="flex-1 bg-secondary-100 rounded-xl px-4 py-3 text-secondary-900 mr-2"
            placeholder="Min m²"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={tempFilters.minSquareMeters}
            onChangeText={(t) => setTempFilters(f => ({ ...f, minSquareMeters: t }))}
          />
          <TextInput
            className="flex-1 bg-secondary-100 rounded-xl px-4 py-3 text-secondary-900 ml-2"
            placeholder="Max m²"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={tempFilters.maxSquareMeters}
            onChangeText={(t) => setTempFilters(f => ({ ...f, maxSquareMeters: t }))}
          />
        </View>
      </FilterSection>

      {/* Eşyalı */}
      <FilterSection title="Eşya Durumu">
        <View className="flex-row flex-wrap">
          <ChipSelect label="Farketmez" selected={tempFilters.furnished === null} onPress={() => setTempFilters(f => ({ ...f, furnished: null }))} />
          <ChipSelect label="Eşyalı" selected={tempFilters.furnished === 'true'} onPress={() => setTempFilters(f => ({ ...f, furnished: 'true' }))} />
          <ChipSelect label="Eşyasız" selected={tempFilters.furnished === 'false'} onPress={() => setTempFilters(f => ({ ...f, furnished: 'false' }))} />
        </View>
      </FilterSection>
    </>
  );

  // Type-specific filters
  const renderTypeSpecificFilters = () => {
    if (!tempFilters.searchType) return null;

    if (tempFilters.searchType === 'evime_arkadas') {
      return (
        <FilterSection title="Oda Sayısı">
          <View className="flex-row flex-wrap">
            <ChipSelect label="Tümü" selected={!tempFilters.roomCount} onPress={() => setTempFilters(f => ({ ...f, roomCount: null }))} />
            {ROOM_COUNTS.map(r => (
              <ChipSelect key={r.value} label={r.label} selected={tempFilters.roomCount === r.value} onPress={() => setTempFilters(f => ({ ...f, roomCount: r.value }))} />
            ))}
          </View>
        </FilterSection>
      );
    }

    if (tempFilters.searchType === 'beraber_ev') {
      return (
        <>
          <FilterSection title="Kişi Sayısı">
            <TextInput
              className="bg-secondary-100 rounded-xl px-4 py-3 text-secondary-900"
              placeholder="Kaç kişi aranıyor?"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={tempFilters.peopleCount}
              onChangeText={(t) => setTempFilters(f => ({ ...f, peopleCount: t }))}
            />
          </FilterSection>
          <FilterSection title="Oda Sayısı Tercihi">
            <View className="flex-row flex-wrap">
              <ChipSelect label="Tümü" selected={!tempFilters.desiredRoomCount} onPress={() => setTempFilters(f => ({ ...f, desiredRoomCount: null }))} />
              {ROOM_COUNTS.map(r => (
                <ChipSelect key={r.value} label={r.label} selected={tempFilters.desiredRoomCount === r.value} onPress={() => setTempFilters(f => ({ ...f, desiredRoomCount: r.value }))} />
              ))}
            </View>
          </FilterSection>
        </>
      );
    }

    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-secondary-50" edges={['top']}>
      {/* Header */}
      <View className="px-6 pt-4 pb-4 bg-white">
        <Text className="text-2xl font-bold text-secondary-900 mb-4">Keşfet</Text>
        <View className="flex-row items-center bg-secondary-100 rounded-xl px-4">
          <Ionicons name="search-outline" size={20} color="#94A3B8" />
          <TextInput
            className="flex-1 py-3 px-3 text-secondary-900"
            placeholder="Başlık, şehir veya ilçe ara..."
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity onPress={openFilterModal} className="relative">
            <Ionicons name="options-outline" size={22} color={activeFilterCount > 0 ? '#4F46E5' : '#94A3B8'} />
            {activeFilterCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-primary-600 rounded-full w-4 h-4 items-center justify-center">
                <Text className="text-white text-[10px] font-bold">{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            {filters.searchType && (
              <TouchableOpacity onPress={() => setFilters(f => ({ ...f, searchType: null }))} className="flex-row items-center bg-primary-100 rounded-full px-3 py-1.5 mr-2">
                <Text className="text-primary-700 text-xs font-medium">{SEARCH_TYPES[filters.searchType as keyof typeof SEARCH_TYPES]}</Text>
                <Ionicons name="close" size={14} color="#4338CA" className="ml-1" />
              </TouchableOpacity>
            )}
            {filters.city && (
              <TouchableOpacity onPress={() => setFilters(f => ({ ...f, city: null, district: null }))} className="flex-row items-center bg-primary-100 rounded-full px-3 py-1.5 mr-2">
                <Text className="text-primary-700 text-xs font-medium">{filters.city}{filters.district ? ` / ${filters.district}` : ''}</Text>
                <Ionicons name="close" size={14} color="#4338CA" className="ml-1" />
              </TouchableOpacity>
            )}
            {filters.gender && (
              <TouchableOpacity onPress={() => setFilters(f => ({ ...f, gender: null }))} className="flex-row items-center bg-primary-100 rounded-full px-3 py-1.5 mr-2">
                <Text className="text-primary-700 text-xs font-medium">{GENDERS[filters.gender as keyof typeof GENDERS]}</Text>
                <Ionicons name="close" size={14} color="#4338CA" className="ml-1" />
              </TouchableOpacity>
            )}
            {(filters.minBudget || filters.maxBudget) && (
              <TouchableOpacity onPress={() => setFilters(f => ({ ...f, minBudget: '', maxBudget: '' }))} className="flex-row items-center bg-primary-100 rounded-full px-3 py-1.5 mr-2">
                <Text className="text-primary-700 text-xs font-medium">₺{filters.minBudget || '0'} - ₺{filters.maxBudget || '∞'}</Text>
                <Ionicons name="close" size={14} color="#4338CA" className="ml-1" />
              </TouchableOpacity>
            )}
            {filters.furnished !== null && (
              <TouchableOpacity onPress={() => setFilters(f => ({ ...f, furnished: null }))} className="flex-row items-center bg-primary-100 rounded-full px-3 py-1.5 mr-2">
                <Text className="text-primary-700 text-xs font-medium">{filters.furnished === 'true' ? 'Eşyalı' : 'Eşyasız'}</Text>
                <Ionicons name="close" size={14} color="#4338CA" className="ml-1" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={clearAllAndClose} className="flex-row items-center bg-red-50 rounded-full px-3 py-1.5">
              <Text className="text-red-600 text-xs font-medium">Temizle</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* Results */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="text-secondary-500 mt-2">İlanlar yükleniyor...</Text>
        </View>
      ) : filteredListings.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="Sonuç Bulunamadı"
          description="Arama kriterlerinize uygun ilan bulunamadı. Filtreleri değiştirmeyi deneyin."
          actionLabel="Filtreleri Temizle"
          onAction={clearAllAndClose}
        />
      ) : !filters.searchType ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => fetchListings(1, true)} />}
          contentContainerStyle={{ padding: 24 }}
        >
          <Text className="text-secondary-500 mb-4">{filteredListings.length} sonuç bulundu</Text>
          {renderGroupedView()}
          {hasMore && (
            <TouchableOpacity onPress={() => fetchListings(page + 1)} disabled={isLoadingMore} className="py-4 items-center">
              {isLoadingMore ? <ActivityIndicator size="small" color="#4F46E5" /> : <Text className="text-primary-600 font-medium">Daha Fazla Yükle</Text>}
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={filteredListings}
          renderItem={renderResultItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => fetchListings(1, true)} />}
          onEndReached={() => { if (!isLoadingMore && hasMore) fetchListings(page + 1); }}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={<Text className="text-secondary-500 mb-4">{filteredListings.length} sonuç bulundu</Text>}
          ListFooterComponent={isLoadingMore ? <View className="py-4 items-center"><ActivityIndicator size="small" color="#4F46E5" /></View> : null}
        />
      )}

      {/* Filter Modal */}
      <Modal visible={showFilterModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-secondary-100">
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#334155" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-secondary-900">Filtreler</Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text className="text-primary-600 font-medium">Sıfırla</Text>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {renderCommonFilters()}
            {renderTypeSpecificFilters()}
            <View className="h-8" />
          </ScrollView>

          {/* Apply Button */}
          <View className="px-6 py-4 border-t border-secondary-100 bg-white" style={{ paddingBottom: 24 }}>
            <TouchableOpacity onPress={applyFilters} className="bg-primary-600 rounded-xl py-4 items-center">
              <Text className="text-white font-bold text-base">Filtreleri Uygula</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* City Picker Modal */}
      <Modal visible={showCityPicker} animationType="slide">
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
          <View className="flex-row items-center px-4 py-3 border-b border-secondary-100">
            <TouchableOpacity onPress={() => setShowCityPicker(false)} className="p-2">
              <Ionicons name="close" size={24} color="#334155" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-secondary-900 flex-1 text-center mr-8">İl Seçin</Text>
          </View>
          <View className="px-4 py-3">
            <TextInput
              className="bg-secondary-100 rounded-xl px-4 py-3 text-secondary-900"
              placeholder="İl ara..."
              placeholderTextColor="#94A3B8"
              value={citySearch}
              onChangeText={setCitySearch}
              autoFocus={false}
            />
          </View>
          <FlatList
            data={filteredCities}
            keyExtractor={item => item}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setTempFilters(f => ({ ...f, city: item, district: null }));
                  setShowCityPicker(false);
                }}
                className={`px-6 py-4 border-b border-secondary-50 ${tempFilters.city === item ? 'bg-primary-50' : ''}`}
              >
                <Text className={tempFilters.city === item ? 'text-primary-700 font-semibold' : 'text-secondary-900'}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* District Picker Modal */}
      <Modal visible={showDistrictPicker} animationType="slide">
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
          <View className="flex-row items-center px-4 py-3 border-b border-secondary-100">
            <TouchableOpacity onPress={() => setShowDistrictPicker(false)} className="p-2">
              <Ionicons name="close" size={24} color="#334155" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-secondary-900 flex-1 text-center mr-8">{tempFilters.city} - İlçe Seçin</Text>
          </View>
          <View className="px-4 py-3">
            <TextInput
              className="bg-secondary-100 rounded-xl px-4 py-3 text-secondary-900"
              placeholder="İlçe ara..."
              placeholderTextColor="#94A3B8"
              value={districtSearch}
              onChangeText={setDistrictSearch}
              autoFocus={false}
            />
          </View>
          <FlatList
            data={filteredDistricts}
            keyExtractor={item => item}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setTempFilters(f => ({ ...f, district: item }));
                  setShowDistrictPicker(false);
                }}
                className={`px-6 py-4 border-b border-secondary-50 ${tempFilters.district === item ? 'bg-primary-50' : ''}`}
              >
                <Text className={tempFilters.district === item ? 'text-primary-700 font-semibold' : 'text-secondary-900'}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
