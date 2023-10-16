import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class QuitQueueDto {
  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  mode: string;

  @IsString()
  @IsNotEmpty()
  opponent: string;
}
