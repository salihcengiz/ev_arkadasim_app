import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { CreateListingInput, UpdateListingInput, ListListingsQuery } from './listing.schema';

export class ListingService {
  async create(userId: string, data: CreateListingInput) {
    const listing = await prisma.listing.create({
      data: {
        ...data,
        userId,
        moveInDate: data.moveInDate ? new Date(data.moveInDate) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
            occupation: true,
            gender: true,
            age: true,
          },
        },
      },
    });

    return listing;
  }

  async findAll(query: ListListingsQuery) {
    const { 
      searchType, city, district, neighborhood, 
      minBudget, maxBudget, gender, furnished,
      minSquareMeters, maxSquareMeters, roomCount,
      desiredRoomCount, peopleCount, page, limit 
    } = query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const where: any = {
      isActive: true,
    };

    if (searchType) where.searchType = searchType;
    if (city) where.city = city;
    if (district) where.district = district;
    if (neighborhood) where.neighborhood = { contains: neighborhood, mode: 'insensitive' };
    if (gender) where.preferredGender = gender;
    if (furnished !== undefined && furnished !== '') {
      where.furnished = furnished === 'true';
    }

    // Budget filter: for evime_arkadas uses rentPrice, for others uses minBudget/maxBudget
    if (minBudget || maxBudget) {
      where.OR = [
        // Match against rentPrice (evime_arkadas)
        {
          rentPrice: {
            ...(minBudget ? { gte: Number(minBudget) } : {}),
            ...(maxBudget ? { lte: Number(maxBudget) } : {}),
          },
        },
        // Match against minBudget/maxBudget range overlap (kalacak_ev, beraber_ev)
        {
          AND: [
            ...(minBudget ? [{ maxBudget: { gte: Number(minBudget) } }] : []),
            ...(maxBudget ? [{ minBudget: { lte: Number(maxBudget) } }] : []),
          ],
        },
      ];
    }

    // Square meters filter
    if (minSquareMeters || maxSquareMeters) {
      where.squareMeters = {
        ...(minSquareMeters ? { gte: Number(minSquareMeters) } : {}),
        ...(maxSquareMeters ? { lte: Number(maxSquareMeters) } : {}),
      };
    }

    if (roomCount) where.roomCount = Number(roomCount);
    if (desiredRoomCount) where.desiredRoomCount = Number(desiredRoomCount);
    if (peopleCount) where.peopleCount = Number(peopleCount);

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
              occupation: true,
              gender: true,
              age: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.listing.count({ where }),
    ]);

    return { listings, total, page: pageNum, limit: limitNum };
  }

  async findById(id: string) {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            profileImage: true,
            occupation: true,
            occupationOther: true,
            gender: true,
            age: true,
            bio: true,
            traits: true,
          },
        },
      },
    });

    if (!listing) {
      throw new AppError('İlan bulunamadı', 404);
    }

    return listing;
  }

  async findByUser(userId: string) {
    const listings = await prisma.listing.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return listings;
  }

  async update(id: string, userId: string, data: UpdateListingInput) {
    // Check ownership
    const existing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('İlan bulunamadı', 404);
    }

    if (existing.userId !== userId) {
      throw new AppError('Bu işlem için yetkiniz yok', 403);
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        ...data,
        moveInDate: data.moveInDate ? new Date(data.moveInDate) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
            occupation: true,
            gender: true,
            age: true,
          },
        },
      },
    });

    return listing;
  }

  async delete(id: string, userId: string) {
    // Check ownership
    const existing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('İlan bulunamadı', 404);
    }

    if (existing.userId !== userId) {
      throw new AppError('Bu işlem için yetkiniz yok', 403);
    }

    await prisma.listing.delete({ where: { id } });
  }
}

export const listingService = new ListingService();
