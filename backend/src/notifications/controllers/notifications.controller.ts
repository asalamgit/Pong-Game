import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from '../services/notifications.service';
import { Payload } from 'src/auth/decorators/payload.decorator';
import { JwtPayload } from 'src/auth/types/JwtPayload';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('/')
  async getNotifications(@Payload() payload: JwtPayload) {
    return this.notificationsService.findMany(payload.sub);
  }
}
