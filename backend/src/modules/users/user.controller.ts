import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { sendSuccess, sendNoContent } from '../../utils/response';
import { UpdateProfileInput, UpdateTraitsInput, ChangePasswordInput } from './user.schema';

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getPublicProfile(id);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await userService.getProfile(userId);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data: UpdateProfileInput = req.body;
      const user = await userService.updateProfile(userId, data);
      sendSuccess(res, user, 'Profil güncellendi');
    } catch (error) {
      next(error);
    }
  }

  async updateProfileImage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      // TODO: Implement file upload
      const imageUrl = req.body.imageUrl;
      const result = await userService.updateProfileImage(userId, imageUrl);
      sendSuccess(res, result, 'Profil resmi güncellendi');
    } catch (error) {
      next(error);
    }
  }

  async getTraits(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const traits = await userService.getTraits(id);
      sendSuccess(res, traits);
    } catch (error) {
      next(error);
    }
  }

  async getMyTraits(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const traits = await userService.getTraits(userId);
      sendSuccess(res, traits);
    } catch (error) {
      next(error);
    }
  }

  async updateTraits(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data: UpdateTraitsInput = req.body;
      const traits = await userService.updateTraits(userId, data);
      sendSuccess(res, traits, 'Özellikler güncellendi');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data: ChangePasswordInput = req.body;
      await userService.changePassword(userId, data);
      sendSuccess(res, null, 'Şifre değiştirildi');
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await userService.deleteAccount(userId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
