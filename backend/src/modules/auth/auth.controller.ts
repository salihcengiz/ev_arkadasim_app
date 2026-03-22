import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { RegisterInput, LoginInput, RefreshTokenInput } from './auth.schema';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    console.log('=== REGISTER ENDPOINT HIT ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', req.headers);
    
    try {
      const data: RegisterInput = req.body;
      console.log('Calling authService.register...');
      const result = await authService.register(data);
      console.log('Register result:', result);
      sendCreated(res, result, 'Kayıt başarılı');
    } catch (error: any) {
      console.log('Register error:', error.message);
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    console.log('=== LOGIN ENDPOINT HIT ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    try {
      const data: LoginInput = req.body;
      console.log('Calling authService.login...');
      const result = await authService.login(data);
      console.log('Login successful');
      sendSuccess(res, result, 'Giriş başarılı');
    } catch (error: any) {
      console.log('Login error:', error.message);
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken }: RefreshTokenInput = req.body;
      const result = await authService.refreshToken(refreshToken);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { refreshToken } = req.body;
      await authService.logout(userId, refreshToken);
      sendSuccess(res, null, 'Çıkış yapıldı');
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await authService.getCurrentUser(userId);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
