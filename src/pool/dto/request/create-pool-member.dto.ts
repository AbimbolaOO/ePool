import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreatePoolMemberDto {
    @ApiProperty({
        description: 'Pool folder ID to add member to',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid',
        required: true,
    })
    @IsUUID()
    poolFolderId: string;

    @ApiProperty({
        description: 'User ID to add as member',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid',
        required: true,
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        description: 'Whether this member should have owner privileges',
        example: false,
        default: false,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isOwner?: boolean = false;
}
