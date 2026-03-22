// Kullanıcı Türleri
export type UserType = 'ev_sahibi' | 'ev_arayan';

// Meslek Türleri
export type Occupation = 'ogrenci' | 'calisan' | 'emekli' | 'issiz' | 'diger';

// Medeni Durum
export type MaritalStatus = 'bekar' | 'evli';

// Cinsiyet
export type Gender = 'erkek' | 'kadin';

// Eski tipler (geriye uyumluluk)
export type UserProfile = 'ogrenci' | 'bekar' | 'evli' | 'emekli';

// Arama Türleri
export type SearchType = 'evime_arkadas' | 'kalacak_ev' | 'beraber_ev';

// Kullanıcı Arayüzü
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  age: number;
  occupation: Occupation;
  occupationOther?: string;
  maritalStatus: MaritalStatus;
  gender: Gender;
  userType: UserType;
  profileImage?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

// Kullanıcı Profil Özellikleri
export interface UserTraits {
  userId: string;
  cleanliness: number; // 1-5 temizlik
  tidiness: number; // 1-5 düzenlilik
  cooking: number; // 1-5 yemek yapma
  smoking: boolean;
  alcohol: boolean;
  pets: boolean;
  guests: boolean; // Misafir kabul
  nightOwl: boolean; // Gece kuşu
  earlyBird: boolean; // Erken kalkan
}

// Konut Arayüzü
export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  city: string;
  district: string;
  neighborhood: string;
  address?: string;
  roomCount: number;
  bathroomCount: number;
  squareMeters: number;
  floor: number;
  totalFloors: number;
  buildingAge: number;
  furnished: boolean;
  rentPrice: number;
  deposit?: number;
  bills?: number; // Aidat
  availableRooms: number;
  currentOccupants: number;
  maxOccupants: number;
  preferredGender?: Gender;
  images: string[];
  amenities: string[];
  rules?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// İlan Arayüzü
export interface Listing {
  id: string;
  userId: string;
  user?: User;
  searchType: SearchType;
  title: string;
  description: string;
  
  // Location
  city: string;
  district?: string;
  neighborhood?: string;
  
  // Pricing - different fields based on searchType
  rentPrice?: number;     // For evime_arkadas (single price)
  minBudget?: number;     // For kalacak_ev, beraber_ev
  maxBudget?: number;     // For kalacak_ev, beraber_ev
  
  // Room details
  roomCount?: number;       // Number of rooms in house (evime_arkadas)
  squareMeters?: number;    // Room/house size in m²
  furnished?: boolean;      // Is room/house furnished
  
  // For beraber_ev
  peopleCount?: number;     // How many people looking together
  
  desiredRoomCount?: number;  // Desired room count preference
  moveInDate?: string;
  duration?: number;          // Months
  preferredGender?: Gender;
  
  // Images
  images?: string[];
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mesaj Arayüzü
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// Sohbet Arayüzü
export interface Conversation {
  id: string;
  participant: {
    id: string;
    fullName: string;
    profileImage?: string | null;
  };
  lastMessage?: Message | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Favori Arayüzü
export interface Favorite {
  id: string;
  userId: string;
  propertyId?: string;
  listingId?: string;
  createdAt: string;
}

// API Yanıt Arayüzü
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Sayfalama Arayüzü
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filtre Arayüzü
export interface PropertyFilter {
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  roomCount?: number;
  gender?: Gender;
}

export interface ListingFilter {
  searchType?: SearchType;
  city?: string;
  district?: string;
  neighborhood?: string;
  minBudget?: number;
  maxBudget?: number;
  gender?: Gender;
  furnished?: string;
  minSquareMeters?: number;
  maxSquareMeters?: number;
  roomCount?: number;
  desiredRoomCount?: number;
  peopleCount?: number;
}

// Auth Arayüzleri
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  age: number;
  occupation: Occupation;
  occupationOther?: string;
  maritalStatus: MaritalStatus;
  gender: Gender;
  userType: UserType;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}
