import api from './api';
import { Message, Conversation, ApiResponse, PaginatedResponse } from '../types';

const MESSAGE_ENDPOINT = '/messages';

export const messageService = {
  /**
   * Sohbetleri listele
   */
  getConversations: async (): Promise<ApiResponse<Conversation[]>> => {
    const response = await api.get(`${MESSAGE_ENDPOINT}/conversations`);
    return response.data;
  },

  /**
   * Sohbet mesajlarını getir
   */
  getMessages: async (
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<ApiResponse<PaginatedResponse<Message>>> => {
    const response = await api.get(`${MESSAGE_ENDPOINT}/conversations/${conversationId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Mesaj gönder
   */
  sendMessage: async (receiverId: string, content: string): Promise<ApiResponse<Message>> => {
    const response = await api.post(MESSAGE_ENDPOINT, { receiverId, content });
    return response.data;
  },

  /**
   * Sohbet başlat veya mevcut sohbeti getir (mesaj göndermeden)
   */
  startConversation: async (otherUserId: string): Promise<ApiResponse<{ conversationId: string; otherParticipant: any }>> => {
    const response = await api.post(`${MESSAGE_ENDPOINT}/conversations/start/${otherUserId}`);
    return response.data;
  },

  /**
   * Mesajı okundu olarak işaretle
   */
  markAsRead: async (messageId: string): Promise<ApiResponse<null>> => {
    const response = await api.put(`${MESSAGE_ENDPOINT}/${messageId}/read`);
    return response.data;
  },

  /**
   * Sohbetteki tüm mesajları okundu olarak işaretle
   */
  markConversationAsRead: async (conversationId: string): Promise<ApiResponse<null>> => {
    const response = await api.put(`${MESSAGE_ENDPOINT}/conversations/${conversationId}/read`);
    return response.data;
  },

  /**
   * Okunmamış mesaj sayısı
   */
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await api.get(`${MESSAGE_ENDPOINT}/unread/count`);
    return response.data;
  },
};
