import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Geçerli bir e-posta adresi girin'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
    fullName: z.string().min(2, 'İsim en az 2 karakter olmalı'),
    phone: z.string().min(10, 'Geçerli bir telefon numarası girin'),
    age: z.number().min(18, 'Yaş en az 18 olmalı').max(100, 'Yaş en fazla 100 olmalı'),
    occupation: z.enum(['ogrenci', 'calisan', 'emekli', 'issiz', 'diger']),
    occupationOther: z.string().optional(),
    maritalStatus: z.enum(['bekar', 'evli']),
    gender: z.enum(['erkek', 'kadin']),
    userType: z.enum(['ev_sahibi', 'ev_arayan']),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Geçerli bir e-posta adresi girin'),
    password: z.string().min(1, 'Şifre gerekli'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token gerekli'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Geçerli bir e-posta adresi girin'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token gerekli'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
