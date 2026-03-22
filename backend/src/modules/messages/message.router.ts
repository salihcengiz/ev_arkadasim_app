import { Router } from 'express';
import { messageController } from './message.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import {
  sendMessageSchema,
  getConversationParamsSchema,
  getMessagesQuerySchema,
  markAsReadSchema,
} from './message.schema';

const router = Router();

// All routes are protected
router.use(authenticate);

// Conversations
router.get('/conversations', messageController.getConversations);
router.post('/conversations/start/:otherUserId', messageController.startConversation);
router.get('/conversations/:conversationId', validate(getMessagesQuerySchema), messageController.getMessages);
router.put('/conversations/:conversationId/read', validate(getConversationParamsSchema), messageController.markConversationAsRead);

// Messages
router.post('/', validate(sendMessageSchema), messageController.sendMessage);
router.put('/:messageId/read', validate(markAsReadSchema), messageController.markAsRead);

// Unread count
router.get('/unread/count', messageController.getUnreadCount);

export default router;
