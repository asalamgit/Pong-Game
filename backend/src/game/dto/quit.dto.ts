import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class QuitDto {
  @IsString()
  @IsNotEmpty()
  room: string;

  @IsNumber()
  userId: number;
}
