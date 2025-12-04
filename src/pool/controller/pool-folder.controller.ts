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

import { AttachMemberToPoolViaLinkDto } from '../dto/request/attach-member-to-pool-via-link-dto';
import { CreatePoolFolderDto } from '../dto/request/create-pool-folder.dto';
import { PoolFolderParamsDto } from '../dto/request/pool-folder-params.dto';
import { PoolFolderQueryDto } from '../dto/request/pool-folder-query.dto';
import { UpdatePoolFolderDto } from '../dto/request/update-pool-folder.dto';
import { PoolFolderService } from '../service/pool-folder.service';

@ApiTags('Pool Folder')
@Controller('pool-folder')
export class PoolFolderController {
  constructor(private readonly poolFolderService: PoolFolderService) {}

  @ApiOperation({
    summary: 'Generate pool folder connection link',
    description:
      'Generate a link that can be used to add members to a pool folder. Only the owner or members with owner privileges can generate this link.',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  @Get('generate-link/:id')
  @HttpCode(HttpStatus.OK)
  async generateLinkForJoinPoolFolder(
    @Param() params: PoolFolderParamsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user.sub;
    const poolMember =
      await this.poolFolderService.generateLinkForJoinPoolFolder(
        userId,
        params.id,
      );

    return {
      statusCode: HttpStatus.OK,
      message: 'Pool link generated successfully',
      data: poolMember,
    };
  }

  @ApiOperation({
    summary: 'Attach member to pool via link',
    description:
      'Attach a member to a pool folder using a generated link code.',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  @Post('join/:linkCode')
  @HttpCode(HttpStatus.OK)
  async attachAMemberToPoolViaLink(
    @Req() request: AuthenticatedRequest,
    @Param() params: AttachMemberToPoolViaLinkDto,
  ) {
    const userId = request.user.sub;
    const poolMember = await this.poolFolderService.attachAMemberToPoolViaLink(
      userId,
      params.linkCode,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Member is successfully attached to the pool folder',
      data: poolMember,
    };
  }

  @ApiOperation({
    summary: 'Create Pool Folder',
    description:
      'Create a new pool folder. Can be used with or without authentication. For anonymous users, email is required.',
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

    const poolFolder = await this.poolFolderService.createPoolFolder(
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
    description: 'Retrieve a specific pool folder by its ID',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPoolFolderById(
    @Param() params: PoolFolderParamsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user.sub;

    const poolFolder = await this.poolFolderService.getPoolFolderById(
      params.id,
      userId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Pool folder retrieved successfully',
      data: poolFolder,
    };
  }

  @ApiOperation({
    summary: 'Get User Pool Folders',
    description: 'Get all pool folders owned by the authenticated user',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  @Get('user/owned')
  @HttpCode(HttpStatus.OK)
  async getUserPoolFolders(@Req() request: AuthenticatedRequest) {
    const userId = request.user.sub;

    const poolFolders = await this.poolFolderService.getUserPoolFolders(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'User pool folders retrieved successfully',
      data: poolFolders,
    };
  }

  @ApiOperation({
    summary: 'Get Pool Folders Where User is Member',
    description:
      'Get all pool folders where the authenticated user is a member',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  @Get('user/member')
  @HttpCode(HttpStatus.OK)
  async getPoolFoldersByUser(@Req() request: AuthenticatedRequest) {
    const userId = request.user.sub;

    const poolFolders =
      await this.poolFolderService.getPoolFoldersByUser(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Pool folders retrieved successfully',
      data: poolFolders,
    };
  }

  @ApiOperation({
    summary: 'Get All Pool Folders',
    description: 'Get all pool folders with pagination',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllPoolFolders(
    @Query() poolFolderQueryDto: PoolFolderQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user.sub;
    const result =
      await this.poolFolderService.getAllPoolFolders(poolFolderQueryDto);

    return {
      statusCode: HttpStatus.OK,
      message: 'Pool folders retrieved successfully',
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Update Pool Folder',
    description:
      'Update a pool folder. Only the owner or members with owner privileges can update.',
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
    const poolFolder = await this.poolFolderService.updatePoolFolder(
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
    description:
      'Delete a pool folder. Only the owner or members with owner privileges can delete.',
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
    await this.poolFolderService.deletePoolFolder(params.id, userId);

    return null;
  }
}
