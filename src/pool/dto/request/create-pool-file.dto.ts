import { IsNumber, IsString, IsUrl, Length, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreatePoolFileDto {
  @ApiProperty({
    description: 'Original filename of the uploaded file',
    example: 'vacation-photo.jpg',
    maxLength: 255,
    required: true,
  })
  @IsString()
  @Length(1, 255)
  filename: string;

  @ApiProperty({
    description: 'URL where the file is stored',
    example: 'https://storage.example.com/files/vacation-photo.jpg',
    required: true,
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1048576,
    minimum: 0,
    required: true,
  })
  @IsNumber()
  @Min(0)
  size: number;

  @ApiProperty({
    description: 'Aspect ratio of the file (width/height)',
    example: 1.77,
    minimum: 0,
    required: true,
  })
  @IsNumber()
  @Min(0)
  aspectRatio: number;

  @ApiProperty({
    description: 'Width dimension for aspect ratio calculation',
    example: 1920,
    minimum: 0,
    required: true,
  })
  @IsNumber()
  @Min(0)
  aspectRatioW: number;

  @ApiProperty({
    description: 'Height dimension for aspect ratio calculation',
    example: 1080,
    minimum: 0,
    required: true,
  })
  @IsNumber()
  @Min(0)
  aspectRatioH: number;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/jpeg',
    required: true,
  })
  @IsString()
  mimetype: string;
}
