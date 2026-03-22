import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '../../src/components';
import { useAuthStore } from '../../src/store/authStore';
import { USER_TYPES, OCCUPATIONS, MARITAL_STATUS, GENDERS } from '../../src/constants';
import type { UserType, Occupation, MaritalStatus, Gender } from '../../src/types';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalı'),
  email: z.string().min(1, 'E-posta gerekli').email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  confirmPassword: z.string().min(1, 'Şifre tekrarı gerekli'),
  phone: z.string().min(10, 'Geçerli bir telefon numarası girin').max(11, 'Geçerli bir telefon numarası girin'),
  age: z.string().min(1, 'Yaş gerekli').refine((val) => {
    const num = parseInt(val, 10);
    return num >= 18 && num <= 100;
  }, 'Yaş 18-100 arasında olmalı'),
  occupation: z.enum(['ogrenci', 'calisan', 'emekli', 'issiz', 'diger'], {
    message: 'Meslek seçimi gerekli'
  }),
  occupationOther: z.string().optional(),
  maritalStatus: z.enum(['bekar', 'evli'], {
    message: 'Medeni durum seçimi gerekli'
  }),
  gender: z.enum(['erkek', 'kadin'], {
    message: 'Cinsiyet seçimi gerekli'
  }),
  userType: z.enum(['ev_sahibi', 'ev_arayan']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.occupation === 'diger') {
    return data.occupationOther && data.occupationOther.length >= 2;
  }
  return true;
}, {
  message: 'Mesleğinizi belirtin',
  path: ['occupationOther'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const [step, setStep] = useState(1);

  useEffect(() => {
    clearError();
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      age: '',
      occupation: undefined,
      occupationOther: '',
      maritalStatus: undefined,
      gender: undefined,
      userType: 'ev_arayan',
    },
  });

  const watchOccupation = watch('occupation');

  const onSubmit = async (data: RegisterFormData) => {
    console.log('=== FORM SUBMIT CALLED ===');
    console.log('Form data:', JSON.stringify(data, null, 2));
    
    clearError();
    const { confirmPassword, age, ...rest } = data;
    const registerData = {
      ...rest,
      age: parseInt(age, 10),
    };
    
    console.log('Register data to send:', JSON.stringify(registerData, null, 2));
    
    const success = await registerUser(registerData);
    console.log('Register result:', success);
    
    if (success) {
      router.replace('/(tabs)/home');
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = ['fullName', 'email', 'password', 'confirmPassword'] as const;
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(2);
  };

  const handleGoBack = () => {
    clearError();
    if (step === 1) {
      router.back();
    } else {
      setStep(step - 1);
    }
  };

  const handleNavigateToLogin = () => {
    clearError();
    router.push('/(auth)/login');
  };

  const SelectOption = ({ 
    label, 
    value, 
    selected, 
    onSelect 
  }: { 
    label: string; 
    value: string; 
    selected: boolean; 
    onSelect: () => void;
  }) => (
    <TouchableOpacity
      onPress={onSelect}
      className={`py-3 px-4 rounded-xl border-2 mr-2 mb-2 ${
        selected ? 'border-primary-600 bg-primary-50' : 'border-secondary-200 bg-white'
      }`}
    >
      <Text
        className={`text-center font-medium ${
          selected ? 'text-primary-600' : 'text-secondary-600'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="px-6 pt-4 flex-row items-center">
            <TouchableOpacity
              onPress={handleGoBack}
              className="w-10 h-10 rounded-full bg-secondary-100 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="#334155" />
            </TouchableOpacity>
            <View className="flex-1 flex-row justify-center mr-10">
              <View className={`w-3 h-3 rounded-full mx-1 ${step >= 1 ? 'bg-primary-600' : 'bg-secondary-200'}`} />
              <View className={`w-3 h-3 rounded-full mx-1 ${step >= 2 ? 'bg-primary-600' : 'bg-secondary-200'}`} />
            </View>
          </View>

          {/* Content */}
          <View className="flex-1 px-6 pt-8">
            {error && (
              <View className="bg-red-50 border border-red-400 rounded-xl p-4 mb-6">
                <Text className="text-red-600">{error}</Text>
              </View>
            )}

            {/* STEP 1 - Hesap Oluştur - Her zaman render et ama gizle */}
            <View style={{ display: step === 1 ? 'flex' : 'none' }}>
              <Text className="text-3xl font-bold text-secondary-900 mb-2">
                Hesap Oluştur
              </Text>
              <Text className="text-secondary-500 text-base mb-8">
                Temel bilgilerinizi girin
              </Text>

              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Ad Soyad *"
                    placeholder="Adınız Soyadınız"
                    autoComplete="name"
                    leftIcon="person-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.fullName?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="E-posta *"
                    placeholder="ornek@email.com"
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
                    label="Şifre *"
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

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Şifre Tekrar *"
                    placeholder="••••••••"
                    isPassword
                    leftIcon="lock-closed-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message}
                  />
                )}
              />

              <Button
                title="Devam Et"
                onPress={nextStep}
                fullWidth
                className="mt-4"
              />

              <View className="flex-row justify-center mt-6">
                <Text className="text-secondary-500">Zaten hesabınız var mı? </Text>
                <TouchableOpacity onPress={handleNavigateToLogin}>
                  <Text className="text-primary-600 font-semibold">Giriş Yap</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* STEP 2 - Profil Bilgileri - Her zaman render et ama gizle */}
            <View style={{ display: step === 2 ? 'flex' : 'none' }}>
              <Text className="text-3xl font-bold text-secondary-900 mb-2">
                Profil Bilgileri
              </Text>
              <Text className="text-secondary-500 text-base mb-6">
                Sizi daha iyi tanıyalım
              </Text>

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Telefon Numarası *"
                    placeholder="5XX XXX XX XX"
                    keyboardType="phone-pad"
                    leftIcon="call-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.phone?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="age"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Yaş *"
                    placeholder="25"
                    keyboardType="number-pad"
                    leftIcon="calendar-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.age?.message}
                  />
                )}
              />

              <Text className="text-secondary-700 font-medium mb-3">Cinsiyet *</Text>
              <Controller
                control={control}
                name="gender"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row flex-wrap mb-2">
                    {Object.entries(GENDERS).map(([key, label]) => (
                      <SelectOption
                        key={key}
                        label={label}
                        value={key}
                        selected={value === key}
                        onSelect={() => onChange(key as Gender)}
                      />
                    ))}
                  </View>
                )}
              />
              {errors.gender && (
                <Text className="text-red-500 text-xs mb-4">{errors.gender.message}</Text>
              )}

              <Text className="text-secondary-700 font-medium mb-3 mt-2">Medeni Durum *</Text>
              <Controller
                control={control}
                name="maritalStatus"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row flex-wrap mb-2">
                    {Object.entries(MARITAL_STATUS).map(([key, label]) => (
                      <SelectOption
                        key={key}
                        label={label}
                        value={key}
                        selected={value === key}
                        onSelect={() => onChange(key as MaritalStatus)}
                      />
                    ))}
                  </View>
                )}
              />
              {errors.maritalStatus && (
                <Text className="text-red-500 text-xs mb-4">{errors.maritalStatus.message}</Text>
              )}

              <Text className="text-secondary-700 font-medium mb-3 mt-2">Meslek *</Text>
              <Controller
                control={control}
                name="occupation"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row flex-wrap mb-2">
                    {Object.entries(OCCUPATIONS).map(([key, label]) => (
                      <SelectOption
                        key={key}
                        label={label}
                        value={key}
                        selected={value === key}
                        onSelect={() => onChange(key as Occupation)}
                      />
                    ))}
                  </View>
                )}
              />
              {errors.occupation && (
                <Text className="text-red-500 text-xs mb-2">{errors.occupation.message}</Text>
              )}

              {watchOccupation === 'diger' && (
                <Controller
                  control={control}
                  name="occupationOther"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Mesleğinizi Belirtin *"
                      placeholder="Mesleğiniz"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.occupationOther?.message}
                    />
                  )}
                />
              )}

              <Text className="text-secondary-700 font-medium mb-3 mt-4">Ne Arıyorsunuz? *</Text>
              <Controller
                control={control}
                name="userType"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row flex-wrap mb-6">
                    {Object.entries(USER_TYPES).map(([key, label]) => (
                      <SelectOption
                        key={key}
                        label={label}
                        value={key}
                        selected={value === key}
                        onSelect={() => onChange(key as UserType)}
                      />
                    ))}
                  </View>
                )}
              />

              <Button
                title="Kayıt Ol"
                onPress={handleSubmit(onSubmit)}
                isLoading={isLoading}
                fullWidth
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
