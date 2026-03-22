import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { SendMessageInput, GetMessagesQuery } from './message.schema';

export class MessageService {
  async getConversations(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: {
        participant1: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
        participant2: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Transform to include other participant and unread count
    const transformedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipant = conv.participant1Id === userId
          ? conv.participant2
          : conv.participant1;

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            receiverId: userId,
            isRead: false,
          },
        });

        return {
          id: conv.id,
          participant: otherParticipant,
          lastMessage: conv.messages[0] || null,
          unreadCount,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        };
      })
    );

    return transformedConversations;
  }

  async getConversationById(userId: string, conversationId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: {
        participant1: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
        participant2: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new AppError('Sohbet bulunamadı', 404);
    }

    const otherParticipant = conversation.participant1Id === userId
      ? conversation.participant2
      : conversation.participant1;

    return {
      id: conversation.id,
      otherParticipant,
      createdAt: conversation.createdAt,
    };
  }

  async getMessages(userId: string, conversationId: string, query: GetMessagesQuery) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: {
        participant1: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
        participant2: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new AppError('Sohbet bulunamadı', 404);
    }

    const otherParticipant = conversation.participant1Id === userId
      ? conversation.participant2
      : conversation.participant1;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    return { 
      messages, 
      total, 
      page, 
      limit,
      otherParticipant,
    };
  }

  // Sohbet başlat veya mevcut sohbeti getir (mesaj göndermeden)
  async getOrCreateConversation(userId: string, otherUserId: string) {
    // Check if other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        fullName: true,
        profileImage: true,
      },
    });

    if (!otherUser) {
      throw new AppError('Kullanıcı bulunamadı', 404);
    }

    if (userId === otherUserId) {
      throw new AppError('Kendinizle sohbet başlatamazsınız', 400);
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: userId, participant2Id: otherUserId },
          { participant1Id: otherUserId, participant2Id: userId },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: userId,
          participant2Id: otherUserId,
        },
      });
    }

    return {
      conversationId: conversation.id,
      otherParticipant: otherUser,
    };
  }

  async sendMessage(senderId: string, data: SendMessageInput) {
    const { receiverId, content } = data;

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new AppError('Alıcı bulunamadı', 404);
    }

    if (senderId === receiverId) {
      throw new AppError('Kendinize mesaj gönderemezsiniz', 400);
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: senderId, participant2Id: receiverId },
          { participant1Id: receiverId, participant2Id: senderId },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: senderId,
          participant2Id: receiverId,
        },
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    });

    // Update conversation last message time
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }

  async markAsRead(userId: string, messageId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new AppError('Mesaj bulunamadı', 404);
    }

    if (message.receiverId !== userId) {
      throw new AppError('Bu işlem için yetkiniz yok', 403);
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });
  }

  async markConversationAsRead(userId: string, conversationId: string) {
    // Verify user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
    });

    if (!conversation) {
      throw new AppError('Sohbet bulunamadı', 404);
    }

    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    return { count };
  }
}

export const messageService = new MessageService();
