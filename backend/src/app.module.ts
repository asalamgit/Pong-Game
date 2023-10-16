import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './auth/guards/access-token.guard';
import { ProviderModule } from './provider/provider.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { JwtService } from '@nestjs/jwt';
import { FileModule } from './file/file.module';
import { FriendsModule } from './friends/friends.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'info',
        // level: 'silent',
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            singleLine: true,
          },
        },
      },
    }),
    AuthModule,
    UsersModule,
    ProviderModule,
    ChatModule,
    FileModule,
    GameModule,
    FriendsModule,
    NotificationsModule,
  ],
  providers: [
    JwtService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
