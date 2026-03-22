import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'İsim en az 2 karakter olmalı').optional(),
    phone: z.string().optional(),
    age: z.number().min(18).max(100).optional(),
    gender: z.enum(['erkek', 'kadin']).optional(),
    userType: z.enum(['ev_sahibi', 'ev_arayan']).optional(),
    occupation: z.enum(['ogrenci', 'calisan', 'emekli', 'issiz', 'diger']).optional(),
    occupationOther: z.string().optional(),
    maritalStatus: z.enum(['bekar', 'evli']).optional(),
    bio: z.string().max(500, 'Biyografi en fazla 500 karakter olabilir').optional(),
  }),
});

export const updateTraitsSchema = z.object({
  body: z.object({
    cleanliness: z.number().min(1).max(5).optional(),
    tidiness: z.number().min(1).max(5).optional(),
    cooking: z.number().min(1).max(5).optional(),
    smoking: z.boolean().optional(),
    alcohol: z.boolean().optional(),
    pets: z.boolean().optional(),
    guests: z.boolean().optional(),
    nightOwl: z.boolean().optional(),
    earlyBird: z.boolean().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Mevcut şifre gerekli'),
    newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalı'),
  }),
});

export const getUserParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Kullanıcı ID gerekli'),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type UpdateTraitsInput = z.infer<typeof updateTraitsSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
