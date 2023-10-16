import { ApiProperty } from '@nestjs/swagger';

export class JwtPayload {
  @ApiProperty()
  sub: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  isTwoFa: boolean;

  @ApiProperty()
  iat?: number;

  @ApiProperty()
  exp?: number;
}
