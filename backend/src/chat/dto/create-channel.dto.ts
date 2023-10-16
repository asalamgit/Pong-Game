import { ChannelType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsEnum(ChannelType)
  type: ChannelType;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  id?: string;
}

export class CreateProtectedChannelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsEnum(ChannelType)
  type: ChannelType;

  @IsString()
  @MinLength(4)
  password: string;
}
