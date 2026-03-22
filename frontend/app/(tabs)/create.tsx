import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Modal, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Button, Input, Card } from '../../src/components';
import { listingService, uploadService } from '../../src/services';
import { useAuthStore } from '../../src/store/authStore';
import { GENDERS, ROOM_COUNTS } from '../../src/constants';
import { TURKEY_CITIES, getCityNames, getDistricts } from '../../src/constants/turkey';
import { API_URL } from '../../src/config/api';
import type { SearchType, Gender } from '../../src/types';

export default function CreateScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchType, setSearchType] = useState<SearchType | null>(null);
  
  // City/District selection
  const [showCityModal, setShowCityModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');

  // Images
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    district: '',
    neighborhood: '',
    // Evime Arkadaş
    rentPrice: '',
    roomCount: '',
    squareMeters: '',
    furnished: null as boolean | null,
    // Kalacak Ev & Beraber Ev
    minBudget: '',
    maxBudget: '',
    desiredRoomCount: '',
    desiredSquareMeters: '',
    desiredFurnished: null as boolean | null,
    // Beraber Ev
    peopleCount: '',
    // Common
    preferredGender: '' as Gender | '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const searchTypeOptions = [
    {
      type: 'evime_arkadas' as SearchType,
      title: 'Evime Arkadaş Arıyorum',
      description: 'Evinizin bir odasını kiralamak istiyorsunuz',
      icon: 'home-outline',
    },
    {
      type: 'kalacak_ev' as SearchType,
      title: 'Kalacak Ev Arıyorum',
      description: 'Kendinize oda veya ev arkadaşı arıyorsunuz',
      icon: 'search-outline',
    },
    {
      type: 'beraber_ev' as SearchType,
      title: 'Beraber Ev Arayalım',
      description: 'Birlikte ev arayacak arkadaş arıyorsunuz',
      icon: 'people-outline',
    },
  ];

  // Get base URL for images (without /api)
  const getImageBaseUrl = () => {
    return API_URL.replace('/api', '');
  };

  // Filtered cities
  const filteredCities = useMemo(() => {
    if (!citySearch) return getCityNames();
    return getCityNames().filter(city => 
      city.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [citySearch]);

  // Filtered districts
  const filteredDistricts = useMemo(() => {
    const districts = getDistricts(formData.city);
    if (!districtSearch) return districts;
    return districts.filter(district => 
      district.toLowerCase().includes(districtSearch.toLowerCase())
    );
  }, [formData.city, districtSearch]);

  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('İzin Gerekli', 'Galeri erişimi için izin vermeniz gerekiyor.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - selectedImages.length,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newImages = result.assets.map(asset => asset.uri);
      const totalImages = [...selectedImages, ...newImages].slice(0, 5);
      setSelectedImages(totalImages);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    // Filter only images that haven't been uploaded yet
    const imagesToUpload = selectedImages.filter((_, index) => !uploadedImages[index]);
    
    if (imagesToUpload.length === 0) return uploadedImages;

    setIsUploading(true);
    try {
      const response = await uploadService.uploadImages(imagesToUpload);
      
      if (response.success && response.data) {
        const newUrls = response.data.map(img => img.url);
        const allUrls = [...uploadedImages, ...newUrls];
        setUploadedImages(allUrls);
        return allUrls;
      } else {
        Alert.alert('Hata', response.message || 'Resimler yüklenirken hata oluştu');
        return [];
      }
    } catch (error) {
      console.log('Upload error:', error);
      Alert.alert('Hata', 'Resimler yüklenirken hata oluştu');
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title || formData.title.length < 5) {
      newErrors.title = 'Başlık en az 5 karakter olmalı';
    }
    if (!formData.description || formData.description.length < 20) {
      newErrors.description = 'Açıklama en az 20 karakter olmalı';
    }
    if (!formData.city) {
      newErrors.city = 'Şehir seçiniz';
    }
    if (!formData.district) {
      newErrors.district = 'İlçe seçiniz';
    }

    if (searchType === 'evime_arkadas') {
      if (!formData.rentPrice || parseInt(formData.rentPrice) <= 0) {
        newErrors.rentPrice = 'Kira bedeli gerekli';
      }
      if (!formData.roomCount) {
        newErrors.roomCount = 'Oda sayısı seçiniz';
      }
      if (!formData.squareMeters || parseInt(formData.squareMeters) <= 0) {
        newErrors.squareMeters = 'Metrekare gerekli';
      }
      if (formData.furnished === null) {
        newErrors.furnished = 'Eşya durumu seçiniz';
      }
      if (selectedImages.length === 0) {
        newErrors.images = 'En az 1 resim yüklemeniz gerekiyor';
      }
    } else if (searchType === 'kalacak_ev') {
      if (!formData.minBudget || parseInt(formData.minBudget) <= 0) {
        newErrors.minBudget = 'Minimum bütçe gerekli';
      }
      if (!formData.maxBudget || parseInt(formData.maxBudget) <= 0) {
        newErrors.maxBudget = 'Maksimum bütçe gerekli';
      }
      if (parseInt(formData.minBudget) > parseInt(formData.maxBudget)) {
        newErrors.maxBudget = 'Maksimum bütçe minimum bütçeden büyük olmalı';
      }
    } else if (searchType === 'beraber_ev') {
      if (!formData.peopleCount || parseInt(formData.peopleCount) <= 0) {
        newErrors.peopleCount = 'Kişi sayısı gerekli';
      }
      if (!formData.minBudget || parseInt(formData.minBudget) <= 0) {
        newErrors.minBudget = 'Minimum bütçe gerekli';
      }
      if (!formData.maxBudget || parseInt(formData.maxBudget) <= 0) {
        newErrors.maxBudget = 'Maksimum bütçe gerekli';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      Alert.alert('Giriş Gerekli', 'İlan oluşturmak için giriş yapmalısınız.', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Giriş Yap', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Upload images first if any
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        imageUrls = await uploadImages();
        if (searchType === 'evime_arkadas' && imageUrls.length === 0) {
          setIsLoading(false);
          return; // Image upload failed and it's required
        }
      }

      let listingData: any = {
        searchType: searchType!,
        title: formData.title,
        description: formData.description,
        city: formData.city,
        district: formData.district,
        neighborhood: formData.neighborhood || undefined,
        preferredGender: formData.preferredGender || undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      };

      if (searchType === 'evime_arkadas') {
        listingData = {
          ...listingData,
          rentPrice: parseInt(formData.rentPrice),
          roomCount: parseInt(formData.roomCount),
          squareMeters: parseInt(formData.squareMeters),
          furnished: formData.furnished,
        };
      } else if (searchType === 'kalacak_ev') {
        listingData = {
          ...listingData,
          minBudget: parseInt(formData.minBudget),
          maxBudget: parseInt(formData.maxBudget),
          squareMeters: formData.desiredSquareMeters ? parseInt(formData.desiredSquareMeters) : undefined,
          furnished: formData.desiredFurnished,
          desiredRoomCount: formData.desiredRoomCount ? parseInt(formData.desiredRoomCount) : undefined,
        };
      } else if (searchType === 'beraber_ev') {
        listingData = {
          ...listingData,
          minBudget: parseInt(formData.minBudget),
          maxBudget: parseInt(formData.maxBudget),
          peopleCount: parseInt(formData.peopleCount),
          squareMeters: formData.desiredSquareMeters ? parseInt(formData.desiredSquareMeters) : undefined,
          furnished: formData.desiredFurnished,
          desiredRoomCount: formData.desiredRoomCount ? parseInt(formData.desiredRoomCount) : undefined,
        };
      }

      const response = await listingService.create(listingData);
      
      if (response.success) {
        Alert.alert('Başarılı', 'İlanınız başarıyla yayınlandı!', [
          { text: 'Tamam', onPress: () => router.push('/(tabs)/home') },
        ]);
        // Reset form
        setStep(1);
        setSearchType(null);
        setSelectedImages([]);
        setUploadedImages([]);
        setFormData({
          title: '', description: '', city: '', district: '', neighborhood: '',
          rentPrice: '', roomCount: '', squareMeters: '', furnished: null,
          minBudget: '', maxBudget: '', desiredRoomCount: '', desiredSquareMeters: '',
          desiredFurnished: null, peopleCount: '', preferredGender: '',
        });
      } else {
        Alert.alert('Hata', response.message || 'İlan oluşturulurken bir hata oluştu');
      }
    } catch (error: any) {
      console.log('Create listing error:', error);
      Alert.alert('Hata', error.response?.data?.message || 'İlan oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const SelectOption = ({ 
    label, selected, onSelect, fullWidth = false 
  }: { 
    label: string; selected: boolean; onSelect: () => void; fullWidth?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onSelect}
      className={`py-3 px-4 rounded-xl border-2 mb-2 ${fullWidth ? '' : 'mr-2'} ${
        selected ? 'border-primary-600 bg-primary-50' : 'border-secondary-200 bg-white'
      }`}
      style={fullWidth ? { flex: 1 } : {}}
    >
      <Text className={`text-center font-medium ${
        selected ? 'text-primary-600' : 'text-secondary-600'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // City item renderer - memoized to prevent re-renders
  const renderCityItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => {
        setFormData({ ...formData, city: item, district: '' });
        setShowCityModal(false);
        setCitySearch('');
      }}
      className="px-6 py-4 border-b border-secondary-100"
    >
      <Text className={`text-base ${formData.city === item ? 'text-primary-600 font-semibold' : 'text-secondary-800'}`}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  // District item renderer
  const renderDistrictItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => {
        setFormData({ ...formData, district: item });
        setShowDistrictModal(false);
        setDistrictSearch('');
      }}
      className="px-6 py-4 border-b border-secondary-100"
    >
      <Text className={`text-base ${formData.district === item ? 'text-primary-600 font-semibold' : 'text-secondary-800'}`}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderStep1 = () => (
    <View className="flex-1">
      <Text className="text-2xl font-bold text-secondary-900 mb-2">İlan Oluştur</Text>
      <Text className="text-secondary-500 mb-6">Ne tür bir ilan vermek istiyorsunuz?</Text>

      {/* Evime Arkadaş Arıyorum */}
      <TouchableOpacity
        onPress={() => setSearchType('evime_arkadas')}
        activeOpacity={0.8}
        className={`mb-4 p-4 rounded-2xl bg-white shadow-md ${
          searchType === 'evime_arkadas' ? 'border-2 border-primary-600' : 'border border-transparent'
        }`}
      >
        <View className="flex-row items-center">
          <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
            searchType === 'evime_arkadas' ? 'bg-primary-100' : 'bg-secondary-100'
          }`}>
            <Ionicons
              name="home-outline"
              size={24}
              color={searchType === 'evime_arkadas' ? '#4F46E5' : '#64748B'}
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-secondary-900">Evime Arkadaş Arıyorum</Text>
            <Text className="text-secondary-500 text-sm">Evinizin bir odasını kiralamak istiyorsunuz</Text>
          </View>
          {searchType === 'evime_arkadas' && (
            <Ionicons name="checkmark-circle" size={24} color="#4F46E5" />
          )}
        </View>
      </TouchableOpacity>

      {/* Kalacak Ev Arıyorum */}
      <TouchableOpacity
        onPress={() => setSearchType('kalacak_ev')}
        activeOpacity={0.8}
        className={`mb-4 p-4 rounded-2xl bg-white shadow-md ${
          searchType === 'kalacak_ev' ? 'border-2 border-primary-600' : 'border border-transparent'
        }`}
      >
        <View className="flex-row items-center">
          <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
            searchType === 'kalacak_ev' ? 'bg-primary-100' : 'bg-secondary-100'
          }`}>
            <Ionicons
              name="search-outline"
              size={24}
              color={searchType === 'kalacak_ev' ? '#4F46E5' : '#64748B'}
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-secondary-900">Kalacak Ev Arıyorum</Text>
            <Text className="text-secondary-500 text-sm">Kendinize oda veya ev arkadaşı arıyorsunuz</Text>
          </View>
          {searchType === 'kalacak_ev' && (
            <Ionicons name="checkmark-circle" size={24} color="#4F46E5" />
          )}
        </View>
      </TouchableOpacity>

      {/* Beraber Ev Arayalım */}
      <TouchableOpacity
        onPress={() => setSearchType('beraber_ev')}
        activeOpacity={0.8}
        className={`mb-4 p-4 rounded-2xl bg-white shadow-md ${
          searchType === 'beraber_ev' ? 'border-2 border-primary-600' : 'border border-transparent'
        }`}
      >
        <View className="flex-row items-center">
          <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
            searchType === 'beraber_ev' ? 'bg-primary-100' : 'bg-secondary-100'
          }`}>
            <Ionicons
              name="people-outline"
              size={24}
              color={searchType === 'beraber_ev' ? '#4F46E5' : '#64748B'}
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-secondary-900">Beraber Ev Arayalım</Text>
            <Text className="text-secondary-500 text-sm">Birlikte ev arayacak arkadaş arıyorsunuz</Text>
          </View>
          {searchType === 'beraber_ev' && (
            <Ionicons name="checkmark-circle" size={24} color="#4F46E5" />
          )}
        </View>
      </TouchableOpacity>

      <Button
        title="Devam Et"
        onPress={() => setStep(2)}
        disabled={!searchType}
        fullWidth
        className="mt-4"
      />
    </View>
  );

  const renderImagePicker = () => (
    <View className="mb-4">
      <Text className="text-secondary-700 font-medium mb-2">
        Fotoğraflar {searchType === 'evime_arkadas' ? '*' : '(opsiyonel)'}
      </Text>
      <Text className="text-secondary-500 text-sm mb-3">En fazla 5 fotoğraf yükleyebilirsiniz</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
        {/* Add button */}
        {selectedImages.length < 5 && (
          <TouchableOpacity
            onPress={pickImages}
            className="w-24 h-24 bg-secondary-100 rounded-xl border-2 border-dashed border-secondary-300 items-center justify-center mr-3"
          >
            <Ionicons name="camera-outline" size={32} color="#64748B" />
            <Text className="text-secondary-500 text-xs mt-1">Ekle</Text>
          </TouchableOpacity>
        )}
        
        {/* Selected images */}
        {selectedImages.map((uri, index) => (
          <View key={index} className="relative mr-3">
            <Image
              source={{ uri }}
              className="w-24 h-24 rounded-xl"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => removeImage(index)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
            >
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      
      {errors.images && <Text className="text-red-500 text-xs">{errors.images}</Text>}
      {isUploading && (
        <View className="flex-row items-center mt-2">
          <ActivityIndicator size="small" color="#4F46E5" />
          <Text className="text-secondary-500 text-sm ml-2">Resimler yükleniyor...</Text>
        </View>
      )}
    </View>
  );

  const renderEvimeArkadasForm = () => (
    <>
      {renderImagePicker()}

      <Input
        label="Kira Bedeli (₺) *"
        placeholder="7000"
        keyboardType="numeric"
        value={formData.rentPrice}
        onChangeText={(text) => setFormData({ ...formData, rentPrice: text })}
        error={errors.rentPrice}
      />

      <Text className="text-secondary-700 font-medium mb-2">Evin Oda Sayısı *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-1">
        {ROOM_COUNTS.map((room) => (
          <SelectOption
            key={room.value}
            label={room.label}
            selected={formData.roomCount === room.value.toString()}
            onSelect={() => setFormData({ ...formData, roomCount: room.value.toString() })}
          />
        ))}
      </ScrollView>
      {errors.roomCount && <Text className="text-red-500 text-xs mb-3">{errors.roomCount}</Text>}

      <Input
        label="Kiralanacak Odanın Metrekaresi (m²) *"
        placeholder="15"
        keyboardType="numeric"
        value={formData.squareMeters}
        onChangeText={(text) => setFormData({ ...formData, squareMeters: text })}
        error={errors.squareMeters}
      />

      <Text className="text-secondary-700 font-medium mb-2">Oda Eşyalı mı? *</Text>
      <View className="flex-row mb-4">
        <SelectOption
          label="Eşyalı"
          selected={formData.furnished === true}
          onSelect={() => setFormData({ ...formData, furnished: true })}
        />
        <SelectOption
          label="Eşyasız"
          selected={formData.furnished === false}
          onSelect={() => setFormData({ ...formData, furnished: false })}
        />
      </View>
      {errors.furnished && <Text className="text-red-500 text-xs mb-3">{errors.furnished}</Text>}
    </>
  );

  const renderKalacakEvForm = () => (
    <>
      <View className="flex-row">
        <View className="flex-1 mr-2">
          <Input
            label="Min. Bütçe (₺) *"
            placeholder="5000"
            keyboardType="numeric"
            value={formData.minBudget}
            onChangeText={(text) => setFormData({ ...formData, minBudget: text })}
            error={errors.minBudget}
          />
        </View>
        <View className="flex-1 ml-2">
          <Input
            label="Max. Bütçe (₺) *"
            placeholder="10000"
            keyboardType="numeric"
            value={formData.maxBudget}
            onChangeText={(text) => setFormData({ ...formData, maxBudget: text })}
            error={errors.maxBudget}
          />
        </View>
      </View>

      <Input
        label="İstenen Oda Metrekaresi (m²)"
        placeholder="15 (opsiyonel)"
        keyboardType="numeric"
        value={formData.desiredSquareMeters}
        onChangeText={(text) => setFormData({ ...formData, desiredSquareMeters: text })}
      />

      <Text className="text-secondary-700 font-medium mb-2">Eşya Tercihi</Text>
      <View className="flex-row mb-4">
        <SelectOption
          label="Farketmez"
          selected={formData.desiredFurnished === null}
          onSelect={() => setFormData({ ...formData, desiredFurnished: null })}
        />
        <SelectOption
          label="Eşyalı"
          selected={formData.desiredFurnished === true}
          onSelect={() => setFormData({ ...formData, desiredFurnished: true })}
        />
        <SelectOption
          label="Eşyasız"
          selected={formData.desiredFurnished === false}
          onSelect={() => setFormData({ ...formData, desiredFurnished: false })}
        />
      </View>
    </>
  );

  const renderBeraberEvForm = () => (
    <>
      <Input
        label="Kaç Kişi Arıyorsunuz? *"
        placeholder="2"
        keyboardType="numeric"
        value={formData.peopleCount}
        onChangeText={(text) => setFormData({ ...formData, peopleCount: text })}
        error={errors.peopleCount}
      />

      <View className="flex-row">
        <View className="flex-1 mr-2">
          <Input
            label="Min. Toplam Kira (₺) *"
            placeholder="10000"
            keyboardType="numeric"
            value={formData.minBudget}
            onChangeText={(text) => setFormData({ ...formData, minBudget: text })}
            error={errors.minBudget}
          />
        </View>
        <View className="flex-1 ml-2">
          <Input
            label="Max. Toplam Kira (₺) *"
            placeholder="15000"
            keyboardType="numeric"
            value={formData.maxBudget}
            onChangeText={(text) => setFormData({ ...formData, maxBudget: text })}
            error={errors.maxBudget}
          />
        </View>
      </View>

      <Input
        label="İstenen Ev Metrekaresi (m²)"
        placeholder="80 (opsiyonel)"
        keyboardType="numeric"
        value={formData.desiredSquareMeters}
        onChangeText={(text) => setFormData({ ...formData, desiredSquareMeters: text })}
      />

      <Text className="text-secondary-700 font-medium mb-2">Eşya Tercihi</Text>
      <View className="flex-row mb-4">
        <SelectOption
          label="Farketmez"
          selected={formData.desiredFurnished === null}
          onSelect={() => setFormData({ ...formData, desiredFurnished: null })}
        />
        <SelectOption
          label="Eşyalı"
          selected={formData.desiredFurnished === true}
          onSelect={() => setFormData({ ...formData, desiredFurnished: true })}
        />
        <SelectOption
          label="Eşyasız"
          selected={formData.desiredFurnished === false}
          onSelect={() => setFormData({ ...formData, desiredFurnished: false })}
        />
      </View>

      <Text className="text-secondary-700 font-medium mb-2">Oda Sayısı Tercihi</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <SelectOption
          label="Farketmez"
          selected={!formData.desiredRoomCount}
          onSelect={() => setFormData({ ...formData, desiredRoomCount: '' })}
        />
        {ROOM_COUNTS.map((room) => (
          <SelectOption
            key={room.value}
            label={room.label}
            selected={formData.desiredRoomCount === room.value.toString()}
            onSelect={() => setFormData({ ...formData, desiredRoomCount: room.value.toString() })}
          />
        ))}
      </ScrollView>
    </>
  );

  const renderStep2 = () => (
    <View className="flex-1">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => setStep(1)} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-bold text-secondary-900">İlan Detayları</Text>
          <Text className="text-secondary-500">
            {searchTypeOptions.find(o => o.type === searchType)?.title}
          </Text>
        </View>
      </View>

      <Input
        label="İlan Başlığı *"
        placeholder="Örn: Kadıköy'de ev arkadaşı arıyorum"
        value={formData.title}
        onChangeText={(text) => setFormData({ ...formData, title: text })}
        error={errors.title}
      />

      <Input
        label="Açıklama *"
        placeholder="İlanınız hakkında detaylı bilgi verin... (En az 20 karakter)"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        error={errors.description}
      />

      {/* City Selection */}
      <Text className="text-secondary-700 font-medium mb-2">Şehir *</Text>
      <TouchableOpacity
        onPress={() => setShowCityModal(true)}
        className="flex-row items-center bg-secondary-50 border border-secondary-200 rounded-xl px-4 py-3 mb-1"
      >
        <Ionicons name="location-outline" size={20} color="#64748B" />
        <Text className={`flex-1 ml-3 ${formData.city ? 'text-secondary-900' : 'text-secondary-400'}`}>
          {formData.city || 'Şehir seçin'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#64748B" />
      </TouchableOpacity>
      {errors.city && <Text className="text-red-500 text-xs mb-3">{errors.city}</Text>}

      {/* District Selection */}
      <Text className="text-secondary-700 font-medium mb-2 mt-3">İlçe *</Text>
      <TouchableOpacity
        onPress={() => formData.city ? setShowDistrictModal(true) : Alert.alert('Uyarı', 'Önce şehir seçin')}
        className="flex-row items-center bg-secondary-50 border border-secondary-200 rounded-xl px-4 py-3 mb-1"
      >
        <Ionicons name="business-outline" size={20} color="#64748B" />
        <Text className={`flex-1 ml-3 ${formData.district ? 'text-secondary-900' : 'text-secondary-400'}`}>
          {formData.district || 'İlçe seçin'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#64748B" />
      </TouchableOpacity>
      {errors.district && <Text className="text-red-500 text-xs mb-3">{errors.district}</Text>}

      <Input
        label="Mahalle"
        placeholder="Mahalle adı (opsiyonel)"
        value={formData.neighborhood}
        onChangeText={(text) => setFormData({ ...formData, neighborhood: text })}
      />

      {/* Type specific fields */}
      {searchType === 'evime_arkadas' && renderEvimeArkadasForm()}
      {searchType === 'kalacak_ev' && renderKalacakEvForm()}
      {searchType === 'beraber_ev' && renderBeraberEvForm()}

      {/* Gender Preference */}
      <Text className="text-secondary-700 font-medium mb-2 mt-2">Cinsiyet Tercihi</Text>
      <View className="flex-row mb-6">
        <SelectOption
          label="Farketmez"
          selected={!formData.preferredGender}
          onSelect={() => setFormData({ ...formData, preferredGender: '' })}
        />
        {Object.entries(GENDERS).map(([key, label]) => (
          <SelectOption
            key={key}
            label={label}
            selected={formData.preferredGender === key}
            onSelect={() => setFormData({ ...formData, preferredGender: key as Gender })}
          />
        ))}
      </View>

      <Button
        title={isUploading ? 'Resimler Yükleniyor...' : 'İlanı Yayınla'}
        onPress={handleSubmit}
        isLoading={isLoading}
        disabled={isUploading}
        fullWidth
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6 pt-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 ? renderStep1() : renderStep2()}
          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* City Modal - Inline to prevent re-mounting */}
      <Modal visible={showCityModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
          <View className="flex-row items-center px-4 py-3 border-b border-secondary-100">
            <TouchableOpacity onPress={() => { setShowCityModal(false); setCitySearch(''); }} className="p-2">
              <Ionicons name="close" size={24} color="#334155" />
            </TouchableOpacity>
            <Text className="flex-1 text-lg font-semibold text-secondary-900 ml-2">Şehir Seçin</Text>
          </View>
          <View className="px-4 py-2">
            <Input
              placeholder="Şehir ara..."
              value={citySearch}
              onChangeText={setCitySearch}
              leftIcon="search-outline"
              autoFocus={false}
            />
          </View>
          <FlatList
            data={filteredCities}
            keyExtractor={(item) => item}
            renderItem={renderCityItem}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
            initialNumToRender={20}
          />
        </SafeAreaView>
      </Modal>

      {/* District Modal - Inline to prevent re-mounting */}
      <Modal visible={showDistrictModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
          <View className="flex-row items-center px-4 py-3 border-b border-secondary-100">
            <TouchableOpacity onPress={() => { setShowDistrictModal(false); setDistrictSearch(''); }} className="p-2">
              <Ionicons name="close" size={24} color="#334155" />
            </TouchableOpacity>
            <Text className="flex-1 text-lg font-semibold text-secondary-900 ml-2">İlçe Seçin</Text>
          </View>
          <View className="px-4 py-2">
            <Input
              placeholder="İlçe ara..."
              value={districtSearch}
              onChangeText={setDistrictSearch}
              leftIcon="search-outline"
              autoFocus={false}
            />
          </View>
          <FlatList
            data={filteredDistricts}
            keyExtractor={(item) => item}
            renderItem={renderDistrictItem}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
            initialNumToRender={20}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
