import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { Login42Strategy } from './strategies/login-42.strategy';
import { LoginGoogleStrategy } from './strategies/login-google.strategy';
import { LoginFacebookStrategy } from './strategies/login-facebook.strategy';
import { ProviderModule } from 'src/provider/provider.module';
import { TwoFactorStrategy } from './strategies/two-factor.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({}),
    ProviderModule,
  ],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    Login42Strategy,
    LoginGoogleStrategy,
    LoginFacebookStrategy,
    TwoFactorStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
