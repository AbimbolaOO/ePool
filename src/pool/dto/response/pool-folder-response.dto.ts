import { Expose } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

export class PoolFolderResponseDto {
    @ApiProperty({
        description: 'Pool folder ID',
        example: '0bc9b859-c9c6-4d02-912b-fb9d7ff5f22c',
    })
    @Expose()
    id: string;

    @ApiProperty({
        description: 'Pool folder name',
        example: 'Bolola25',
    })
    @Expose()
    name: string;

    @ApiProperty({
        description: 'Pool folder link code',
        example: '66t3',
    })
    @Expose()
    linkCode: string;

    @ApiProperty({
        description: 'Link generation date',
        example: '2025-12-03T21:42:47.072Z',
    })
    @Expose()
    linkGeneratedAt: Date;

    @ApiProperty({
        description: 'Pool folder creation date',
        example: '2025-12-03T20:32:48.815Z',
    })
    @Expose()
    createdAt: Date;

    @ApiProperty({
        description: 'Pool folder last update date',
        example: '2025-12-04T10:19:48.526Z',
    })
    @Expose()
    updatedAt: Date;
}
