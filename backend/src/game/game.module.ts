import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { GameGateway } from './gateways/game.gateway';
import { GameService } from './services/game.service';

@Module({
  imports: [PrismaModule, JwtModule, UsersModule],
  providers: [GameGateway, GameService, JwtService, ConfigService],
})
export class GameModule {}
