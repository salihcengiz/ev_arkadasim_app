import { Router } from 'express';
import { propertyController } from './property.controller';
import { validate } from '../../middleware/validate';
import { authenticate, optionalAuth } from '../../middleware/auth';
import {
  createPropertySchema,
  updatePropertySchema,
  getPropertyParamsSchema,
  listPropertiesSchema,
} from './property.schema';

const router = Router();

// Public routes
router.get('/', validate(listPropertiesSchema), propertyController.findAll);
router.get('/:id', validate(getPropertyParamsSchema), propertyController.findById);

// Protected routes
router.post('/', authenticate, validate(createPropertySchema), propertyController.create);
router.get('/my', authenticate, propertyController.findMyProperties);
router.put('/:id', authenticate, validate(updatePropertySchema), propertyController.update);
router.delete('/:id', authenticate, validate(getPropertyParamsSchema), propertyController.delete);
router.post('/:id/images', authenticate, validate(getPropertyParamsSchema), propertyController.uploadImage);

export default router;
