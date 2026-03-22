import { Request, Response, NextFunction } from 'express';
import { propertyService } from './property.service';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../../utils/response';
import { CreatePropertyInput, UpdatePropertyInput, ListPropertiesQuery } from './property.schema';

export class PropertyController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user!.id;
      const data: CreatePropertyInput = req.body;
      const property = await propertyService.create(ownerId, data);
      sendCreated(res, property, 'Konut oluşturuldu');
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as ListPropertiesQuery;
      const { properties, total, page, limit } = await propertyService.findAll(query);
      sendPaginated(res, properties, total, page, limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const property = await propertyService.findById(id);
      sendSuccess(res, property);
    } catch (error) {
      next(error);
    }
  }

  async findMyProperties(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user!.id;
      const properties = await propertyService.findByOwner(ownerId);
      sendSuccess(res, properties);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ownerId = req.user!.id;
      const data: UpdatePropertyInput = req.body;
      const property = await propertyService.update(id, ownerId, data);
      sendSuccess(res, property, 'Konut güncellendi');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ownerId = req.user!.id;
      await propertyService.delete(id, ownerId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ownerId = req.user!.id;
      // TODO: Implement file upload
      const imageUrl = req.body.imageUrl;
      const result = await propertyService.uploadImage(id, ownerId, imageUrl);
      sendSuccess(res, result, 'Resim yüklendi');
    } catch (error) {
      next(error);
    }
  }
}

export const propertyController = new PropertyController();
