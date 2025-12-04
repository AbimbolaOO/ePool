import { IsOptional, IsString, IsUUID } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class AttachMemberToPoolViaLinkDto {
  @ApiProperty({
    description: 'link code to attach a member to a pool folder',
    example: 'MsCp',
    format: 'string',
  })
  @IsString()
  linkCode: string;

  // @ApiProperty({
  //     description: 'Id of the user',
  //     example: '7d8e1d54-b42b-40dc-86bb-c9cf682d7cf2',
  //     format: 'uuid',
  //     required: false,
  // })
  // @IsOptional()
  // @IsUUID()
  // userId: string;
}
