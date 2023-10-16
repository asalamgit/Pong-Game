import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AcceptInvitationDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  opponentId: number;

  @IsString()
  @IsNotEmpty()
  mode: string;
}
