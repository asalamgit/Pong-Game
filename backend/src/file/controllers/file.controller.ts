import {
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { FileService } from '../services/file.service';
import { FileType } from '../dto/file-type.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Payload } from 'src/auth/decorators/payload.decorator';
import { JwtPayload } from 'src/auth/types/JwtPayload';
import { File } from '../dto/file.dto';

@ApiTags('file')
@Controller('file')
@ApiBadRequestResponse()
@ApiInternalServerErrorResponse()
@ApiBearerAuth()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('/download/:id')
  @ApiResponse({ status: 200, type: String })
  async downloadById(@Param('id') id: string) {
    try {
      return this.fileService.createSignedUrlGet(parseInt(id, 10));
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException();
    }
  }

  @Post('/upload')
  async upload(@Payload() payload: JwtPayload, @Body() file: FileType) {
    try {
      return this.fileService.createSignedUrlPost(payload, file);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException();
    }
  }

  @Put('/confirm')
  async confirmUpload(@Payload() payload: JwtPayload, @Body() file: File) {
    try {
      return this.fileService.confirmUpload(payload, file);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException();
    }
  }
}
