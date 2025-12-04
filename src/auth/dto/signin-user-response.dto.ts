import { Exclude, Expose } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

export class SignInUserResponseDto {
    @ApiProperty({
        description: 'User ID',
        example: '7d8e1d54-b42b-40dc-86bb-c9cf682d7cf2',
    })
    @Expose()
    id: string;

    @ApiProperty({
        description: 'Username',
        example: 'Whyte',
    })
    @Expose()
    username: string;

    @ApiProperty({
        description: 'User email address',
        example: 'abimbolaolayemiwhyte@gmail.com',
    })
    @Expose()
    email: string;

    @ApiProperty({
        description: 'User first name',
        example: 'John',
        nullable: true,
    })
    @Expose()
    firstName: string | null;

    @ApiProperty({
        description: 'User last name',
        example: 'Doe',
        nullable: true,
    })
    @Expose()
    lastName: string | null;

    @ApiProperty({
        description: 'User gender',
        example: 'male',
        nullable: true,
    })
    @Expose()
    gender: string | null;

    @Exclude()
    password: string;

    @ApiProperty({
        description: 'Whether user is verified',
        example: true,
    })
    @Expose()
    isVerified: boolean;

    @ApiProperty({
        description: 'Whether user is anonymous',
        example: false,
    })
    @Expose()
    isAnonymous: boolean;

    @ApiProperty({
        description: 'Whether user is deactivated',
        example: false,
    })
    @Expose()
    isDeactivated: boolean;

    @ApiProperty({
        description: 'User creation date',
        example: '2025-11-30T08:47:09.965Z',
    })
    @Expose()
    createdAt: Date;

    @ApiProperty({
        description: 'User last update date',
        example: '2025-11-30T08:47:24.168Z',
    })
    @Expose()
    updatedAt: Date;

    @ApiProperty({
        description: 'User deletion date',
        example: null,
        nullable: true,
    })
    @Expose()
    deletedAt: Date | null;
}
