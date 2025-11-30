import { Expose } from 'class-transformer';

export class PaginationResDto {
  @Expose()
  totalRecords: number;

  @Expose()
  currentPage: number;

  @Expose()
  totalPages: number;

  @Expose()
  perPage: number;

  @Expose()
  recordStart: number;

  @Expose()
  recordEnd: number;
}
