import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ACCESS_TOKEN_SECRET } from 'src/constants';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') return true;

    const client: Socket = context.switchToWs().getClient();
    const token =
      client.handshake.query.token instanceof Array
        ? client.handshake.query.token[0]
        : client.handshake.query.token;
    try {
      const decodedToken = this.jwtService.verify(token, {
        secret: this.configService.get<string>(ACCESS_TOKEN_SECRET),
      });
      if (!decodedToken) return false;
      return true;
    } catch {
      throw new WsException('Token expired');
    }
  }
}
