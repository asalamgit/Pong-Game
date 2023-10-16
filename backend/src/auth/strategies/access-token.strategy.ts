import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ACCESS_TOKEN_SECRET } from 'src/constants';
import { JwtPayload } from '../types/JwtPayload';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>(ACCESS_TOKEN_SECRET),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findOne({ id: payload.sub });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isTwoFa && !payload.isTwoFa) {
      throw new UnauthorizedException('2FA not authenticated');
    }

    return payload;
  }
}
