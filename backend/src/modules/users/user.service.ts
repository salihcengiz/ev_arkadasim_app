import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { UpdateProfileInput, UpdateTraitsInput, ChangePasswordInput } from './user.schema';

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        age: true,
        gender: true,
        userType: true,
        occupation: true,
        occupationOther: true,
        maritalStatus: true,
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

  async getPublicProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
      select: {
        id: true,
        fullName: true,
        age: true,
        gender: true,
        userType: true,
        occupation: true,
        occupationOther: true,
        maritalStatus: true,
        profileImage: true,
        bio: true,
        createdAt: true,
        traits: {
          select: {
            cleanliness: true,
            tidiness: true,
            cooking: true,
            smoking: true,
            alcohol: true,
            pets: true,
            guests: true,
            nightOwl: true,
            earlyBird: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Kullanıcı bulunamadı', 404);
    }

    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        age: true,
        gender: true,
        userType: true,
        occupation: true,
        occupationOther: true,
        maritalStatus: true,
        profileImage: true,
        bio: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateProfileImage(userId: string, imageUrl: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { profileImage: imageUrl },
      select: {
        id: true,
        profileImage: true,
      },
    });

    return user;
  }

  async getTraits(userId: string) {
    const traits = await prisma.userTraits.findUnique({
      where: { userId },
    });

    if (!traits) {
      // Create default traits if not exists
      return await prisma.userTraits.create({
        data: { userId },
      });
    }

    return traits;
  }

  async updateTraits(userId: string, data: UpdateTraitsInput) {
    const traits = await prisma.userTraits.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });

    return traits;
  }

  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Kullanıcı bulunamadı', 404);
    }

    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);

    if (!isPasswordValid) {
      throw new AppError('Mevcut şifre hatalı', 400);
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async deleteAccount(userId: string) {
    await prisma.user.delete({
      where: { id: userId },
    });
  }
}

export const userService = new UserService();
