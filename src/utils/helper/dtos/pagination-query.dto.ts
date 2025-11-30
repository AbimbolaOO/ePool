import { Transform, Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  perPage: number = 20;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  page: number = 1;
}
