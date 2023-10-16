import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/services/users.service';
import { NotificationType, User } from '@prisma/client';
import { Server } from 'socket.io';

@Injectable()
export class FriendsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async addFriendship(userId: number, friendsId: number) {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        friends: {
          connect: {
            id: friendsId,
          },
        },
      },
    });
  }

  async deleteFriendship(userId: number, friendsId: number) {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        friends: {
          disconnect: {
            id: friendsId,
          },
        },
      },
    });
  }

  async getFriend(userId: number, friendId: number) {
    return this.prismaService.user.findFirst({
      where: {
        id: userId,
        friends: {
          some: {
            id: friendId,
          },
        },
      },
      select: {
        id: true,
        username: true,
        image: true,
        friends: true,
      },
    });
  }

  async sendFriendsRequest(userId: number, friendsId: number) {
    return this.notificationsService.create(
      NotificationType.FRIENDSHIP,
      userId,
      friendsId,
    );
  }

  async acceptFriendsRequest(userId: number, friendsId: number) {
    await this.notificationsService.delete(
      NotificationType.FRIENDSHIP,
      userId,
      friendsId,
    );
    await this.addFriendship(userId, friendsId);
    await this.addFriendship(friendsId, userId);
  }

  async addFriends(server: Server, user: User, friendsId: number) {
    if (user.id === friendsId)
      throw new WsException('Impossible to add yourself');
    const friend = await this.getFriend(user.id, friendsId);

    if (!friend) {
      // if friends already send me a friends request
      const friendsRequest = await this.notificationsService.find(
        NotificationType.FRIENDSHIP,
        friendsId,
        user.id,
      );

      // Other user already send a friends request so they both want to be friends
      if (friendsRequest) {
        await this.acceptFriendsRequest(friendsId, user.id);
        // delete friends request
        server.to(String(user.id)).emit('deleteNotification', friendsRequest);
        // emit to both user their new friends
        server.to(String(friendsId)).emit('newFriends', user);
        const newFriend = await this.usersService.findOne(
          { id: friendsId },
          { id: true, username: true, image: true, state: true },
        );
        server.to(String(user.id)).emit('newFriends', newFriend);
      } else {
        // if I already send a friends request
        const myFriendsRequest = await this.notificationsService.find(
          NotificationType.FRIENDSHIP,
          user.id,
          friendsId,
        );

        if (!myFriendsRequest) {
          const newFriendsRequest = await this.sendFriendsRequest(
            user.id,
            friendsId,
          );
          // emit new friends request to friendsId
          server
            .to(String(friendsId))
            .emit('newNotification', newFriendsRequest);
        }
      }
    }
  }

  async deleteFriends(server: Server, userId: number, friendsId: number) {
    await this.deleteFriendship(userId, friendsId);
    await this.deleteFriendship(friendsId, userId);
    server.to(String(userId)).emit('deleteFriends', friendsId);
    server.to(String(friendsId)).emit('deleteFriends', userId);
  }

  async getFriends(userId: number) {
    return this.usersService.findOne(
      { id: userId },
      {
        id: true,
        username: true,
        image: true,
        friends: {
          select: {
            id: true,
            state: true,
            username: true,
            image: true,
          },
        },
      },
    );
  }

  async deleteNotif(type: NotificationType, userId: number, targetId: number) {
    const notif = await this.notificationsService.find(type, userId, targetId);
    await this.notificationsService.delete(type, userId, targetId);
    return notif;
  }
}
