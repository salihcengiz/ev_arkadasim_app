import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Avatar } from '../../src/components';
import { userService } from '../../src/services';
import { useAuthStore } from '../../src/store/authStore';
import { USER_TYPES, OCCUPATIONS, MARITAL_STATUS, GENDERS } from '../../src/constants';
import type { UserType, Occupation, MaritalStatus, Gender } from '../../src/types';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    age: user?.age?.toString() || '',
    occupation: user?.occupation as Occupation || '' as Occupation,
    occupationOther: user?.occupationOther || '',
    maritalStatus: user?.maritalStatus as MaritalStatus || '' as MaritalStatus,
    gender: user?.gender as Gender || '' as Gender,
    userType: user?.userType as UserType || 'ev_arayan' as UserType,
  });

  const handleSave = async () => {
    if (!formData.fullName || formData.fullName.length < 2) {
      Alert.alert('Hata', 'Ad soyad en az 2 karakter olmalı');
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        bio: formData.bio || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        occupation: formData.occupation || undefined,
        occupationOther: formData.occupationOther || undefined,
        maritalStatus: formData.maritalStatus || undefined,
        gender: formData.gender || undefined,
        userType: formData.userType,
      };

      const response = await userService.updateProfile(updateData);
      
      if (response.success && response.data) {
        setUser(response.data);
        Alert.alert('Başarılı', 'Profiliniz güncellendi', [
          { text: 'Tamam', onPress: () => router.back() },
        ]);
      }
    } catch (err: any) {
      console.log('Update profile error:', err);
      Alert.alert('Hata', err.response?.data?.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const SelectOption = ({ 
    label, value, selected, onSelect 
  }: { 
    label: string; value: string; selected: boolean; onSelect: () => void;
  }) => (
    <TouchableOpacity
      onPress={onSelect}
      className={`py-2 px-4 rounded-xl border-2 mr-2 mb-2 ${
        selected ? 'border-primary-600 bg-primary-50' : 'border-secondary-200 bg-white'
      }`}
    >
      <Text className={`text-center font-medium ${
        selected ? 'text-primary-600' : 'text-secondary-600'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-secondary-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="close" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-secondary-900 ml-2">
          Profili Düzenle
        </Text>
        <TouchableOpacity 
          onPress={handleSave}
          disabled={isLoading}
          className="p-2"
        >
          <Text className="text-primary-600 font-semibold">
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-6 pt-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View className="items-center mb-6">
            <Avatar
              name={formData.fullName || user?.fullName}
              source={user?.profileImage || undefined}
              size="xl"
            />
            <TouchableOpacity className="mt-3">
              <Text className="text-primary-600 font-medium">Fotoğraf Değiştir</Text>
            </TouchableOpacity>
          </View>

          <Input
            label="Ad Soyad *"
            placeholder="Adınız Soyadınız"
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
          />

          <Input
            label="Telefon"
            placeholder="5XX XXX XX XX"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
          />

          <Input
            label="Yaş"
            placeholder="25"
            keyboardType="number-pad"
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
          />

          <Input
            label="Hakkımda"
            placeholder="Kendinizi kısaca tanıtın..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
          />

          <Text className="text-secondary-700 font-medium mb-2 mt-2">Ne Arıyorsunuz?</Text>
          <View className="flex-row flex-wrap mb-4">
            {Object.entries(USER_TYPES).map(([key, label]) => (
              <SelectOption
                key={key}
                label={label}
                value={key}
                selected={formData.userType === key}
                onSelect={() => setFormData({ ...formData, userType: key as UserType })}
              />
            ))}
          </View>

          <Text className="text-secondary-700 font-medium mb-2">Cinsiyet</Text>
          <View className="flex-row flex-wrap mb-4">
            {Object.entries(GENDERS).map(([key, label]) => (
              <SelectOption
                key={key}
                label={label}
                value={key}
                selected={formData.gender === key}
                onSelect={() => setFormData({ ...formData, gender: key as Gender })}
              />
            ))}
          </View>

          <Text className="text-secondary-700 font-medium mb-2">Medeni Durum</Text>
          <View className="flex-row flex-wrap mb-4">
            {Object.entries(MARITAL_STATUS).map(([key, label]) => (
              <SelectOption
                key={key}
                label={label}
                value={key}
                selected={formData.maritalStatus === key}
                onSelect={() => setFormData({ ...formData, maritalStatus: key as MaritalStatus })}
              />
            ))}
          </View>

          <Text className="text-secondary-700 font-medium mb-2">Meslek</Text>
          <View className="flex-row flex-wrap mb-2">
            {Object.entries(OCCUPATIONS).map(([key, label]) => (
              <SelectOption
                key={key}
                label={label}
                value={key}
                selected={formData.occupation === key}
                onSelect={() => setFormData({ ...formData, occupation: key as Occupation })}
              />
            ))}
          </View>

          {formData.occupation === 'diger' && (
            <Input
              label="Mesleğinizi Belirtin"
              placeholder="Mesleğiniz"
              value={formData.occupationOther}
              onChangeText={(text) => setFormData({ ...formData, occupationOther: text })}
            />
          )}

          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
