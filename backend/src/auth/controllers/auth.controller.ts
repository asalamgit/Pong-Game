import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Public } from '../decorators/public.decorator';
import { Credentials } from '../dto/credentials.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Token } from '../types/Token';
import { Payload } from '../decorators/payload.decorator';
import { JwtPayload } from '../types/JwtPayload';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { AuthGuard } from '@nestjs/passport';
import type { Profile as Profile42 } from 'passport-42';
import type { Profile as ProfileGoogle } from 'passport-google-oauth';
import type { Profile as ProfileFacebook } from 'passport-facebook';
import type { Request, Response } from 'express';
import { REFRESH_TOKEN_COOKIE } from 'src/constants';
import { ProviderType } from '@prisma/client';
import { TwoFa } from '../dto/twoFa.dto';
import { TwoFactorGuard } from '../guards/two-factor.guard';

@ApiTags('auth')
@Controller('auth')
@ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private createRefreshTokenCookie(response: Response, token: string) {
    response.cookie(REFRESH_TOKEN_COOKIE, token, {
      httpOnly: true,
      signed: true,
    });
  }

  private createUrlWithToken(
    request: Request,
    token: string,
    needTwoFa: boolean,
  ) {
    const url = new URL(`${request.protocol}:${request.hostname}`);
    url.port = '8080';
    url.searchParams.set('code', token);
    url.searchParams.set('twoFa', String(needTwoFa));
    return url;
  }

  @Public()
  @Post('signin')
  @ApiCreatedResponse({ type: Token })
  @ApiUnauthorizedResponse()
  async signin(
    @Res({ passthrough: true }) response: Response,
    @Body() credentials: Credentials,
  ): Promise<Token> {
    const { accessToken, refreshToken, needTwoFa } =
      await this.authService.signin(credentials);
    this.createRefreshTokenCookie(response, refreshToken);
    return { accessToken, needTwoFa };
  }

  @Public()
  @Post('signup')
  @ApiCreatedResponse({ type: Token })
  @ApiUnauthorizedResponse()
  async signup(
    @Res({ passthrough: true }) response: Response,
    @Body() credentials: Credentials,
  ): Promise<Token> {
    const { accessToken, refreshToken, needTwoFa } =
      await this.authService.signup(credentials);
    this.createRefreshTokenCookie(response, refreshToken);
    return { accessToken, needTwoFa };
  }

  @Public()
  @UseGuards(AuthGuard('42'))
  @Get('42')
  @ApiUnauthorizedResponse()
  async loginWith42() {}

  @Public()
  @UseGuards(AuthGuard('42'))
  @Get('42/callback')
  @ApiCreatedResponse({ type: Token })
  @ApiUnauthorizedResponse()
  async redirect42(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Payload() profile: Profile42,
  ) {
    const { accessToken, refreshToken, needTwoFa } =
      await this.authService.signinWithProvider(
        ProviderType.FORTYTWO,
        profile.id,
      );
    this.createRefreshTokenCookie(response, refreshToken);
    const url = this.createUrlWithToken(request, accessToken, needTwoFa);
    response.redirect(url.href);
  }

  @Public()
  @UseGuards(AuthGuard('google'))
  @Get('google')
  async loginWithGoogle() {}

  @Public()
  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  @ApiCreatedResponse({ type: Token })
  @ApiUnauthorizedResponse()
  async redirectGoogle(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Payload() profile: ProfileGoogle,
  ) {
    const { accessToken, refreshToken, needTwoFa } =
      await this.authService.signinWithProvider(
        ProviderType.GOOGLE,
        profile.id,
      );
    this.createRefreshTokenCookie(response, refreshToken);
    const url = this.createUrlWithToken(request, accessToken, needTwoFa);
    response.redirect(url.href);
  }

  @Public()
  @UseGuards(AuthGuard('facebook'))
  @Get('facebook')
  async loginWithFacebook() {}

  @Public()
  @UseGuards(AuthGuard('facebook'))
  @Get('facebook/callback')
  @ApiCreatedResponse({ type: Token })
  @ApiUnauthorizedResponse()
  async redirectFacebook(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Payload() profile: ProfileFacebook,
  ) {
    const { accessToken, refreshToken, needTwoFa } =
      await this.authService.signinWithProvider(
        ProviderType.FACEBOOK,
        profile.id,
      );
    this.createRefreshTokenCookie(response, refreshToken);
    const url = this.createUrlWithToken(request, accessToken, needTwoFa);
    response.redirect(url.href);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Get('token')
  @ApiBearerAuth()
  @ApiOkResponse({ type: Token })
  async token(
    @Payload() payload: JwtPayload,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Token> {
    const { accessToken, refreshToken, needTwoFa } =
      await this.authService.refreshTokens(payload);
    this.createRefreshTokenCookie(response, refreshToken);
    return { accessToken, needTwoFa };
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOkResponse({ type: JwtPayload })
  getProfile(@Payload() payload: JwtPayload): JwtPayload {
    return payload;
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Get('logout')
  @ApiBearerAuth()
  @ApiOkResponse()
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(REFRESH_TOKEN_COOKIE);
  }

  @Public()
  @UseGuards(TwoFactorGuard)
  @Post('2fa/disable')
  async turnOffTwoFa(@Payload() payload: JwtPayload, @Body() body: TwoFa) {
    await this.authService.disableTwoFactorAuthentication(
      payload.sub,
      body.code,
    );
  }

  @Public()
  @UseGuards(TwoFactorGuard)
  @Post('2fa/authenticate')
  async authenticateTwoFa(
    @Payload() payload: JwtPayload,
    @Body() body: TwoFa,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.authenticateTwoFactorAuthentication(
        payload.sub,
        body.code,
      );
    this.createRefreshTokenCookie(response, refreshToken);
    return { accessToken };
  }

  @Public()
  @UseGuards(TwoFactorGuard)
  @Get('2fa/generate')
  async generateQrCode(@Payload() payload: JwtPayload) {
    return await this.authService.generateQrCode(payload.sub);
  }
}
