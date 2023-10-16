import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import {
  CreateChatDto,
  UserActionsDto,
  UserActionsMuteDto,
  directMessagesExistDto,
} from '../dto/create-chat.dto';
import { Server } from 'socket.io';
import {
  UnauthorizedException,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ACCESS_TOKEN_SECRET } from 'src/constants';
import { WsJwtGuard } from 'src/auth/guards/ws-jwt.guard';
import {
  CreateChannelDto,
  CreateProtectedChannelDto,
} from '../dto/create-channel.dto';
import { ChatService } from '../services/chat.service';
import { CheckChannelIdDto } from '../dto/check-channel.dto';
import { WsExceptionFilter } from '../ws-exception.filter';
import * as argon from 'argon2';
import { Channel, ChannelType, User } from '@prisma/client';

@UseGuards(WsJwtGuard)
@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // CONNECTION

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.query.token instanceof Array
          ? client.handshake.query.token[0]
          : client.handshake.query.token;
      const decodedToken = this.jwtService.verify(token, {
        secret: this.configService.get<string>(ACCESS_TOKEN_SECRET),
      });
      const user = await this.usersService.findOne({ id: decodedToken.sub });
      if (!user) return this.disconnect(client);
      else client.data.user = user;
      client.join(user.id.toString());
    } catch (e) {
      return this.disconnect(client);
    }
  }

  private disconnect(client: Socket) {
    client.emit('exception', new UnauthorizedException());
    client.disconnect();
  }

  // MESSAGES

  @SubscribeMessage('createMessage')
  async createMessage(client: Socket, createChatDto: CreateChatDto) {
    if (
      await this.chatService.userBlockedMe(createChatDto, client.data.user.id)
    )
      throw new WsException('This user blocked you.');
    const user = await this.chatService.getChannelUser(
      client.data.user.id,
      createChatDto.channel.id,
    );
    if (user.muteFor > new Date())
      throw new WsException('You have been muted.');
    await this.chatService.createMessage(createChatDto, client.data.user.id);
    this.server
      .to(createChatDto.channel.id)
      .emit('message', createChatDto.channel.id);
  }

  @SubscribeMessage('getMessages')
  async getMessages(client: Socket, { id }: CheckChannelIdDto) {
    return this.chatService.getMessages(id, client.data.user.id);
  }

  // CHANNELS

  private async joinPrivateChannel(
    client: Socket,
    channel: Channel,
    { id }: CheckChannelIdDto,
  ) {
    const isUserInChannel = await this.chatService.findUserInChannel(
      id,
      client.data.user.id,
    );
    if (!isUserInChannel) throw new WsException('This channel is private.');
    return this.selectChannel(client, channel, { id });
  }

  private async joinPotectedChannel(
    client: Socket,
    channel: Channel,
    { id, password }: CheckChannelIdDto,
  ) {
    const match = await argon.verify(channel.password, password);
    if (!match || !password) throw new WsException('Wrong password');
    return this.selectChannel(client, channel, { id });
  }

  private async joinDirectMessageChannel(
    client: Socket,
    channel: Channel & { users: User[] },
    { id }: CheckChannelIdDto,
  ) {
    channel.name =
      channel.users[0].id === client.data.user.id
        ? channel.users[1].username
        : channel.users[0].username;
    return this.selectChannel(client, channel, { id });
  }

  @SubscribeMessage('joinChannel')
  async joinChannel(client: Socket, { id, password }: CheckChannelIdDto) {
    const channel = await this.chatService.findChannnel(id);
    if (await this.chatService.isUserBan(client.data.user.id, channel.id))
      throw new WsException('You have been banned from this channel');
    switch (channel.type) {
      case ChannelType.PRIVATE: {
        return this.joinPrivateChannel(client, channel, { id });
      }
      case ChannelType.PROTECTED: {
        return this.joinPotectedChannel(client, channel, { id, password });
      }
      case ChannelType.DIRECT_MESSAGE: {
        return this.joinDirectMessageChannel(client, channel, { id });
      }
      default: {
        return this.selectChannel(client, channel, { id });
      }
    }
  }

  async selectChannel(
    client: Socket,
    channel: Channel,
    { id }: CheckChannelIdDto,
  ) {
    const channelUpdate = await this.chatService.addUserInChannel(
      client.data.user.id,
      channel,
    );
    client.join(id);
    if (channelUpdate)
      this.server.to(id).emit('newUserInChannel', channelUpdate.id);
    return {
      name: channel.name,
      description: channel.description,
      id: channel.id,
      type: channel.type,
    };
  }

  @SubscribeMessage('createChannel')
  async createChannel(client: Socket, createChannelDto: CreateChannelDto) {
    const channel = await this.chatService.createChannel(
      createChannelDto,
      client.data.user.id,
    );
    this.server.emit('channel', channel);
    return channel;
  }

  @SubscribeMessage('createProtectedChannel')
  async createProtectedChannel(
    client: Socket,
    createProtectedChannelDto: CreateProtectedChannelDto,
  ) {
    const channel = await this.chatService.createChannel(
      createProtectedChannelDto,
      client.data.user.id,
    );
    this.server.emit('channel', channel);
    return channel;
  }

  @SubscribeMessage('updateChannel')
  async updateChannel(client: Socket, data: CreateChannelDto) {
    const channel = await this.chatService.updateChannel(
      data,
      client.data.user.id,
    );
    this.server.to(data?.id).emit('updateChannel', channel);
    this.server.emit('channels', await this.findAllChannel());
  }

  @SubscribeMessage('findAllChannel')
  async findAllChannel() {
    return await this.chatService.findAllChannel();
  }

  @SubscribeMessage('leaveChannel')
  async leaveChannel(client: Socket, { id }: CheckChannelIdDto) {
    client.emit('clearMessages');
    client.leave(id);
  }

  @SubscribeMessage('getUsersChannel')
  async getUsersChannel(client: Socket, { id }: CheckChannelIdDto) {
    return this.chatService.getUsersChannel(id, client.data.user.id, false);
  }

  @SubscribeMessage('getUsersBanChannel')
  async getUsersBanChannel(client: Socket, { id }: CheckChannelIdDto) {
    return this.chatService.getUsersChannel(id, client.data.user.id, true);
  }

  private async sendInfoMessage(channel, userId, targetId, info) {
    const user = await this.usersService.findOne({ id: userId });
    const target = targetId
      ? await this.usersService.findOne({ id: targetId })
      : { username: '' };
    const createChatDto = {
      isInfo: true,
      content: `${user.username} ${info} ${target.username}`,
      channel: {
        name: channel.name,
        id: channel.id,
        description: channel.description,
        type: channel.type,
      },
    };
    await this.chatService.createMessage(createChatDto, userId);
    this.server
      .to(createChatDto.channel.id)
      .emit('message', createChatDto.channel.id);
  }

  @SubscribeMessage('kickUser')
  async kickUser(client: Socket, { userId, channelId }: UserActionsDto) {
    if (
      !(await this.chatService.checkRight(
        client.data.user.id,
        userId,
        channelId,
      ))
    )
      throw new WsException('Insufficient privilege');
    const channel = await this.chatService.kickUser(userId, channelId);
    this.server.to(userId.toString()).emit('leaveChannel', channel.id);
    this.server.to(channelId).emit('newUserInChannel', channel.id);
    this.server.to(userId.toString()).emit('userHasBeenKick');
    this.sendInfoMessage(channel, client.data.user.id, userId, 'kicked');
  }

  @SubscribeMessage('banuser')
  async banUser(client: Socket, { userId, channelId }: UserActionsDto) {
    if (
      !(await this.chatService.checkRight(
        client.data.user.id,
        userId,
        channelId,
      ))
    )
      throw new WsException('Insufficient privilege');
    const channel = await this.chatService.banUser(userId, channelId);
    this.server.to(channelId).emit('newUserInChannel', channel.id);
    this.server.to(userId.toString()).emit('userHasBeenKick');
    this.sendInfoMessage(channel, client.data.user.id, userId, 'banned');
  }

  @SubscribeMessage('unbanuser')
  async unbanUser(client: Socket, { userId, channelId }: UserActionsDto) {
    if (
      !(await this.chatService.checkRight(
        client.data.user.id,
        userId,
        channelId,
      ))
    )
      throw new WsException('Insufficient privilege');
    const channel = await this.chatService.unbanUser(userId, channelId);
    this.server.to(channelId).emit('reset', channelId);
    this.sendInfoMessage(channel, client.data.user.id, userId, 'unbanned');
  }

  @SubscribeMessage('muteUser')
  async muteUser(
    client: Socket,
    { userId, channelId, timeMute }: UserActionsMuteDto,
  ) {
    if (
      !(await this.chatService.checkRight(
        client.data.user.id,
        userId,
        channelId,
      ))
    )
      throw new WsException('Insufficient privilege');
    const channel = await this.chatService.muteUser(
      userId,
      channelId,
      timeMute,
    );
    this.sendInfoMessage(
      channel,
      client.data.user.id,
      userId,
      `muted for ${timeMute} seconds: `,
    );
  }

  @SubscribeMessage('setAsAdmin')
  async setAsAdmin(client: Socket, { userId, channelId }: UserActionsDto) {
    if (
      !(await this.chatService.checkRight(
        client.data.user.id,
        userId,
        channelId,
      ))
    )
      throw new WsException('Insufficient privilege');
    const channel = await this.chatService.setAsAdmin(userId, channelId);
    this.server.to(channelId).emit('reset', channelId);
    this.sendInfoMessage(
      channel,
      client.data.user.id,
      userId,
      'set as admin: ',
    );
  }

  @SubscribeMessage('unsetAsAdmin')
  async unsetAsAdmin(client: Socket, { userId, channelId }: UserActionsDto) {
    if (
      !(await this.chatService.checkRight(
        client.data.user.id,
        userId,
        channelId,
      ))
    )
      throw new WsException('Insufficient privilege');
    const channel = await this.chatService.unsetAsAdmin(userId, channelId);
    this.server.to(channelId).emit('reset', channelId);
    this.sendInfoMessage(channel, client.data.user.id, userId, 'unset admin: ');
  }

  @SubscribeMessage('block')
  async block(client: Socket, { userId, channelId }: UserActionsDto) {
    await this.usersService.block(client.data.user.id, userId);
    this.server.to(channelId).emit('reset', channelId);
  }

  @SubscribeMessage('unblock')
  async unblock(client: Socket, { userId, channelId }: UserActionsDto) {
    await this.usersService.unblock(client.data.user.id, userId);
    this.server.to(channelId).emit('reset', channelId);
  }

  @SubscribeMessage('userQuit')
  async userQuit(client: Socket, { userId, channelId }: UserActionsDto) {
    const channelDeleted = await this.chatService.userQuit(userId, channelId);
    if (channelDeleted) return await this.chatService.findAllChannel();
    this.server.to(channelId).emit('reset', channelId);
    const channel = await this.chatService.findChannnel(channelId);
    this.sendInfoMessage(channel, client.data.user.id, null, 'left');
  }

  // DIRECT_MESSAGES

  @SubscribeMessage('findAllDirectMessageChannel')
  async findAllDirectMessageChannel(client: Socket) {
    return await this.chatService.findAllDirectMessageChannel(
      client.data.user.id,
    );
  }

  @SubscribeMessage('createDirectMessageChannel')
  async createDirectMessageChannel(
    client: Socket,
    createChannelDto: CreateChannelDto,
  ) {
    const channel =
      await this.chatService.createDirectMessageChannel(createChannelDto);

    if (channel.users[0].id === client.data.user.id) {
      channel.name = channel.users[0].username;
      this.server
        .to(channel.users[1].id.toString())
        .emit('directMessageChannel', channel);
    } else {
      channel.name = channel.users[1].username;
      this.server
        .to(channel.users[0].id.toString())
        .emit('directMessageChannel', channel);
    }
    channel.name =
      channel.users[0].id === client.data.user.id
        ? channel.users[1].username
        : channel.users[0].username;
    return channel;
  }

  @SubscribeMessage('getDirectMessageList')
  async getDirectMessageList(client: Socket) {
    return this.usersService.findMany(client.data.user.id);
  }

  @SubscribeMessage('directMessagesExist')
  async directMessagesExist(
    client: Socket,
    { username }: directMessagesExistDto,
  ) {
    return this.chatService.directMessagesExist(
      client.data.user.username,
      username,
    );
  }
}
