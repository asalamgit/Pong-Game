import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Strategy, Profile } from 'passport-42';
import { FT_CLIENT_ID, FT_CLIENT_SECRET, FT_CALLBACK_URL } from 'src/constants';

@Injectable()
export class Login42Strategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>(FT_CLIENT_ID),
      clientSecret: configService.get<string>(FT_CLIENT_SECRET),
      callbackURL: configService.get<string>(FT_CALLBACK_URL),
      // failureRedirect: 'https://www.google.com', // is it working ?
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    return profile;
  }
}
