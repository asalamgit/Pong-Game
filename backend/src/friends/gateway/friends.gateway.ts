import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
  UnauthorizedException,
} from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from 'src/auth/guards/ws-jwt.guard';
import { WsExceptionFilter } from 'src/chat/ws-exception.filter';
import { FriendsService } from '../services/friends.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/services/users.service';
import { ConfigService } from '@nestjs/config';
import { ACCESS_TOKEN_SECRET } from 'src/constants';
import { Friends } from '../dto/Friends.dto';
import { UserState } from '@prisma/client';

@UseGuards(WsJwtGuard)
@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  namespace: '/friends',
  cors: { origin: '*' },
})
export class FriendsGateway {
  @WebSocketServer()
  server: Server;

  users: Map<number, number>;

  constructor(
    private readonly friendsService: FriendsService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.users = new Map();
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.query.token instanceof Array
          ? client.handshake.query.token[0]
          : client.handshake.query.token;
      const decodedToken = this.jwtService.verify(token, {
        secret: this.configService.get<string>(ACCESS_TOKEN_SECRET),
      });
      const user = await this.usersService.findOne(
        { id: decodedToken.sub },
        { id: true, state: true, username: true, image: true },
      );
      if (!user) return this.disconnect(client);
      client.data.user = user;

      client.join(String(user.id));
      if (!this.users[user.id]) {
        this.users[user.id] = 1;

        await this.usersService.update(
          { id: user.id },
          { state: UserState.ONLINE },
        );
      } else {
        this.users[user.id]++;
      }
    } catch (e) {
      return this.disconnect(client);
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.user) {
      this.users[client.data.user.id]--;
      if (this.users[client.data.user.id] <= 0) {
        const user = await this.usersService.findOne({
          id: client.data.user.id,
        });

        await this.usersService.update(
          { id: user.id },
          { state: UserState.OFFLINE },
        );
      }

      client.leave(String(client.data.user.id));
    }
  }

  private disconnect(client: Socket) {
    client.emit('Error', new UnauthorizedException());
    client.disconnect();
  }

  @SubscribeMessage('friends')
  async getFriends(client: Socket, friend: Friends) {
    const user = await this.friendsService.getFriends(friend.id);
    this.server.to(client.id).emit('friends', user.friends);
  }

  @SubscribeMessage('addFriend')
  async addFriend(client: Socket, friend: Friends) {
    await this.friendsService.addFriends(
      this.server,
      client.data.user,
      friend.id,
    );
  }

  @SubscribeMessage('deleteFriend')
  async deleteFriend(client: Socket, friend: Friends) {
    await this.friendsService.deleteFriends(
      this.server,
      client.data.user.id,
      friend.id,
    );
  }

  @SubscribeMessage('declineInvite')
  async deleteNotif(client: Socket, { type, userId, targetId }) {
    const deletedNotif = await this.friendsService.deleteNotif(
      type,
      userId,
      targetId,
    );
    this.server.emit('deleteNotification', deletedNotif);
  }
}
