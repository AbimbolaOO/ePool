import { DigitalOceanSpacesService, FileUploadResult } from 'src/digital-ocean-spaces';
import { structurePaginatedData } from 'src/utils/helper/structurePaginatedData';
import { calculateAspectRatio } from 'src/utils/utils';
import { Repository } from 'typeorm';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreatePoolFileDto } from '../dto/request/create-pool-file.dto';
import { PoolFileQueryDto } from '../dto/request/pool-file-query.dto';
import { PoolFile } from '../entity/pool-file.entity';
import { PoolMemberService } from './pool-member.service';

@Injectable()
export class PoolFileService {
  constructor(
    @InjectRepository(PoolFile)
    private poolFileRepository: Repository<PoolFile>,
    private poolMemberService: PoolMemberService,
    private readonly spacesService: DigitalOceanSpacesService,
  ) {}

  async createPoolFile(
    poolFolderId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    const verifyPoolMember = await this.poolMemberService.getPoolMemberByFolder(
      poolFolderId,
      userId,
    );
    let uploadResult: FileUploadResult | null = null;

    try {
      uploadResult = await this.spacesService.uploadFile(file, {
        folderName: `${poolFolderId}`,
        makePublic: true,
      });

      const { aspectRatio, aspectRatioW, aspectRatioH } = await calculateAspectRatio(file);

      const createPoolFileDto: CreatePoolFileDto = {
        filename: file.originalname,
        url: uploadResult.url,
        size: file.size,
        aspectRatio,
        aspectRatioW,
        aspectRatioH,
        mimetype: file.mimetype,
      };

      const poolFile = this.poolFileRepository.create({
        ...createPoolFileDto,
        poolFolder: verifyPoolMember.poolFolder,
      });

      await this.poolFileRepository.save(poolFile);

      return {
        data: {
          poolFile,
          upload: uploadResult,
        },
      };
    } catch (error) {
      if (error.message?.includes('pool') && file) {
        try {
          await this.spacesService.deleteFile(uploadResult?.url, {
            suppressErrors: true,
          });
        } catch (cleanupError) {
          console.warn('Failed to cleanup uploaded file:', cleanupError);
        }
      }
      throw error;
    }
  }

  async getPoolFileById(id: string) {
    const poolFile = await this.poolFileRepository.findOne({
      where: { id },
      relations: ['poolFolder', 'poolFolder.owner'],
    });

    if (!poolFile) {
      throw new NotFoundException('Pool file not found');
    }

    return poolFile;
  }

  async getAllPoolFiles(poolFileQueryDto: PoolFileQueryDto) {
    const { perPage: limit, page } = poolFileQueryDto;
    const offset = page - 1;
    const skip = offset ? offset * limit : 0;

    const [poolFiles, total] = await this.poolFileRepository.findAndCount({
      relations: ['poolFolder', 'poolFolder.owner'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return structurePaginatedData(poolFiles, total, page, limit);
  }

  async getUserPoolFiles(userId: string, poolFileQueryDto: PoolFileQueryDto) {
    const { perPage: limit, page } = poolFileQueryDto;
    const offset = page - 1;
    const skip = offset ? offset * limit : 0;

    const [poolFiles, total] = await this.poolFileRepository.findAndCount({
      where: { poolFolder: { owner: { id: userId } } },
      relations: ['poolFolder', 'poolFolder.owner'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return structurePaginatedData(poolFiles, total, page, limit);
  }

  async deletePoolFile(id: string, userId: string) {
    const poolFile = await this.poolFileRepository.findOne({
      where: { id },
      relations: ['poolFolder', 'poolFolder.owner'],
    });

    if (!poolFile) {
      throw new NotFoundException('Pool file not found');
    }

    const isOwner = poolFile.poolFolder.owner.id === userId;

    if (!isOwner) {
      throw new BadRequestException(
        'You do not have permission to delete this pool file',
      );
    }

    await this.poolFileRepository.remove(poolFile);

    await this.spacesService.deleteFile(poolFile.url, {
      suppressErrors: true,
    });

    return { message: 'Pool file deleted successfully' };
  }
}
