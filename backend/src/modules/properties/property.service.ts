import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { CreatePropertyInput, UpdatePropertyInput, ListPropertiesQuery } from './property.schema';

export class PropertyService {
  async create(ownerId: string, data: CreatePropertyInput) {
    const property = await prisma.property.create({
      data: {
        ...data,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    });

    return property;
  }

  async findAll(query: ListPropertiesQuery) {
    const { city, district, minPrice, maxPrice, roomCount, gender, profile, page, limit } = query;

    const where: any = {
      isActive: true,
    };

    if (city) where.city = city;
    if (district) where.district = district;
    if (roomCount) where.roomCount = roomCount;
    if (gender) where.preferredGender = gender;
    if (profile) where.preferredProfile = profile;
    
    if (minPrice || maxPrice) {
      where.rentPrice = {};
      if (minPrice) where.rentPrice.gte = minPrice;
      if (maxPrice) where.rentPrice.lte = maxPrice;
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return { properties, total, page, limit };
  }

  async findById(id: string) {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            profileImage: true,
            userProfile: true,
            traits: true,
          },
        },
      },
    });

    if (!property) {
      throw new AppError('Konut bulunamadı', 404);
    }

    return property;
  }

  async findByOwner(ownerId: string) {
    const properties = await prisma.property.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });

    return properties;
  }

  async update(id: string, ownerId: string, data: UpdatePropertyInput) {
    // Check ownership
    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Konut bulunamadı', 404);
    }

    if (existing.ownerId !== ownerId) {
      throw new AppError('Bu işlem için yetkiniz yok', 403);
    }

    const property = await prisma.property.update({
      where: { id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    });

    return property;
  }

  async delete(id: string, ownerId: string) {
    // Check ownership
    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Konut bulunamadı', 404);
    }

    if (existing.ownerId !== ownerId) {
      throw new AppError('Bu işlem için yetkiniz yok', 403);
    }

    await prisma.property.delete({ where: { id } });
  }

  async uploadImage(id: string, ownerId: string, imageUrl: string) {
    // Check ownership
    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Konut bulunamadı', 404);
    }

    if (existing.ownerId !== ownerId) {
      throw new AppError('Bu işlem için yetkiniz yok', 403);
    }

    const property = await prisma.property.update({
      where: { id },
      data: {
        images: {
          push: imageUrl,
        },
      },
    });

    return { url: imageUrl };
  }
}

export const propertyService = new PropertyService();
