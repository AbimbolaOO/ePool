import { AuthGuard } from 'src/guards/auth.guard';
import { AuthenticatedRequest } from 'src/interface';

import {
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { FileUploadDto, PoolFileParamsDto, PoolFileQueryDto } from '../dto/request';
import { PoolFileService } from '../service/pool-file.service';

@ApiTags('Pool File')
@Controller('pool-file')
export class PoolFileController {
  constructor(private readonly poolFileService: PoolFileService) {}

  @ApiOperation({
    summary: 'Upload File and Create Pool File',
    description:
      'Upload a file to Digital Ocean Spaces and create a pool file record in one step',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'File upload', type: FileUploadDto })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload/:poolFolderId')
  @HttpCode(HttpStatus.CREATED)
  async uploadAndCreatePoolFile(
    @Param('poolFolderId') poolFolderId: string,
    @Req() request: AuthenticatedRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB limit
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|gif|webp|pdf|doc|docx|txt|mp4|avi|mov)$/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const userId = request.user.sub;
    const result = await this.poolFileService.createPoolFile(
      poolFolderId,
      userId,
      file,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'File uploaded and pool file created successfully',
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Get Pool File by ID',
    description: 'Retrieve a specific pool file by its ID',
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
    description: 'Get all pool files owned by the authenticated user with pagination',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  @Get('user/owned')
  @HttpCode(HttpStatus.OK)
  async getUserPoolFiles(
    @Req() request: AuthenticatedRequest,
    @Query() poolFileQueryDto: PoolFileQueryDto,
  ) {
    const userId = request.user.sub;
    const result = await this.poolFileService.getUserPoolFiles(userId, poolFileQueryDto);

    return {
      statusCode: HttpStatus.OK,
      message: 'User pool files retrieved successfully',
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Get All Pool Files',
    description: 'Get all pool files with pagination',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
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
    summary: 'Delete Pool File and Uploaded File',
    description:
      'Delete both the pool file record and the actual uploaded file from storage',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePoolFileAndUpload(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user.sub;
    await this.poolFileService.deletePoolFile(id, userId);

    return;
  }
}
