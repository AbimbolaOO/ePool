import { structurePaginatedData } from 'src/utils/helper/structurePaginatedData';
import { Repository } from 'typeorm';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ERROR_MESSAGES } from '../../enum/responses.enum';
import { CreatePoolFileDto } from '../dto/request/create-pool-file.dto';
import { PoolFileQueryDto } from '../dto/request/pool-file-query.dto';
import { UpdatePoolFileDto } from '../dto/request/update-pool-file.dto';
import { PoolFile } from '../entity/pool-file.entity';
import { PoolFolder } from '../entity/pool-folder.entity';

@Injectable()
export class PoolFileService {
    constructor(
        @InjectRepository(PoolFile)
        private poolFileRepository: Repository<PoolFile>,
        @InjectRepository(PoolFolder)
        private poolFolderRepository: Repository<PoolFolder>,
    ) {}

    async createPoolFile(createPoolFileDto: CreatePoolFileDto, poolFolderId: string, userId: string) {
        // Verify that the pool folder exists and user has access
        const poolFolder = await this.poolFolderRepository.findOne({
            where: { id: poolFolderId },
            relations: ['owner', 'members', 'members.user'],
        });

        if (!poolFolder) {
            throw new NotFoundException('Pool folder not found');
        }

        // Check if user is owner or member
        const isOwner = poolFolder.owner.id === userId;
        const isMember = poolFolder.members.some(member => member.user.id === userId);

        if (!isOwner && !isMember) {
            throw new BadRequestException('You do not have access to this pool folder');
        }

        // Check if pool folder already has a file
        if (poolFolder.file) {
            throw new BadRequestException('Pool folder already has a file. Update the existing file instead.');
        }

        const poolFile = this.poolFileRepository.create({
            ...createPoolFileDto,
            poolFolder: poolFolder,
        });

        return await this.poolFileRepository.save(poolFile);
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

    async getUserPoolFiles(userId: string) {
        const poolFiles = await this.poolFileRepository.find({
            where: { poolFolder: { owner: { id: userId } } },
            relations: ['poolFolder', 'poolFolder.owner'],
            order: { createdAt: 'DESC' },
        });

        return poolFiles;
    }

    async updatePoolFile(id: string, updatePoolFileDto: UpdatePoolFileDto, userId: string) {
        const poolFile = await this.poolFileRepository.findOne({
            where: { id },
            relations: ['poolFolder', 'poolFolder.owner', 'poolFolder.members', 'poolFolder.members.user'],
        });

        if (!poolFile) {
            throw new NotFoundException('Pool file not found');
        }

        // Check if user is owner or member with owner privileges
        const isOwner = poolFile.poolFolder.owner.id === userId;
        const isOwnerMember = poolFile.poolFolder.members.some(
            member => member.user.id === userId && member.isOwner
        );

        if (!isOwner && !isOwnerMember) {
            throw new BadRequestException('You do not have permission to update this pool file');
        }

        Object.assign(poolFile, updatePoolFileDto);
        return await this.poolFileRepository.save(poolFile);
    }

    async deletePoolFile(id: string, userId: string) {
        const poolFile = await this.poolFileRepository.findOne({
            where: { id },
            relations: ['poolFolder', 'poolFolder.owner', 'poolFolder.members', 'poolFolder.members.user'],
        });

        if (!poolFile) {
            throw new NotFoundException('Pool file not found');
        }

        // Check if user is owner or member with owner privileges
        const isOwner = poolFile.poolFolder.owner.id === userId;
        const isOwnerMember = poolFile.poolFolder.members.some(
            member => member.user.id === userId && member.isOwner
        );

        if (!isOwner && !isOwnerMember) {
            throw new BadRequestException('You do not have permission to delete this pool file');
        }

        await this.poolFileRepository.remove(poolFile);

        return { message: 'Pool file deleted successfully' };
    }
}
