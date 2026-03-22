# 🏠 Ev Arkadaşım (My Flatmate)

A mobile application designed to help students and young professionals find flatmates or shared accommodations. Built with React Native (Expo) and Express.js.

---

## 📱 Features

### Listing Types
- **"Evime Arkadaş Arıyorum" (Looking for a Flatmate)**: Post your room/house with photos, rent price, and details
- **"Kalacak Ev Arıyorum" (Looking for a Place)**: Share your preferences and budget range
- **"Beraber Ev Arayalım" (Let's Find Together)**: Find people to search for a place together

### Core Features
- 📝 Create and manage listings with photos
- 🔍 Search and filter listings by city, district, type, and more
- 💬 Real-time messaging between users
- 👤 User profiles with detailed information
- 🏷️ Categorized listing display on home page
- 📍 Location-based filtering (81 cities of Turkey)

---

## 🛠️ Tech Stack

### Frontend
- **React Native** with **Expo Go**
- **TypeScript**
- **NativeWind** (Tailwind CSS for React Native)
- **Expo Router** (file-based routing)
- **Zustand** (state management)
- **React Hook Form** + **Zod** (form validation)
- **Axios** (HTTP client)

### Backend
- **Node.js** with **Express.js**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **JWT Authentication**
- **Multer** (file uploads)

---

## 📁 Project Structure

```
ev_arkadasim_app/
├── frontend/                # React Native Expo app
│   ├── app/                 # Expo Router pages
│   │   ├── (auth)/          # Authentication screens
│   │   ├── (tabs)/          # Tab navigation screens
│   │   ├── chat/            # Chat screens
│   │   ├── listing/         # Listing detail screens
│   │   ├── settings/        # Settings screens
│   │   └── user/            # User profile screens
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── config/          # App configuration
│   │   ├── constants/       # Constants and enums
│   │   ├── services/        # API services
│   │   ├── store/           # Zustand stores
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/           # Utility functions
│   └── ...
├── backend/                 # Express.js API server
│   ├── prisma/              # Prisma schema and migrations
│   ├── src/
│   │   ├── config/          # Database and app config
│   │   ├── middleware/      # Express middlewares
│   │   ├── modules/         # Feature modules
│   │   │   ├── auth/        # Authentication
│   │   │   ├── listings/    # Listings CRUD
│   │   │   ├── messages/    # Messaging system
│   │   │   ├── uploads/     # File uploads
│   │   │   └── users/       # User management
│   │   └── utils/           # Utility functions
│   └── uploads/             # Uploaded images
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Expo Go app on your mobile device
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ev_arkadasim"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Start Expo:
```bash
npm start
```

4. Scan QR code with Expo Go app on your phone

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/:id` - Get listing by ID
- `GET /api/listings/my` - Get user's listings
- `POST /api/listings` - Create listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/conversations/:id` - Get messages
- `POST /api/messages` - Send message
- `POST /api/messages/conversations/start/:userId` - Start conversation

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile

### Uploads
- `POST /api/uploads/images` - Upload images

---

## 📸 Screenshots

*Coming soon...*

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

---

# 🏠 Ev Arkadaşım

Öğrencilerin ve genç profesyonellerin ev arkadaşı veya paylaşımlı konaklama bulmasına yardımcı olmak için tasarlanmış bir mobil uygulama. React Native (Expo) ve Express.js ile geliştirilmiştir.

---

## 📱 Özellikler

### İlan Türleri
- **"Evime Arkadaş Arıyorum"**: Odanızı/evinizi fotoğraflar, kira bedeli ve detaylarla ilan edin
- **"Kalacak Ev Arıyorum"**: Tercihlerinizi ve bütçe aralığınızı paylaşın
- **"Beraber Ev Arayalım"**: Birlikte ev arayacak insanlar bulun

### Temel Özellikler
- 📝 Fotoğraflı ilan oluşturma ve yönetme
- 🔍 Şehir, ilçe, tür ve daha fazlasına göre arama ve filtreleme
- 💬 Kullanıcılar arası gerçek zamanlı mesajlaşma
- 👤 Detaylı bilgilerle kullanıcı profilleri
- 🏷️ Ana sayfada kategorize edilmiş ilan görünümü
- 📍 Konum bazlı filtreleme (Türkiye'nin 81 ili)

---

## 🛠️ Teknoloji Yığını

### Frontend
- **React Native** ve **Expo Go**
- **TypeScript**
- **NativeWind** (React Native için Tailwind CSS)
- **Expo Router** (dosya tabanlı yönlendirme)
- **Zustand** (durum yönetimi)
- **React Hook Form** + **Zod** (form doğrulama)
- **Axios** (HTTP istemcisi)

### Backend
- **Node.js** ve **Express.js**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **JWT Kimlik Doğrulama**
- **Multer** (dosya yükleme)

---

## 📁 Proje Yapısı

```
ev_arkadasim_app/
├── frontend/                # React Native Expo uygulaması
│   ├── app/                 # Expo Router sayfaları
│   │   ├── (auth)/          # Kimlik doğrulama ekranları
│   │   ├── (tabs)/          # Tab navigasyon ekranları
│   │   ├── chat/            # Sohbet ekranları
│   │   ├── listing/         # İlan detay ekranları
│   │   ├── settings/        # Ayarlar ekranları
│   │   └── user/            # Kullanıcı profil ekranları
│   ├── src/
│   │   ├── components/      # Yeniden kullanılabilir UI bileşenleri
│   │   ├── config/          # Uygulama yapılandırması
│   │   ├── constants/       # Sabitler ve enum'lar
│   │   ├── services/        # API servisleri
│   │   ├── store/           # Zustand store'ları
│   │   ├── types/           # TypeScript arayüzleri
│   │   └── utils/           # Yardımcı fonksiyonlar
│   └── ...
├── backend/                 # Express.js API sunucusu
│   ├── prisma/              # Prisma şeması ve migrasyonlar
│   ├── src/
│   │   ├── config/          # Veritabanı ve uygulama yapılandırması
│   │   ├── middleware/      # Express middleware'leri
│   │   ├── modules/         # Özellik modülleri
│   │   │   ├── auth/        # Kimlik doğrulama
│   │   │   ├── listings/    # İlan CRUD işlemleri
│   │   │   ├── messages/    # Mesajlaşma sistemi
│   │   │   ├── uploads/     # Dosya yükleme
│   │   │   └── users/       # Kullanıcı yönetimi
│   │   └── utils/           # Yardımcı fonksiyonlar
│   └── uploads/             # Yüklenen görseller
└── README.md
```

---

## 🚀 Başlangıç

### Gereksinimler
- Node.js (v18+)
- PostgreSQL
- Mobil cihazınızda Expo Go uygulaması
- npm veya yarn

### Backend Kurulumu

1. Backend dizinine gidin:
```bash
cd backend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyası oluşturun:
```env
DATABASE_URL="postgresql://kullaniciadi:sifre@localhost:5432/ev_arkadasim"
JWT_SECRET="gizli-anahtariniz"
JWT_EXPIRES_IN="7d"
PORT=3000
```

4. Veritabanı migrasyonlarını çalıştırın:
```bash
npx prisma migrate dev
```

5. Sunucuyu başlatın:
```bash
npm run dev
```

### Frontend Kurulumu

1. Frontend dizinine gidin:
```bash
cd frontend
```

2. Bağımlılıkları yükleyin:
```bash
npm install --legacy-peer-deps
```

3. Expo'yu başlatın:
```bash
npm start
```

4. Telefonunuzdaki Expo Go uygulaması ile QR kodu tarayın

---

## 📡 API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Mevcut kullanıcıyı getir

### İlanlar
- `GET /api/listings` - Tüm ilanları getir (filtrelerle)
- `GET /api/listings/:id` - ID'ye göre ilan getir
- `GET /api/listings/my` - Kullanıcının ilanlarını getir
- `POST /api/listings` - İlan oluştur
- `PUT /api/listings/:id` - İlan güncelle
- `DELETE /api/listings/:id` - İlan sil

### Mesajlar
- `GET /api/messages/conversations` - Sohbetleri getir
- `GET /api/messages/conversations/:id` - Mesajları getir
- `POST /api/messages` - Mesaj gönder
- `POST /api/messages/conversations/start/:userId` - Sohbet başlat

### Kullanıcılar
- `GET /api/users/:id` - Kullanıcı profilini getir
- `PUT /api/users/profile` - Profil güncelle

### Yüklemeler
- `POST /api/uploads/images` - Görsel yükle

---

## 📸 Ekran Görüntüleri

*Yakında eklenecek...*

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Pull Request göndermekten çekinmeyin.

---

## 📄 Lisans

Bu proje açık kaynaklıdır ve [MIT Lisansı](LICENSE) altında kullanılabilir.
