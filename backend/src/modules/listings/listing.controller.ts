import { Request, Response, NextFunction } from 'express';
import { listingService } from './listing.service';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../../utils/response';
import { CreateListingInput, UpdateListingInput, ListListingsQuery } from './listing.schema';

export class ListingController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data: CreateListingInput = req.body;
      const listing = await listingService.create(userId, data);
      sendCreated(res, listing, 'İlan oluşturuldu');
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as ListListingsQuery;
      const { listings, total, page, limit } = await listingService.findAll(query);
      sendPaginated(res, listings, total, page, limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const listing = await listingService.findById(id);
      sendSuccess(res, listing);
    } catch (error) {
      next(error);
    }
  }

  async findMyListings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const listings = await listingService.findByUser(userId);
      sendSuccess(res, listings);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data: UpdateListingInput = req.body;
      const listing = await listingService.update(id, userId, data);
      sendSuccess(res, listing, 'İlan güncellendi');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      await listingService.delete(id, userId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export const listingController = new ListingController();
