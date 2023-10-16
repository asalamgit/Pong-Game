import { IsUUID } from 'class-validator';

export class CheckChannelIdDto {
  @IsUUID('all')
  id: string;

  password?: string;
}
