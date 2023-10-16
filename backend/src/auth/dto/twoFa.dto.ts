import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TwoFa {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  code: string;
}
