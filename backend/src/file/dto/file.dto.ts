import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class File {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
