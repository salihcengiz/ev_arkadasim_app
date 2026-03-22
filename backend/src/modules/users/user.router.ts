import { Router } from 'express';
import { userController } from './user.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import {
  updateProfileSchema,
  updateTraitsSchema,
  changePasswordSchema,
  getUserParamsSchema,
} from './user.schema';

const router = Router();

// Protected routes
router.get('/profile', authenticate, userController.getMyProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), userController.updateProfile);
router.post('/profile/image', authenticate, userController.updateProfileImage);

router.get('/traits', authenticate, userController.getMyTraits);
router.put('/traits', authenticate, validate(updateTraitsSchema), userController.updateTraits);

router.put('/password', authenticate, validate(changePasswordSchema), userController.changePassword);
router.delete('/account', authenticate, userController.deleteAccount);

// Public routes (with userId param)
router.get('/:id', validate(getUserParamsSchema), userController.getProfile);
router.get('/:id/traits', validate(getUserParamsSchema), userController.getTraits);

export default router;
