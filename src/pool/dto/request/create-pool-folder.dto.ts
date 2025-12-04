import { IsString, Length } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreatePoolFolderDto {
  @ApiProperty({
    description: 'Name of the pool folder',
    example: 'Bolola25',
    maxLength: 64,
    required: true,
  })
  @IsString()
  @Length(1, 64)
  name: string;
}
