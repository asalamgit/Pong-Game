import { Injectable } from '@nestjs/common';
import { CreateChatDto } from '../dto/create-chat.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChannelDto } from '../dto/create-channel.dto';
import * as argon from 'argon2';
import { Channel, ChannelType, ChannelUser } from '@prisma/client';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}

  // MESSAGES

  async createMessage(createChatDto: CreateChatDto, userId: number) {
    const channel = await this.prismaService.channel.findUnique({
      where: {
        id: createChatDto.channel.id,
      },
    });
    return this.prismaService.message.create({
      data: {
        isInfo: createChatDto.isInfo ? createChatDto.isInfo : false,
        content: createChatDto.content,
        userId,
        channelId: channel.id,
      },
    });
  }

  async getMessages(id: string, userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        blockedList: true,
      },
    });
    const channel = await this.prismaService.channel.findUnique({
      where: {
        id,
      },
    });
    const messages = await this.prismaService.message.findMany({
      where: {
        channelId: channel.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        content: true,
        createdAt: true,
        isInfo: true,
        user: {
          select: {
            username: true,
            image: true,
            id: true,
          },
        },
      },
    });
    return (
      messages &&
      messages.map((value) => {
        let isBlocked = false;
        for (let i = 0; i < user.blockedList.length; i++)
          if (user.blockedList[i].username === value.user.username)
            isBlocked = true;
        return {
          isInfo: value.isInfo,
          content: value.content,
          createdAt: value.createdAt,
          username: value.user.username,
          image: value.user.image,
          userId: value.user.id,
          isBlocked,
        };
      })
    );
  }

  // CHANNELS

  async updateChannel(data: CreateChannelDto, userId: number) {
    const user = await this.prismaService.channelUser.findFirst({
      where: {
        userId,
        channelId: data.id,
      },
    });
    if (!user.isOwner)
      throw new WsException('only the owner of the channel can edit it');
    let hash = null;
    if (data.password) hash = await argon.hash(data.password);

    return await this.prismaService.channel.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        password: hash,
      },
    });
  }

  async createChannel(channel: CreateChannelDto, id: number) {
    let hash = null;
    if (channel.password) hash = await argon.hash(channel.password);

    const newChannel = await this.prismaService.channel.create({
      data: {
        name: channel.name,
        description: channel.description,
        type: channel.type,
        users: { connect: { id } },
        password: hash,
      },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
      },
    });
    await this.prismaService.channelUser.create({
      data: {
        isOwner: true,
        isAdmin: true,
        isBan: false,
        channelId: newChannel.id,
        userId: id,
      },
    });
    return newChannel;
  }

  async findAllChannel() {
    return this.prismaService.channel.findMany({
      where: {
        type: { not: ChannelType.DIRECT_MESSAGE },
      },
      select: {
        name: true,
        description: true,
        type: true,
        id: true,
      },
    });
  }

  async addUserInChannel(userId: number, channel: Channel, password?: string) {
    if (password) {
      const match = await argon.verify(channel.password, password);
      if (!match) return false;
    }
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    const userIsAlredyOnChannel = await this.prismaService.channel.findUnique({
      where: {
        id: channel.id,
        users: { some: user },
      },
    });
    if (!userIsAlredyOnChannel) {
      await this.prismaService.channelUser.create({
        data: {
          userId: user.id,
          channelId: channel.id,
          isAdmin: false,
          isOwner: false,
          isBan: false,
        },
      });
      return await this.prismaService.channel.update({
        where: {
          id: channel.id,
        },
        data: {
          users: { connect: { id: userId } },
        },
        select: {
          name: true,
          description: true,
          id: true,
          type: true,
        },
      });
    }
  }

  async getUsersChannel(channelId: string, userId: number, ban: boolean) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        blockedList: true,
      },
    });
    const channelRights = await this.prismaService.channelUser.findMany({
      where: {
        channelId: channelId,
        isBan: ban ? { not: false } : { not: true },
      },
      select: {
        isAdmin: true,
        isOwner: true,
        isBan: true,
        user: {
          select: {
            username: true,
            image: true,
            id: true,
            state: true,
          },
        },
      },
      orderBy: {
        user: {
          username: 'asc',
        },
      },
    });
    return channelRights.map((value) => {
      let isBlocked = false;
      for (let i = 0; i < user.blockedList.length; i++)
        if (user.blockedList[i].username === value.user.username)
          isBlocked = true;
      return {
        username: value.user.username,
        image: value.user.image,
        isAdmin: value.isAdmin,
        isOwner: value.isOwner,
        isBan: value.isBan,
        id: value.user.id,
        state: value.user.state,
        isBlocked,
      };
    });
  }

  async findUserInChannel(id: string, userId: number) {
    const channel = await this.prismaService.channel.findUnique({
      where: {
        id,
      },
      include: {
        users: {
          where: {
            id: userId,
          },
        },
      },
    });
    return channel.users.length === 1 ? true : false;
  }

  async findChannnel(channelId: string) {
    return this.prismaService.channel.findUnique({
      where: {
        id: channelId,
      },
      include: {
        users: true,
      },
    });
  }

  async kickUser(userId: number, channelId: string) {
    await this.prismaService.channelUser.deleteMany({
      where: {
        userId,
        channelId,
      },
    });
    return await this.prismaService.channel.update({
      where: {
        id: channelId,
      },
      data: {
        users: {
          disconnect: { id: userId },
        },
      },
    });
  }

  async banUser(userId: number, channelId: string) {
    await this.prismaService.channelUser.updateMany({
      where: {
        userId,
        channelId,
      },
      data: {
        isBan: true,
      },
    });
    return this.prismaService.channel.findUnique({
      where: {
        id: channelId,
      },
    });
  }

  async unbanUser(userId: number, channelId: string) {
    await this.prismaService.channelUser.updateMany({
      where: {
        userId,
        channelId,
      },
      data: {
        isBan: false,
      },
    });
    return this.prismaService.channel.findUnique({
      where: {
        id: channelId,
      },
    });
  }

  async isUserBan(userId: number, channelId: string) {
    const user = await this.prismaService.channelUser.findFirst({
      where: {
        userId,
        channelId,
      },
      select: {
        isBan: true,
      },
    });
    return user && user.isBan ? true : false;
  }

  async userQuit(userId: number, channelId: string) {
    const users = await this.prismaService.channelUser.findMany({
      where: {
        channelId,
        isBan: false,
      },
    });
    if (users.length === 1) {
      await this.prismaService.channel.delete({
        where: {
          id: channelId,
        },
      });
      return true;
    }
    const user = await this.prismaService.channelUser.findFirst({
      where: {
        userId,
        channelId,
      },
    });
    if (user.isOwner) await this.findOwnerSubstitute(channelId);
    await this.kickUser(userId, channelId);
    return false;
  }

  private async findOwnerSubstitute(channelId: string) {
    let substitute: ChannelUser;
    const adminList = await this.prismaService.channelUser.findMany({
      where: {
        channelId,
        isAdmin: true,
        isOwner: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    if (adminList.length > 0) substitute = adminList[0];
    else {
      const usersList = await this.prismaService.channelUser.findMany({
        where: {
          channelId,
          isOwner: false,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      substitute = usersList[0];
    }
    await this.prismaService.channelUser.updateMany({
      where: {
        channelId,
        userId: substitute.userId,
      },
      data: {
        isOwner: true,
        isAdmin: true,
      },
    });
  }

  // DIRECT_MESSAGES

  async createDirectMessageChannel(channel: CreateChannelDto) {
    const user1 = await this.prismaService.user.findUnique({
      where: {
        username: channel.name.split(' ')[0],
      },
    });
    const user2 = await this.prismaService.user.findUnique({
      where: {
        username: channel.name.split(' ')[1],
      },
    });
    const newChannel = await this.prismaService.channel.create({
      data: {
        name: '',
        description: channel.description,
        type: channel.type,
        users: {
          connect: [{ id: user1.id }, { id: user2.id }],
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        users: {
          select: {
            id: true,
            image: true,
            username: true,
          },
        },
      },
    });
    await this.prismaService.channelUser.create({
      data: {
        isOwner: false,
        isAdmin: false,
        isBan: false,
        channelId: newChannel.id,
        userId: user1.id,
      },
    });
    await this.prismaService.channelUser.create({
      data: {
        isOwner: false,
        isAdmin: false,
        isBan: false,
        channelId: newChannel.id,
        userId: user2.id,
      },
    });
    return newChannel;
  }

  async findAllDirectMessageChannel(userId: number) {
    const directMessages = await this.prismaService.channel.findMany({
      where: {
        type: ChannelType.DIRECT_MESSAGE,
        users: {
          some: { id: userId },
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        users: {
          select: {
            id: true,
            image: true,
            username: true,
          },
        },
      },
    });
    return directMessages.map((channel) => {
      // mettre en nom de channel lautre user
      channel.name =
        channel.users[0].id === userId
          ? channel.users[1].username
          : channel.users[0].username;
      return channel;
    });
  }

  async directMessagesExist(username: string, speakTo: string) {
    const user1 = await this.prismaService.user.findUnique({
      where: { username },
    });
    const user2 = await this.prismaService.user.findUnique({
      where: { username: speakTo },
    });
    const channels = await this.prismaService.channel.findMany({
      where: {
        AND: [
          {
            users: { some: user1 },
          },
          {
            users: { some: user2 },
          },
          {
            type: ChannelType.DIRECT_MESSAGE,
          },
        ],
      },
      include: {
        users: true,
      },
    });
    return channels.length > 0 ? true : false;
  }

  async userBlockedMe(createChatDto: CreateChatDto, userId: number) {
    // RECUPERE DIRECTEMENT LAUTRE EN 1 QUERRY IDIOT
    if (createChatDto.channel.type !== ChannelType.DIRECT_MESSAGE) return false;
    const { users } = await this.prismaService.channel.findUnique({
      where: {
        id: createChatDto.channel.id,
      },
      include: {
        users: true,
      },
    });
    const { blockedByList } = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { blockedByList: true },
    });
    const target = users[0].id === userId ? users[1] : users[0];
    for (let i = 0; i < blockedByList.length; i++) {
      if (blockedByList[i].id === target.id) return true;
    }
    return false;
  }

  async muteUser(id: number, channelId: string, timeMute: number) {
    const date = new Date(Date.now() + timeMute * 1000);
    await this.prismaService.channelUser.updateMany({
      where: {
        channelId,
        userId: id,
      },
      data: {
        muteFor: date,
      },
    });
    return this.prismaService.channel.findUnique({
      where: {
        id: channelId,
      },
    });
  }

  async setAsAdmin(userId: number, channelId: string) {
    await this.prismaService.channelUser.updateMany({
      where: {
        channelId,
        userId,
      },
      data: {
        isAdmin: true,
      },
    });
    return this.prismaService.channel.findUnique({
      where: {
        id: channelId,
      },
    });
  }

  async unsetAsAdmin(userId: number, channelId: string) {
    await this.prismaService.channelUser.updateMany({
      where: {
        channelId,
        userId,
      },
      data: {
        isAdmin: false,
      },
    });
    return this.prismaService.channel.findUnique({
      where: {
        id: channelId,
      },
    });
  }

  async getChannelUser(userId: number, channelId: string) {
    return await this.prismaService.channelUser.findFirst({
      where: {
        userId,
        channelId,
      },
      select: {
        muteFor: true,
      },
    });
  }

  async checkRight(userId: number, targetId: number, channelId: string) {
    const user = await this.prismaService.channelUser.findFirst({
      where: {
        userId,
        channelId,
      },
    });
    const target = await this.prismaService.channelUser.findFirst({
      where: {
        userId: targetId,
        channelId,
      },
    });
    if (user.isOwner || (user.isAdmin && !target.isAdmin)) return true;
    return false;
  }
}
