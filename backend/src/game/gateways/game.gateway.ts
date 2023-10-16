import {
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from 'src/auth/guards/ws-jwt.guard';
import { ACCESS_TOKEN_SECRET } from 'src/constants';
import { UsersService } from 'src/users/services/users.service';
import { AcceptInvitationDto } from '../dto/accept-invitation.dto';
import { DeclineInvitationDto } from '../dto/decline-invitation.dto';
import { PaddleMoveDto } from '../dto/paddle-move.dto';
import { QuitQueueDto } from '../dto/quit-queue.dto';
import { QuitDto } from '../dto/quit.dto';
import { ReadyDto } from '../dto/ready.dto';
import { GameService } from '../services/game.service';

@UseGuards(WsJwtGuard)
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  namespace: '/game',
  cors: { origin: '*' },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly gameService: GameService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

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
    } catch (e) {
      return this.disconnect(client);
    }
  }

  private disconnect(client: Socket) {
    client.emit('Error', new UnauthorizedException());
    client.disconnect();
  }

  @SubscribeMessage('ready')
  handleReady(client: Socket, readyDto: ReadyDto) {
    this.gameService.joinQueue(client, readyDto, this.server);
  }

  @SubscribeMessage('joinInvitationRoom')
  async handleJoinInvitationRoom(socket: Socket, userId: number) {
    socket.join(userId.toString());
  }

  @SubscribeMessage('acceptInvitation')
  async handleAcceptInvitation(
    socket: Socket,
    acceptInvitationDto: AcceptInvitationDto,
  ) {
    this.server
      .to(acceptInvitationDto.userId.toString())
      .emit('acceptInvitation', {
        userId: acceptInvitationDto.userId,
        opponentId: acceptInvitationDto.opponentId,
        mode: acceptInvitationDto.mode,
      });
  }

  @SubscribeMessage('declineInvitation')
  async handleDeclineInvitation(
    socket: Socket,
    declineInvitationDto: DeclineInvitationDto,
  ) {
    this.server
      .to(declineInvitationDto.opponentId.toString())
      .emit('declineInvitation', declineInvitationDto.username);
  }

  @SubscribeMessage('leaveInvitationRoom')
  async handleLeaveInvitationRoom(socket: Socket, userId: number) {
    socket.leave(userId.toString());
  }

  @SubscribeMessage('getAllUsers')
  async handleGetAllUsers() {
    const allUsers = await this.gameService.getAllUsers();
    return allUsers;
  }

  @SubscribeMessage('paddleMove')
  handlePaddleMove(socket: Socket, paddleMoveDto: PaddleMoveDto) {
    this.gameService.paddleMove(
      paddleMoveDto.room,
      paddleMoveDto.isPlayerLeft,
      paddleMoveDto.paddleSpeed,
    );
  }

  @SubscribeMessage('quitQueue')
  handleRefreshOrClose(client: Socket, quitQueueDto: QuitQueueDto) {
    this.gameService.quitQueue(quitQueueDto, this.server);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
  }

  @SubscribeMessage('quit')
  handlequit(client: Socket, quitDto: QuitDto) {
    this.gameService.quitGame(quitDto.room, quitDto.userId);
  }
}
