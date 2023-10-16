import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DeclineInvitationDto {
  @IsNumber()
  opponentId: number;

  @IsString()
  @IsNotEmpty()
  username: string;
}
