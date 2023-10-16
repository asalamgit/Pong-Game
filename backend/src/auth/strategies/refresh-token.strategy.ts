import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_SECRET } from 'src/constants';
import { JwtPayload } from '../types/JwtPayload';
import type { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.signedCookies[REFRESH_TOKEN_COOKIE],
      ]),
      secretOrKey: configService.get(REFRESH_TOKEN_SECRET),
    });
  }

  async validate(payload: JwtPayload) {
    return payload;
  }
}
