import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CheckChannelIdDto } from './check-channel.dto';
import { ChannelType } from '@prisma/client';

export class ChannelDto extends CheckChannelIdDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ChannelType)
  type: ChannelType;
}

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @ValidateNested()
  @IsObject()
  channel: ChannelDto;

  @IsBoolean()
  isInfo: boolean;
}

export class UserActionsDto {
  @IsNumber()
  userId: number;

  @IsUUID('all')
  channelId: string;
}

export class UserActionsMuteDto {
  @IsNumber()
  userId: number;

  @IsUUID('all')
  channelId: string;

  @IsOptional()
  @IsString()
  timeMute?: number;
}

export class directMessagesExistDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
