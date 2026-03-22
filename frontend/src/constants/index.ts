// API URL - Artık otomatik algılanıyor (src/config/api.ts)
// Development: Expo'nun IP'sini otomatik kullanır
// Production: .env'deki EXPO_PUBLIC_API_URL kullanılır
export { API_URL } from '../config/api';

// Uygulama Sabitleri
export const APP_NAME = 'Ev Arkadaşım';
export const APP_VERSION = '1.0.0';

// Kullanıcı Türleri
export const USER_TYPES = {
  ev_sahibi: 'Ev Sahibi',
  ev_arayan: 'Ev Arayan',
} as const;

// Meslek Seçenekleri
export const OCCUPATIONS = {
  ogrenci: 'Öğrenci',
  calisan: 'Çalışan',
  emekli: 'Emekli',
  issiz: 'İşsiz',
  diger: 'Diğer',
} as const;

// Medeni Durum
export const MARITAL_STATUS = {
  bekar: 'Bekar',
  evli: 'Evli',
} as const;

// Cinsiyet Seçenekleri (sadece 2 seçenek)
export const GENDERS = {
  erkek: 'Erkek',
  kadin: 'Kadın',
} as const;

// Eski USER_PROFILES (geriye uyumluluk için)
export const USER_PROFILES = {
  ogrenci: 'Öğrenci',
  bekar: 'Bekar',
  evli: 'Evli',
  emekli: 'Emekli',
} as const;

// Arama Türleri
export const SEARCH_TYPES = {
  evime_arkadas: 'Evime Arkadaş Arıyorum',
  kalacak_ev: 'Kalacak Ev Arıyorum',
  beraber_ev: 'Beraber Ev Arayalım',
} as const;

// Türkiye İlleri (Örnek)
export const CITIES = [
  'İstanbul',
  'Ankara',
  'İzmir',
  'Bursa',
  'Antalya',
  'Adana',
  'Konya',
  'Gaziantep',
  'Mersin',
  'Kayseri',
  'Eskişehir',
  'Samsun',
  'Denizli',
  'Trabzon',
  'Kocaeli',
] as const;

// Oda Sayıları
export const ROOM_COUNTS = [
  { value: 1, label: '1+0' },
  { value: 2, label: '1+1' },
  { value: 3, label: '2+1' },
  { value: 4, label: '3+1' },
  { value: 5, label: '4+1' },
  { value: 6, label: '5+1' },
] as const;

// Helper: roomCount değerinden oda formatı al (örn: 3 -> "2+1")
export const getRoomCountLabel = (value: number | undefined | null): string | null => {
  if (value === undefined || value === null) return null;
  const room = ROOM_COUNTS.find(r => r.value === value);
  return room ? room.label : `${value} oda`;
};

// Konut Özellikleri
export const AMENITIES = [
  'Balkon',
  'Asansör',
  'Otopark',
  'Güvenlik',
  'Havuz',
  'Spor Salonu',
  'Sauna',
  'Çocuk Oyun Alanı',
  'Bahçe',
  'Teras',
  'Klima',
  'Doğalgaz',
  'Internet',
  'Beyaz Eşya',
  'Eşyalı',
] as const;

// Renk Paleti
export const COLORS = {
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',
  secondary: '#64748B',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
} as const;

// Async Storage Keys
export const STORAGE_KEYS = {
  TOKEN: '@ev_arkadasim_token',
  REFRESH_TOKEN: '@ev_arkadasim_refresh_token',
  USER: '@ev_arkadasim_user',
  ONBOARDING_COMPLETED: '@ev_arkadasim_onboarding',
} as const;
