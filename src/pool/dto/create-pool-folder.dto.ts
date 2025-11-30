import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length, MaxLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreatePoolFolderDto {
    @ApiProperty({
        description: 'Name of the pool folder',
        example: 'My Pool Folder',
        maxLength: 64,
        required: true,
    })
    @IsString()
    @Length(1, 64)
    name: string;

    @ApiProperty({
        description: 'Email address for anonymous user (optional if authenticated)',
        example: 'user@example.com',
        format: 'email',
        required: false,
    })
    @IsEmail()
    @Transform(({ value }) => value?.toLowerCase())
    @IsOptional()
    email?: string;

    @ApiProperty({
        description: 'First name for anonymous user (optional)',
        example: 'John',
        required: false,
    })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    firstName?: string;

    @ApiProperty({
        description: 'Last name for anonymous user (optional)',
        example: 'Doe',
        required: false,
    })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    lastName?: string;
}
