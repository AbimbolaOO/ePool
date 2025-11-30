import { IsOptional, IsString, Length } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdatePoolFolderDto {
    @ApiProperty({
        description: 'Name of the pool folder',
        example: 'Updated Pool Folder Name',
        maxLength: 64,
        required: false,
    })
    @IsString()
    @Length(1, 64)
    @IsOptional()
    name?: string;
}
