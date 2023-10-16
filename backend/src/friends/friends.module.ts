import { Module } from '@nestjs/common';
import { FriendsGateway } from './gateway/friends.gateway';
import { FriendsService } from './services/friends.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [PrismaModule, JwtModule, UsersModule, NotificationsModule],
  providers: [FriendsGateway, FriendsService],
})
export class FriendsModule {}
