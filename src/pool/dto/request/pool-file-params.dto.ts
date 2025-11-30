import { IsUUID } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class PoolFileParamsDto {
    @ApiProperty({
        description: 'Pool file ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid',
    })
    @IsUUID()
    id: string;
}
