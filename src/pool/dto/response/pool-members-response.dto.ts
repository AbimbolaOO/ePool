import { Expose, Type } from 'class-transformer';
import { PaginationResDto } from 'src/utils/helper/dtos/pagination-res.dto';

import { PoolMemberResponseDto } from './pool-member-response.dto';

export class PoolMembersResponseDto extends PaginationResDto {
    @Expose()
    @Type(() => PoolMemberResponseDto)
    records: PoolMemberResponseDto[];
}
