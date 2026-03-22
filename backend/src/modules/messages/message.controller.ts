import { Request, Response, NextFunction } from 'express';
import { messageService } from './message.service';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { SendMessageInput, GetMessagesQuery } from './message.schema';

export class MessageController {
  async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const conversations = await messageService.getConversations(userId);
      sendSuccess(res, conversations);
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;
      const query = req.query as unknown as GetMessagesQuery;
      const { messages, total, page, limit, otherParticipant } = await messageService.getMessages(userId, conversationId, query);
      
      // Custom response with otherParticipant included
      const totalPages = Math.ceil(total / limit);
      res.status(200).json({
        success: true,
        data: {
          items: messages,
          total,
          page,
          limit,
          totalPages,
          otherParticipant,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const senderId = req.user!.id;
      const data: SendMessageInput = req.body;
      const message = await messageService.sendMessage(senderId, data);
      sendSuccess(res, message, 'Mesaj gönderildi');
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { messageId } = req.params;
      await messageService.markAsRead(userId, messageId);
      sendSuccess(res, null, 'Mesaj okundu olarak işaretlendi');
    } catch (error) {
      next(error);
    }
  }

  async markConversationAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;
      await messageService.markConversationAsRead(userId, conversationId);
      sendSuccess(res, null, 'Tüm mesajlar okundu olarak işaretlendi');
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await messageService.getUnreadCount(userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async startConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { otherUserId } = req.params;
      const result = await messageService.getOrCreateConversation(userId, otherUserId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const messageController = new MessageController();
