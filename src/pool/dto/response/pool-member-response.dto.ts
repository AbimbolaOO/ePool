import { Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { PoolFolderResponseDto } from './pool-folder-response.dto';
import { UserResponseDto } from './user-response.dto';

export class PoolMemberResponseDto {
    @ApiProperty({
        description: 'Pool member ID',
        example: '150c4c40-8fc2-42ef-9766-ac4bbade9234',
    })
    @Expose()
    id: string;

    @ApiProperty({
        description: 'Whether member is owner of the pool',
        example: true,
    })
    @Expose()
    isOwner: boolean;

    @ApiProperty({
        description: 'Member invitation date',
        example: '2025-12-03T21:32:48.853Z',
    })
    @Expose()
    invitedAt: Date;

    @ApiProperty({
        description: 'Pool member creation date',
        example: '2025-12-03T20:32:48.815Z',
    })
    @Expose()
    createdAt: Date;

    @ApiProperty({
        description: 'Pool member last update date',
        example: '2025-12-03T20:32:48.815Z',
    })
    @Expose()
    updatedAt: Date;

    @ApiProperty({
        description: 'User information',
        type: UserResponseDto,
    })
    @Type(() => UserResponseDto)
    @Expose()
    user: UserResponseDto;

    @ApiProperty({
        description: 'Pool folder information',
        type: PoolFolderResponseDto,
    })
    @Type(() => PoolFolderResponseDto)
    @Expose()
    poolFolder: PoolFolderResponseDto;
}
