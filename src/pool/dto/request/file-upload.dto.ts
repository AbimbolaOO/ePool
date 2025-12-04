import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
    required: true,
  })
  file: any;
}

export class ExternalUrlUploadDto {
  @ApiProperty({
    description: 'External URL to download file from',
    example: 'https://example.com/image.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Custom filename (optional)',
    example: 'my-image.jpg',
    required: false,
  })
  filename?: string;
}
