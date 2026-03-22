import { z } from 'zod';

// Base listing fields
const baseListingFields = {
  title: z.string().min(5, 'Başlık en az 5 karakter olmalı'),
  description: z.string().min(20, 'Açıklama en az 20 karakter olmalı'),
  city: z.string().min(2, 'Şehir gerekli'),
  district: z.string().min(2, 'İlçe gerekli'),
  neighborhood: z.string().optional(),
  preferredGender: z.enum(['erkek', 'kadin']).optional(),
  images: z.array(z.string()).optional(),
};

// Evime Arkadaş Arıyorum - requires single price, room details
const evimeArkadasFields = {
  ...baseListingFields,
  searchType: z.literal('evime_arkadas'),
  rentPrice: z.number().min(1, 'Kira bedeli gerekli'),
  roomCount: z.number().min(1, 'Oda sayısı gerekli'),
  squareMeters: z.number().min(1, 'Metrekare gerekli'),
  furnished: z.boolean(),
};

// Kalacak Ev Arıyorum - requires min/max budget
const kalacakEvFields = {
  ...baseListingFields,
  searchType: z.literal('kalacak_ev'),
  minBudget: z.number().min(0, 'Minimum bütçe gerekli'),
  maxBudget: z.number().min(0, 'Maksimum bütçe gerekli'),
  squareMeters: z.number().optional(),
  furnished: z.boolean().optional(),
  desiredRoomCount: z.number().optional(),
};

// Beraber Ev Arayalım - requires people count, min/max budget
const beraberEvFields = {
  ...baseListingFields,
  searchType: z.literal('beraber_ev'),
  minBudget: z.number().min(0, 'Minimum bütçe gerekli'),
  maxBudget: z.number().min(0, 'Maksimum bütçe gerekli'),
  peopleCount: z.number().min(1, 'Kişi sayısı gerekli'),
  squareMeters: z.number().optional(),
  furnished: z.boolean().optional(),
  desiredRoomCount: z.number().optional(),
};

export const createListingSchema = z.object({
  body: z.discriminatedUnion('searchType', [
    z.object(evimeArkadasFields),
    z.object(kalacakEvFields),
    z.object(beraberEvFields),
  ]),
});

export const updateListingSchema = z.object({
  body: z.object({
    title: z.string().min(5).optional(),
    description: z.string().min(20).optional(),
    city: z.string().min(2).optional(),
    district: z.string().min(2).optional(),
    neighborhood: z.string().optional(),
    rentPrice: z.number().min(1).optional(),
    minBudget: z.number().min(0).optional(),
    maxBudget: z.number().min(0).optional(),
    roomCount: z.number().min(1).optional(),
    squareMeters: z.number().min(1).optional(),
    furnished: z.boolean().optional(),
    peopleCount: z.number().min(1).optional(),
    desiredRoomCount: z.number().optional(),
    preferredGender: z.enum(['erkek', 'kadin']).optional(),
    images: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'İlan ID gerekli'),
  }),
});

export const getListingParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'İlan ID gerekli'),
  }),
});

export const listListingsSchema = z.object({
  query: z.object({
    searchType: z.enum(['evime_arkadas', 'kalacak_ev', 'beraber_ev']).optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    neighborhood: z.string().optional(),
    minBudget: z.string().transform(Number).optional(),
    maxBudget: z.string().transform(Number).optional(),
    gender: z.enum(['erkek', 'kadin']).optional(),
    furnished: z.string().optional(),
    minSquareMeters: z.string().transform(Number).optional(),
    maxSquareMeters: z.string().transform(Number).optional(),
    roomCount: z.string().transform(Number).optional(),
    desiredRoomCount: z.string().transform(Number).optional(),
    peopleCount: z.string().transform(Number).optional(),
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('10'),
  }),
});

export type CreateListingInput = z.infer<typeof createListingSchema>['body'];
export type UpdateListingInput = z.infer<typeof updateListingSchema>['body'];
export type ListListingsQuery = z.infer<typeof listListingsSchema>['query'];
