import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(type: NotificationType, ownerId: number, targetId: number) {
    return this.prismaService.notifications.create({
      data: {
        type,
        owner: {
          connect: {
            id: ownerId,
          },
        },
        target: {
          connect: {
            id: targetId,
          },
        },
      },
      select: {
        id: true,
        type: true,
        owner: {
          select: {
            id: true,
            username: true,
            state: true,
            image: true,
          },
        },
        target: {
          select: {
            id: true,
            username: true,
            state: true,
            image: true,
          },
        },
        updatedAt: true,
        createdAt: true,
      },
    });
  }

  async find(type: NotificationType, ownerId: number, targetId: number) {
    return this.prismaService.notifications.findFirst({
      where: {
        type,
        ownerId,
        targetId,
      },
      select: {
        id: true,
        type: true,
        owner: {
          select: {
            id: true,
            username: true,
            state: true,
            image: true,
          },
        },
        target: {
          select: {
            id: true,
            username: true,
            state: true,
            image: true,
          },
        },
        updatedAt: true,
        createdAt: true,
      },
    });
  }

  async findMany(targetId: number) {
    return this.prismaService.notifications.findMany({
      where: {
        targetId,
      },
      select: {
        id: true,
        type: true,
        owner: {
          select: {
            id: true,
            username: true,
            state: true,
            image: true,
          },
        },
        target: {
          select: {
            id: true,
            username: true,
            state: true,
            image: true,
          },
        },
        updatedAt: true,
        createdAt: true,
      },
    });
  }

  async delete(type: NotificationType, ownerId: number, targetId: number) {
    return this.prismaService.notifications.deleteMany({
      where: {
        type,
        ownerId,
        targetId,
      },
    });
  }
}
