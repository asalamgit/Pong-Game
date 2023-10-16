import { Injectable, OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Game } from '../class/game.class';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Profile, UserState } from '@prisma/client';
import { ReadyDto } from '../dto/ready.dto';
import { QuitQueueDto } from '../dto/quit-queue.dto';

@Injectable()
export class GameService implements OnModuleInit {
  games: { [room: string]: Game };
  private playersReady = { normal: [], speedBall: [], paddleReduce: [] };
  private room = '';

  constructor(private readonly prismaService: PrismaService) {}

  onModuleInit() {
    this.games = {};
  }

  async joinQueue(client: Socket, readyDto: ReadyDto, server: Server) {
    let tabMode = [];
    let gameId = '';

    for (const key in this.playersReady) {
      if (
        this.playersReady[key].some(
          (player) => player.userId === readyDto.userId,
        )
      ) {
        server
          .to(readyDto.userId.toString())
          .emit('cannotJoinQueue', { msg: 'first' });
        return;
      }
    }

    if (readyDto.opponent === 'random') {
      if (
        !this.playersReady[readyDto.mode].find(
          (element) => element.clientId === client.id,
        )
      ) {
        if (await this.checkIfInGame(readyDto.userId)) {
          server.to(readyDto.userId.toString()).emit('cannotJoinQueue');
          return;
        }
        this.playersReady[readyDto.mode].push({
          client: client,
          clientId: client.id,
          userId: readyDto.userId,
        });
      }

      tabMode = this.playersReady[readyDto.mode];
      if (tabMode.length === 1) {
        this.room = 'room' + tabMode[tabMode.length - 1].clientId;
      }
    } else {
      gameId =
        readyDto.userId.toString() > readyDto.opponent
          ? readyDto.opponent + readyDto.userId + readyDto.mode
          : readyDto.userId + readyDto.opponent + readyDto.mode;
      if (!this.playersReady[gameId]) this.playersReady[gameId] = [];
      if (
        !this.playersReady[gameId].find(
          (element) => element.clientId === client.id,
        )
      ) {
        if (await this.checkIfInGame(readyDto.userId)) {
          server.to(readyDto.userId.toString()).emit('cannotJoinQueue');
          return;
        }
        this.playersReady[gameId].push({
          client: client,
          clientId: client.id,
          userId: readyDto.userId,
        });
      }

      tabMode = this.playersReady[gameId];
      if (tabMode.length === 1) {
        this.room = 'room' + tabMode[tabMode.length - 1].clientId;
        server.to(readyDto.opponent).emit('invitation', {
          opponentId: readyDto.userId,
          opponentName: readyDto.username,
          mode: readyDto.mode,
        });
      }
    }
    if (tabMode.length === 2) {
      tabMode[0].client.join(this.room);
      tabMode[1].client.join(this.room);
      this.startGame(
        server,
        this.room,
        tabMode[tabMode.length - 1].userId,
        tabMode[tabMode.length - 2].userId,
        readyDto.mode,
      );
      this.room = '';
      readyDto.opponent === 'random'
        ? (this.playersReady[readyDto.mode] = [])
        : delete this.playersReady[gameId];
    }
  }

  async quitQueue(quitQueueDto: QuitQueueDto, server: Server) {
    if (quitQueueDto.opponent !== 'random') {
      const gameId =
        quitQueueDto.userId.toString() > quitQueueDto.opponent
          ? quitQueueDto.opponent + quitQueueDto.userId + quitQueueDto.mode
          : quitQueueDto.userId + quitQueueDto.opponent + quitQueueDto.mode;
      delete this.playersReady[gameId];
      server
        .to(quitQueueDto.opponent)
        .emit('invitationCancelled', quitQueueDto.userId);
    } else {
      const newTab = this.playersReady[quitQueueDto.mode].filter(
        (element) => element.userId !== quitQueueDto.userId,
      );
      this.playersReady[quitQueueDto.mode] = newTab;
    }
  }

  async startGame(
    server: Server,
    room: string,
    playerId1: number,
    playerId2: number,
    mode: string,
  ) {
    if (room in this.games) return;
    this.games[room] = new Game(this, server, room, playerId1, playerId2, mode);
    this.updateUserState(playerId1, 'IN_GAME');
    this.updateUserState(playerId2, 'IN_GAME');
  }

  paddleMove(room: string, isPlayerLeft: boolean, speed: number) {
    this.games[room].paddleMove(isPlayerLeft, speed);
  }

  quitGame(room: string, userId: number) {
    this.games[room].quit(userId);
  }

  deleteGame(room: string) {
    delete this.games[room];
  }

  async getUserWithProfile(userId: number) {
    const userWithProfile = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        profile: true,
      },
    });
    return userWithProfile;
  }

  async updateUserState(userId: number, state: UserState) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (user) {
      await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          state: state,
        },
      });
    }
  }

  async checkIfInGame(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (user && user.state === 'IN_GAME') return true;
    return false;
  }

  async getAllUsers() {
    const allUsersExceptCurrentUser = await this.prismaService.user.findMany({
      select: {
        id: true,
        username: true,
      },
    });
    return allUsersExceptCurrentUser;
  }

  async getProfile(userId: number) {
    const profile = await this.prismaService.profile.findUnique({
      where: {
        userId: userId,
      },
    });
    return profile;
  }

  async addVictory(userId: number, updatePlayerPoints: number) {
    await this.prismaService.profile.update({
      where: {
        userId: userId,
      },
      data: {
        points: updatePlayerPoints,
        victories: {
          increment: 1,
        },
      },
    });
  }

  async addDefeat(userId: number, updatePlayerPoints: number) {
    await this.prismaService.profile.update({
      where: {
        userId: userId,
      },
      data: {
        points: updatePlayerPoints,
        defeats: {
          increment: 1,
        },
      },
    });
  }

  async saveGame(
    player1Profile: Profile,
    player2Profile: Profile,
    score: [number, number],
  ) {
    this.updateUserState(player1Profile.id, 'ONLINE');
    this.updateUserState(player2Profile.id, 'ONLINE');
    const finishedGameData: Prisma.GameCreateInput = {
      player1: {
        connect: { id: player1Profile.id },
      },
      playerRanking: player1Profile.points,
      opponentRanking: player2Profile.points,
      player2: {
        connect: { id: player2Profile.id },
      },
      score: score,
    };

    await this.prismaService.game.create({
      data: finishedGameData,
    });
  }
}
