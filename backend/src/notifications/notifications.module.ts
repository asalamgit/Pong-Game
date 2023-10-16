import { Module } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationsController } from './controllers/notifications.controller';

@Module({
  imports: [PrismaModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
