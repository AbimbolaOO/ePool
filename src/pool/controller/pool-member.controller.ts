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

import { AuthenticatedRequest, IJwtPayLoadData } from '../../interface';
import {
  CreatePoolMemberDto,
  PoolMemberParamsDto,
  PoolMemberQueryDto,
  UpdatePoolMemberDto,
} from '../dto/request';
import { PoolMemberService } from '../service/pool-member.service';

@ApiTags('Pool Member')
@Controller('pool-member')
export class PoolMemberController {
    constructor(private readonly poolMemberService: PoolMemberService) {}

    @ApiOperation({
        summary: 'Add Pool Member',
        description:
            'Add a member to a pool folder. Only the owner or members with owner privileges can add new members.',
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createPoolMember(
        @Req() request: AuthenticatedRequest,
        @Body() createPoolMemberDto: CreatePoolMemberDto,
    ) {
        const userId = request.user.sub;

        const poolMember = await this.poolMemberService.createPoolMember(
            createPoolMemberDto,
            userId,
        );

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Pool member added successfully',
            data: poolMember,
        };
    }

    @ApiOperation({
        summary: 'Get Pool Member by ID',
        description: 'Retrieve a specific pool member by its ID',
    })
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getPoolMemberById(@Param() params: PoolMemberParamsDto) {
        const poolMember = await this.poolMemberService.getPoolMemberById(
            params.id,
        );

        return {
            statusCode: HttpStatus.OK,
            message: 'Pool member retrieved successfully',
            data: poolMember,
        };
    }

    @ApiOperation({
        summary: 'Get Pool Members by Folder',
        description:
            'Get all members of a specific pool folder. User must be owner or member of the folder.',
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Get('folder/:poolFolderId')
    @HttpCode(HttpStatus.OK)
    async getPoolMembersByFolder(
        @Param('poolFolderId') poolFolderId: string,
        @Req() request: AuthenticatedRequest,
    ) {
        const userId = request.user.sub;

        const poolMembers = await this.poolMemberService.getPoolMembersByFolder(
            poolFolderId,
            userId,
        );

        return {
            statusCode: HttpStatus.OK,
            message: 'Pool members retrieved successfully',
            data: poolMembers,
        };
    }

    @ApiOperation({
        summary: 'Get User Pool Memberships',
        description: 'Get all pool memberships for the authenticated user',
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Get('user/memberships')
    @HttpCode(HttpStatus.OK)
    async getUserPoolMemberships(@Req() request: AuthenticatedRequest) {
        const userId = request.user.sub;

        const poolMemberships =
            await this.poolMemberService.getUserPoolMemberships(userId);

        return {
            statusCode: HttpStatus.OK,
            message: 'User pool memberships retrieved successfully',
            data: poolMemberships,
        };
    }

    @ApiOperation({
        summary: 'Get All Pool Members',
        description: 'Get all pool members with pagination',
    })
    @Get()
    @HttpCode(HttpStatus.OK)
    async getAllPoolMembers(@Query() poolMemberQueryDto: PoolMemberQueryDto) {
        const result =
            await this.poolMemberService.getAllPoolMembers(poolMemberQueryDto);

        return {
            statusCode: HttpStatus.OK,
            message: 'Pool members retrieved successfully',
            data: result,
        };
    }

    @ApiOperation({
        summary: 'Update Pool Member',
        description:
            'Update a pool member. Only the owner or members with owner privileges can update.',
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async updatePoolMember(
        @Param() params: PoolMemberParamsDto,
        @Body() updatePoolMemberDto: UpdatePoolMemberDto,
        @Req() request: AuthenticatedRequest,
    ) {
        const userId = request.user.sub;

        const poolMember = await this.poolMemberService.updatePoolMember(
            params.id,
            updatePoolMemberDto,
            userId,
        );

        return {
            statusCode: HttpStatus.OK,
            message: 'Pool member updated successfully',
            data: poolMember,
        };
    }

    @ApiOperation({
        summary: 'Remove Pool Member',
        description:
            'Remove a member from a pool folder. Only the owner, members with owner privileges, or the member themselves can do this.',
    })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deletePoolMember(
        @Param() params: PoolMemberParamsDto,
        @Req() request: AuthenticatedRequest,
    ) {
        const userId = request.user.sub;

        const result = await this.poolMemberService.deletePoolMember(
            params.id,
            userId,
        );

        return {
            statusCode: HttpStatus.OK,
            message: result.message,
            data: null,
        };
    }
}
