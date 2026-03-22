import { z } from 'zod';

export const createPropertySchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Başlık en az 5 karakter olmalı'),
    description: z.string().min(20, 'Açıklama en az 20 karakter olmalı'),
    city: z.string().min(2, 'Şehir gerekli'),
    district: z.string().min(2, 'İlçe gerekli'),
    neighborhood: z.string().optional(),
    address: z.string().optional(),
    roomCount: z.number().min(1, 'Oda sayısı en az 1 olmalı'),
    bathroomCount: z.number().min(1).optional(),
    squareMeters: z.number().min(10, 'Metrekare en az 10 olmalı'),
    floor: z.number().optional(),
    totalFloors: z.number().optional(),
    buildingAge: z.number().optional(),
    furnished: z.boolean().optional(),
    rentPrice: z.number().min(1, 'Kira bedeli gerekli'),
    deposit: z.number().optional(),
    bills: z.number().optional(),
    availableRooms: z.number().min(1).optional(),
    currentOccupants: z.number().min(0).optional(),
    maxOccupants: z.number().min(1).optional(),
    preferredGender: z.enum(['erkek', 'kadin', 'belirtilmemis']).optional(),
    preferredProfile: z.enum(['ogrenci', 'bekar', 'evli', 'emekli']).optional(),
    amenities: z.array(z.string()).optional(),
    rules: z.array(z.string()).optional(),
  }),
});

export const updatePropertySchema = z.object({
  body: createPropertySchema.shape.body.partial(),
  params: z.object({
    id: z.string().min(1, 'Konut ID gerekli'),
  }),
});

export const getPropertyParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Konut ID gerekli'),
  }),
});

export const listPropertiesSchema = z.object({
  query: z.object({
    city: z.string().optional(),
    district: z.string().optional(),
    minPrice: z.string().transform(Number).optional(),
    maxPrice: z.string().transform(Number).optional(),
    roomCount: z.string().transform(Number).optional(),
    gender: z.enum(['erkek', 'kadin', 'belirtilmemis']).optional(),
    profile: z.enum(['ogrenci', 'bekar', 'evli', 'emekli']).optional(),
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('10'),
  }),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>['body'];
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>['body'];
export type ListPropertiesQuery = z.infer<typeof listPropertiesSchema>['query'];
