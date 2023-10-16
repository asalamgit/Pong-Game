import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Payload } from 'src/auth/decorators/payload.decorator';
import { JwtPayload } from 'src/auth/types/JwtPayload';
import { UpdateUsername } from '../dto/UpdateUsername.dto';
import { UpdateBlockedList } from '../dto/UpdateBlockedList.dto';

@ApiTags('users')
@Controller('users')
@ApiInternalServerErrorResponse()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  @ApiOkResponse()
  async me(@Payload() payload: JwtPayload) {
    try {
      const user = await this.usersService.findOne(
        {
          id: payload.sub,
        },
        {
          id: true,
          username: true,
          image: true,
          state: true,
          isTwoFa: true,
        },
      );
      if (!user) throw new BadRequestException('User not found');
      return user;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException();
    }
  }

  @Get('/:id/game')
  @ApiOkResponse()
  async getGames(@Param('id') id: string) {
    return this.usersService.findGames(parseInt(id));
  }

  @Get('/:id')
  @ApiOkResponse()
  async getUserInfo(@Param('id') id: string) {
    try {
      const user = await this.usersService.findOne(
        {
          id: parseInt(id),
        },
        {
          id: true,
          username: true,
          image: true,
          state: true,
          isTwoFa: true,
          profile: {
            select: {
              points: true,
              victories: true,
              defeats: true,
            },
          },
        },
      );
      if (!user) throw new BadRequestException('User not found');
      return user;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException();
    }
  }

  @Post('/update_username')
  async updateUsername(
    @Payload() payload: JwtPayload,
    @Body() body: UpdateUsername,
  ) {
    try {
      return this.usersService.update({ id: payload.sub }, body, {
        username: true,
      });
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException();
    }
  }

  @Post('/block')
  async block(@Payload() payload: JwtPayload, @Body() body: UpdateBlockedList) {
    try {
      await this.usersService.block(payload.sub, body.id);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException();
    }
  }

  @Post('/unblock')
  async unblock(
    @Payload() payload: JwtPayload,
    @Body() body: UpdateBlockedList,
  ) {
    try {
      await this.usersService.unblock(payload.sub, body.id);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException();
    }
  }
}
