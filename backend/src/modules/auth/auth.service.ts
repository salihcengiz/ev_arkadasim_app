import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../../utils/jwt';
import { RegisterInput, LoginInput } from './auth.schema';

export class AuthService {
  async register(data: RegisterInput) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Bu e-posta adresi zaten kullanılıyor', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        phone: data.phone,
        age: data.age,
        occupation: data.occupation,
        occupationOther: data.occupationOther,
        maritalStatus: data.maritalStatus,
        gender: data.gender,
        userType: data.userType,
        traits: {
          create: {}, // Create default traits
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        age: true,
        occupation: true,
        occupationOther: true,
        maritalStatus: true,
        gender: true,
        userType: true,
        profileImage: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email };
    const token = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return {
      user,
      token,
      refreshToken,
    };
  }

  async login(data: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('Girilen e-posta veya şifre hatalı', 401);
    }

    if (!user.isActive) {
      throw new AppError('Hesabınız devre dışı bırakılmış', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Girilen e-posta veya şifre hatalı', 401);
    }

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email };
    const token = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    // Verify refresh token
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new AppError('Geçersiz veya süresi dolmuş refresh token', 401);
    }

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new AppError('Refresh token bulunamadı', 401);
    }

    if (storedToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new AppError('Refresh token süresi dolmuş', 401);
    }

    if (!storedToken.user.isActive) {
      throw new AppError('Hesabınız devre dışı bırakılmış', 401);
    }

    // Generate new access token
    const tokenPayload = { userId: storedToken.userId, email: storedToken.user.email };
    const newToken = generateAccessToken(tokenPayload);

    return { token: newToken };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      // Delete specific refresh token
      await prisma.refreshToken.deleteMany({
        where: {
          userId,
          token: refreshToken,
        },
      });
    } else {
      // Delete all refresh tokens for user
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        age: true,
        occupation: true,
        occupationOther: true,
        maritalStatus: true,
        gender: true,
        userType: true,
        profileImage: true,
        bio: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        traits: true,
      },
    });

    if (!user) {
      throw new AppError('Kullanıcı bulunamadı', 404);
    }

    return user;
  }
}

export const authService = new AuthService();
