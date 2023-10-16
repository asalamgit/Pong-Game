import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PaddleMoveDto {
  @IsString()
  @IsNotEmpty()
  room: string;

  @IsBoolean()
  isPlayerLeft: boolean;

  @IsNumber()
  paddleSpeed: number;
}
