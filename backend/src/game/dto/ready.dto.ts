import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ReadyDto {
  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  mode: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  opponent: string;
}
