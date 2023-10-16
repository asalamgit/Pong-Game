import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

// Properties username is linked with username inside Credentials dto
export class UpdateUsername {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  username: string;
}
