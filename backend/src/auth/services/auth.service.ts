import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../types/JwtPayload';
import { Credentials } from '../dto/credentials.dto';
import { ConfigService } from '@nestjs/config';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
} from 'src/constants';
import { Token } from '../types/Token';
import * as argon from 'argon2';
import { ProviderService } from 'src/provider/provider.service';
import { ProviderType } from '@prisma/client';
import { toDataURL } from 'qrcode';
import { authenticator } from 'otplib';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly providerService: ProviderService,
  ) {}

  private generateAccessToken(payload: JwtPayload) {
    delete payload.iat;
    delete payload.exp;
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>(ACCESS_TOKEN_SECRET),
      expiresIn: this.configService.get<string>(ACCESS_TOKEN_EXPIRES_IN),
    });
  }

  private generateRefreshToken(payload: JwtPayload) {
    delete payload.iat;
    delete payload.exp;
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>(REFRESH_TOKEN_SECRET),
      expiresIn: this.configService.get<string>(REFRESH_TOKEN_EXPIRES_IN),
    });
  }

  private async generateTwoFactorAuthenticationSecret(id: number) {
    const user = await this.usersService.findOne({ id });
    const secret = authenticator.generateSecret();

    const otpAuthUrl = authenticator.keyuri(
      user.username,
      'ft_transcendence',
      secret,
    );

    await this.usersService.update({ id }, { twoFaSecret: secret });

    return {
      secret,
      otpAuthUrl,
    };
  }

  private isTwoFactorAuthenticationCodeValid(token: string, secret: string) {
    return authenticator.verify({
      token,
      secret,
    });
  }

  async generateQrCode(id: number) {
    const { otpAuthUrl, secret } =
      await this.generateTwoFactorAuthenticationSecret(id);
    const url = await toDataURL(otpAuthUrl);

    return {
      secret,
      url,
    };
  }

  async disableTwoFactorAuthentication(id: number, code: string) {
    const user = await this.usersService.findOne({ id });

    if (!user) throw new BadRequestException('User not found');
    const isCodeValid = this.isTwoFactorAuthenticationCodeValid(
      code,
      user.twoFaSecret,
    );
    if (!isCodeValid)
      throw new UnauthorizedException('Wrong authentication code');

    await this.usersService.update(
      { id },
      {
        isTwoFa: false,
        twoFaSecret: '',
      },
    );
  }

  async authenticateTwoFactorAuthentication(id: number, code: string) {
    const user = await this.usersService.findOne({ id });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isCodeValid = this.isTwoFactorAuthenticationCodeValid(
      code,
      user.twoFaSecret,
    );
    if (!isCodeValid)
      throw new UnauthorizedException('Wrong authentication code');

    if (!user.isTwoFa)
      await this.usersService.update({ id }, { isTwoFa: true });

    return this.getTokens(
      {
        username: user.username,
        sub: user.id,
        isTwoFa: true,
      },
      false,
    );
  }

  async signin({ username, password }: Credentials) {
    try {
      const user = await this.usersService.findOne({ username });

      if (!user) {
        throw new BadRequestException('user does not exist.');
      }

      const match = await argon.verify(user.password, password);
      if (!match) {
        throw new ForbiddenException('Wrong password.');
      }

      return this.getTokens(
        { username, sub: user.id, isTwoFa: false },
        user.isTwoFa,
      );
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException();
    }
  }

  async signup({ username, password }: Credentials) {
    try {
      const user = await this.usersService.findOne({ username });

      if (user) {
        throw new BadRequestException('Username already taken.');
      }

      const hash = await argon.hash(password);

      const newUser = await this.usersService.create({
        username,
        password: hash,
      });

      if (!newUser) {
        throw new InternalServerErrorException();
      }

      return this.getTokens(
        {
          username,
          sub: newUser.id,
          isTwoFa: false,
        },
        newUser.isTwoFa,
      );
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException();
    }
  }

  async signinWithProvider(type: ProviderType, sub: string) {
    try {
      const provider = await this.providerService.findOne(sub, type);

      if (provider) {
        return this.getTokens(
          {
            username: provider.user.username,
            sub: provider.user.id,
            isTwoFa: false,
          },
          provider.user.isTwoFa,
        );
      }

      const user = await this.usersService.create({});
      if (!user) {
        throw new InternalServerErrorException();
      }
      const newProvider = await this.providerService.create(type, sub, user.id);
      if (!newProvider) {
        throw new InternalServerErrorException();
      }
      return this.getTokens(
        {
          username: user.username,
          sub: user.id,
          isTwoFa: false,
        },
        false,
      );
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException();
    }
  }

  async refreshTokens(payload: JwtPayload) {
    const user = await this.usersService.findOne({ id: payload.sub });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.getTokens(payload, user.isTwoFa && !payload.isTwoFa);
  }

  getTokens(
    payload: JwtPayload,
    needTwoFa: boolean,
  ): Token & { refreshToken: string; needTwoFa: boolean } {
    try {
      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(payload);

      return {
        accessToken,
        refreshToken,
        needTwoFa,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
