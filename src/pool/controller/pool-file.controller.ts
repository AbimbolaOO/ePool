import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';

import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { IJwtPayLoadData } from '../../interface';
import {
    CreatePoolFileDto,
    PoolFileParamsDto,
    PoolFileQueryDto,
    UpdatePoolFileDto,
} from '../dto/request';
import { PoolFileService } from '../service/pool-file.service';

interface AuthenticatedRequest extends Request {
    user: IJwtPayLoadData;
}

@ApiTags('Pool File')
@Controller('pool-file')
export class PoolFileController {
    constructor(
        private readonly poolFileService: PoolFileService,
    ) {}

    @ApiOperation({
        summary: 'Create Pool File',
        description: 'Upload a file to a specific pool folder. User must be owner or member of the pool folder.'
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Post(':poolFolderId')
    @HttpCode(HttpStatus.CREATED)
    async createPoolFile(
        @Param('poolFolderId') poolFolderId: string,
        @Req() request: AuthenticatedRequest,
        @Body() createPoolFileDto: CreatePoolFileDto,
    ) {
        const userId = request.user.sub;

        const poolFile = await this.poolFileService.createPoolFile(
            createPoolFileDto,
            poolFolderId,
            userId,
        );

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Pool file created successfully',
            data: poolFile,
        };
    }

    @ApiOperation({
        summary: 'Get Pool File by ID',
        description: 'Retrieve a specific pool file by its ID'
    })
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getPoolFileById(@Param() params: PoolFileParamsDto) {
        const poolFile = await this.poolFileService.getPoolFileById(params.id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Pool file retrieved successfully',
            data: poolFile,
        };
    }

    @ApiOperation({
        summary: 'Get User Pool Files',
        description: 'Get all pool files owned by the authenticated user'
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Get('user/owned')
    @HttpCode(HttpStatus.OK)
    async getUserPoolFiles(@Req() request: AuthenticatedRequest) {
        const userId = request.user.sub;

        const poolFiles = await this.poolFileService.getUserPoolFiles(userId);

        return {
            statusCode: HttpStatus.OK,
            message: 'User pool files retrieved successfully',
            data: poolFiles,
        };
    }

    @ApiOperation({
        summary: 'Get All Pool Files',
        description: 'Get all pool files with pagination'
    })
    @Get()
    @HttpCode(HttpStatus.OK)
    async getAllPoolFiles(@Query() poolFileQueryDto: PoolFileQueryDto) {
        const result = await this.poolFileService.getAllPoolFiles(poolFileQueryDto);

        return {
            statusCode: HttpStatus.OK,
            message: 'Pool files retrieved successfully',
            data: result,
        };
    }

    @ApiOperation({
        summary: 'Update Pool File',
        description: 'Update a pool file. Only the owner or members with owner privileges can update.'
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async updatePoolFile(
        @Param() params: PoolFileParamsDto,
        @Body() updatePoolFileDto: UpdatePoolFileDto,
        @Req() request: AuthenticatedRequest,
    ) {
        const userId = request.user.sub;

        const poolFile = await this.poolFileService.updatePoolFile(
            params.id,
            updatePoolFileDto,
            userId,
        );

        return {
            statusCode: HttpStatus.OK,
            message: 'Pool file updated successfully',
            data: poolFile,
        };
    }

    @ApiOperation({
        summary: 'Delete Pool File',
        description: 'Delete a pool file. Only the owner or members with owner privileges can delete.'
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deletePoolFile(
        @Param() params: PoolFileParamsDto,
        @Req() request: AuthenticatedRequest,
    ) {
        const userId = request.user.sub;

        const result = await this.poolFileService.deletePoolFile(params.id, userId);

        return {
            statusCode: HttpStatus.OK,
            message: result.message,
            data: null,
        };
    }
}
