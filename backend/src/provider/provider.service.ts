import { Injectable } from '@nestjs/common';
import { ProviderType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProviderService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(type: ProviderType, providerId: string, userId: number) {
    return this.prismaService.provider.create({
      data: {
        type,
        providerId,
        userId,
      },
    });
  }

  async findOne(providerId: string, type: ProviderType) {
    return this.prismaService.provider.findFirst({
      where: {
        providerId,
        type,
      },
      select: {
        providerId: true,
        user: {
          select: {
            username: true,
            id: true,
            isTwoFa: true,
          },
        },
      },
    });
  }
}
