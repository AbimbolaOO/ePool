import { Expose } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

export class AuthCredentialsDto {
    @ApiProperty({
        description: 'Access token for authentication',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @Expose()
    accessToken: string;

    @ApiProperty({
        description: 'Refresh token for generating new access tokens',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @Expose()
    refreshToken: string;

    @ApiProperty({
        description: 'Access token time to live in seconds',
        example: 3600,
    })
    @Expose()
    accessTokenTtl: number;
}
