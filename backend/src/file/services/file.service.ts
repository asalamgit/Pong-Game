import {
  GetObjectCommand,
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AWS_ACCESS_KEY_ID,
  AWS_BUCKET_NAME,
  AWS_EXPIRES_IN,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
  AWS_TMP_BUCKET_NAME,
} from 'src/constants';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileType } from '../dto/file-type.dto';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { UsersService } from 'src/users/services/users.service';
import { JwtPayload } from 'src/auth/types/JwtPayload';
import { File } from '../dto/file.dto';

@Injectable()
export class FileService {
  private client: S3Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    this.client = new S3Client({
      region: configService.get(AWS_REGION),
      credentials: {
        accessKeyId: configService.get(AWS_ACCESS_KEY_ID),
        secretAccessKey: configService.get(AWS_SECRET_ACCESS_KEY),
      },
    });
  }

  private async deleteFile(bucket: string, filename: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: filename,
      }),
    );
  }

  async createSignedUrlGet(id: number) {
    const user = await this.usersService.findOne({ id });
    if (!user) throw new BadRequestException('User not found');
    if (!user.image) return 'http://localhost:8080/default.jpg';

    const command = new GetObjectCommand({
      Bucket: this.configService.get(AWS_BUCKET_NAME),
      Key: user.image,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: AWS_EXPIRES_IN,
    });

    return url;
  }

  async createSignedUrlPost(payload: JwtPayload, file: FileType) {
    const user = await this.usersService.findOne({ id: payload.sub });
    if (!user) throw new BadRequestException('User not found');

    const filename = `${user.username}_${file.name}`;

    // Create presigned post to upload file in temporary bucket
    const url = await createPresignedPost(this.client, {
      Bucket: this.configService.get(AWS_TMP_BUCKET_NAME),
      Key: filename,
      Fields: {
        'Content-Type': file.type,
      },
      Expires: AWS_EXPIRES_IN,
      Conditions: [['content-length-range', 0, 1048576 * 10]], // up to 1MB
    });

    return url;
  }

  async confirmUpload(payload: JwtPayload, file: File) {
    const bucket = this.configService.get(AWS_BUCKET_NAME);
    const tmpBucket = this.configService.get(AWS_TMP_BUCKET_NAME);
    const user = await this.usersService.findOne({ id: payload.sub });
    if (!user) throw new BadRequestException('User not found');

    // Delete current image inside bucket
    if (user.image) {
      await this.deleteFile(bucket, user.image);
    }

    const filename = `${user.username}_${file.name}`;

    // Copy image from temporary bucket to bucket
    await this.client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        Key: filename,
        CopySource: `${tmpBucket}/${filename}`,
      }),
    );

    // Delete image inside temporary bucket
    await this.deleteFile(tmpBucket, filename);

    const newUser = await this.usersService.update(
      { username: user.username },
      { image: `https://mbeaujar-transcendence.s3.amazonaws.com/${filename}` },
      { id: true },
    );

    if (!newUser) throw new InternalServerErrorException();
  }
}
