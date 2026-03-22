import { Router } from 'express';
import { listingController } from './listing.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import {
  createListingSchema,
  updateListingSchema,
  getListingParamsSchema,
  listListingsSchema,
} from './listing.schema';

const router = Router();

// Protected routes - /my MUST come before /:id
router.get('/my', authenticate, listingController.findMyListings);
router.post('/', authenticate, validate(createListingSchema), listingController.create);
router.put('/:id', authenticate, validate(updateListingSchema), listingController.update);
router.delete('/:id', authenticate, validate(getListingParamsSchema), listingController.delete);

// Public routes
router.get('/', validate(listListingsSchema), listingController.findAll);
router.get('/:id', validate(getListingParamsSchema), listingController.findById);

export default router;
