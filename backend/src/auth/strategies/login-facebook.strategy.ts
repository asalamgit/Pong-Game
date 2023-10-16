import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Strategy, Profile } from 'passport-facebook';
import {
  FACEBOOK_CALLBACK_URL,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
} from 'src/constants';

@Injectable()
export class LoginFacebookStrategy extends PassportStrategy(
  Strategy,
  'facebook',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>(FACEBOOK_CLIENT_ID),
      clientSecret: configService.get<string>(FACEBOOK_CLIENT_SECRET),
      callbackURL: configService.get<string>(FACEBOOK_CALLBACK_URL),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    return profile;
  }
}
