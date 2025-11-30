import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuthenticatedRequest } from 'src/interface';

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

import { CreatePoolFolderDto } from '../dto/create-pool-folder.dto';
import { PoolFolderParamsDto } from '../dto/pool-folder-params.dto';
import { PoolFolderQueryDto } from '../dto/pool-folder-query.dto';
import { UpdatePoolFolderDto } from '../dto/update-pool-folder.dto';
import { PoolService } from '../service/pool.service';

@ApiTags('Pool Folder')
@Controller('pool-folder')
export class PoolFolderController {
    constructor(
        private readonly poolService: PoolService,
    ) {}

    @ApiOperation({
        summary: 'Create Pool Folder',
        description: 'Create a new pool folder. Can be used with or without authentication. For anonymous users, email is required.'
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createPoolFolder(
        @Req() request: AuthenticatedRequest,
        @Body() createPoolFolderDto: CreatePoolFolderDto,
    ) {
        const userId = request.user.sub;

        const poolFolder = await this.poolService.createPoolFolder(
            createPoolFolderDto,
            userId,
        );

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Pool folder created successfully',
            data: poolFolder,
        };
    }

    @ApiOperation({
        summary: 'Get Pool Folder by ID',
        description: 'Retrieve a specific pool folder by its ID'
    })
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getPoolFolderById(@Param() params: PoolFolderParamsDto) {
        const poolFolder = await this.poolService.getPoolFolderById(params.id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Pool folder retrieved successfully',
            data: poolFolder,
        };
    }

    @ApiOperation({
        summary: 'Get User Pool Folders',
        description: 'Get all pool folders owned by the authenticated user'
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Get('user/owned')
    @HttpCode(HttpStatus.OK)
    async getUserPoolFolders(@Req() request: AuthenticatedRequest) {
        const userId = request.user.sub;

        const poolFolders = await this.poolService.getUserPoolFolders(userId);

        return {
            statusCode: HttpStatus.OK,
            message: 'User pool folders retrieved successfully',
            data: poolFolders,
        };
    }

    @ApiOperation({
        summary: 'Get Pool Folders Where User is Member',
        description: 'Get all pool folders where the authenticated user is a member'
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Get('user/member')
    @HttpCode(HttpStatus.OK)
    async getPoolFoldersByUser(@Req() request: AuthenticatedRequest) {
        const userId = request.user.sub;

        const poolFolders = await this.poolService.getPoolFoldersByUser(userId);

        return {
            statusCode: HttpStatus.OK,
            message: 'Pool folders retrieved successfully',
            data: poolFolders,
        };
    }

    @ApiOperation({
        summary: 'Get All Pool Folders',
        description: 'Get all pool folders with pagination'
    })
    @Get()
    @HttpCode(HttpStatus.OK)
    async getAllPoolFolders(@Query() poolFolderQueryDto: PoolFolderQueryDto) {
        const result = await this.poolService.getAllPoolFolders(poolFolderQueryDto);

        return {
            statusCode: HttpStatus.OK,
            message: 'Pool folders retrieved successfully',
            data: result,
        };
    }

    @ApiOperation({
        summary: 'Update Pool Folder',
        description: 'Update a pool folder. Only the owner or members with owner privileges can update.'
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async updatePoolFolder(
        @Param() params: PoolFolderParamsDto,
        @Body() updatePoolFolderDto: UpdatePoolFolderDto,
        @Req() request: AuthenticatedRequest,
    ) {
        const userId = request.user.sub;

        const poolFolder = await this.poolService.updatePoolFolder(
            params.id,
            updatePoolFolderDto,
            userId,
        );

        return {
            statusCode: HttpStatus.OK,
            message: 'Pool folder updated successfully',
            data: poolFolder,
        };
    }

    @ApiOperation({
        summary: 'Delete Pool Folder',
        description: 'Delete a pool folder. Only the owner or members with owner privileges can delete.'
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deletePoolFolder(
        @Param() params: PoolFolderParamsDto,
        @Req() request: AuthenticatedRequest,
    ) {
        const userId = request.user.sub;

        const result = await this.poolService.deletePoolFolder(params.id, userId);

        return {
            statusCode: HttpStatus.OK,
            message: result.message,
            data: null,
        };
    }
}
