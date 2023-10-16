import { IsEnum, IsMimeType, IsString } from 'class-validator';
import { File } from './file.dto';
import { ApiProperty } from '@nestjs/swagger';

export enum MimeType {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  JPG = 'image/jpg',
}

export class FileType extends File {
  @IsEnum(MimeType)
  @IsMimeType()
  @IsString()
  @ApiProperty({ enum: MimeType })
  type: MimeType;
}
