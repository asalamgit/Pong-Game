import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

// Properties username is linked with username inside Credentials dto
export class UpdateBlockedList {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
