import { Transform, Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    required: false,
    default: 20,
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  perPage: number = 20;

  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  page: number = 1;
}
