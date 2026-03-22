import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().min(1, 'Alıcı ID gerekli'),
    content: z.string().min(1, 'Mesaj içeriği gerekli').max(1000, 'Mesaj en fazla 1000 karakter olabilir'),
  }),
});

export const getConversationParamsSchema = z.object({
  params: z.object({
    conversationId: z.string().min(1, 'Sohbet ID gerekli'),
  }),
});

export const getMessagesQuerySchema = z.object({
  params: z.object({
    conversationId: z.string().min(1, 'Sohbet ID gerekli'),
  }),
  query: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('50'),
  }),
});

export const markAsReadSchema = z.object({
  params: z.object({
    messageId: z.string().min(1, 'Mesaj ID gerekli'),
  }),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>['body'];
export type GetMessagesQuery = z.infer<typeof getMessagesQuerySchema>['query'];
