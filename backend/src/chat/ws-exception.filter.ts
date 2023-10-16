import {
  ArgumentsHost,
  Catch,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Prisma } from '@prisma/client';
import { Socket } from 'socket.io';

@Catch()
export class WsExceptionFilter {
  public catch(exception: HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    this.handleError(client, exception);
  }

  public handleError(
    client: Socket,
    exception: HttpException | WsException | unknown,
  ) {
    if (exception instanceof HttpException) {
      const wsException = new WsException(exception.getResponse());
      client.emit('exception', wsException);
    } else if (exception instanceof WsException) {
      client.emit('exception', exception);
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const wsException = new WsException(exception.message);
      client.emit('exception', wsException);
    } else if (exception instanceof UnauthorizedException) {
      const wsException = new WsException(exception.name);
      client.emit('exception', wsException);
    } else {
      const wsException = new WsException({ error: 'Unknown exception' });
      client.emit('exception', wsException);
    }
  }
}
