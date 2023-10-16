import { IsNotEmpty, IsString } from 'class-validator';

export class BallMoveDto {
  @IsString()
  @IsNotEmpty()
  room: string;
}
