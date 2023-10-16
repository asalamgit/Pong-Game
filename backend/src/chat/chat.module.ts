import { Module } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { ChatGateway } from './gateways/chat.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [PrismaModule, JwtModule, UsersModule],
  providers: [ChatGateway, ChatService, JwtService, ConfigService],
})
export class ChatModule {}
