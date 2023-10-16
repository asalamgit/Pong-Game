import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findOne(
    where: Prisma.UserWhereUniqueInput,
    select?: Prisma.UserSelect,
  ) {
    return this.prismaService.user.findUnique({
      where,
      select,
    });
  }

  async findMany(userId: number) {
    return this.prismaService.user.findMany({
      where: {
        id: {
          not: userId,
        },
      },
      select: {
        username: true,
      },
    });
  }

  async findGames(id: number) {
    const playerSelect = {
      select: {
        user: {
          select: {
            id: true,
            username: true,
            image: true,
            state: true,
          },
        },
      },
    };
    const gameSelect = {
      select: {
        id: true,
        playerRanking: true,
        opponentRanking: true,
        createdAt: true,
        score: true,
        player1: playerSelect,
        player2: playerSelect,
      },
    };

    return this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        profile: {
          select: {
            gamesHistoryHome: gameSelect,
            gamesHistoryAway: gameSelect,
          },
        },
      },
    });
  }

  async create(user: Prisma.UserCreateInput) {
    const newUser = await this.prismaService.user.create({ data: user });

    const profileData: Prisma.ProfileCreateInput = {
      points: 0,
      victories: 0,
      defeats: 0,
      user: {
        connect: { id: newUser.id },
      },
    };
    await this.prismaService.profile.create({
      data: profileData,
    });
    return newUser;
  }

  async update(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
    select?: Prisma.UserSelect,
  ) {
    return this.prismaService.user.update({
      where,
      data,
      select,
    });
  }

  async block(userId: number, targetId: number) {
    await this.update(
      { id: userId },
      { blockedList: { connect: { id: targetId } } },
    );
    await this.update(
      { id: targetId },
      { blockedByList: { connect: { id: userId } } },
    );
  }

  async unblock(userId: number, targetId: number) {
    await this.update(
      { id: userId },
      { blockedList: { disconnect: { id: targetId } } },
    );
    await this.update(
      { id: targetId },
      { blockedByList: { disconnect: { id: userId } } },
    );
  }
}
