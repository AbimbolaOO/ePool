import { structurePaginatedData } from 'src/utils/helper/structurePaginatedData';
import { DataSource, Repository } from 'typeorm';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../../auth/entity/user.entity';
import { CreatePoolFolderDto } from '../dto/request/create-pool-folder.dto';
import { PoolFolderQueryDto } from '../dto/request/pool-folder-query.dto';
import { UpdatePoolFolderDto } from '../dto/request/update-pool-folder.dto';
import { PoolFolder } from '../entity/pool-folder.entity';
import { PoolMember } from '../entity/pool-member.entity';

@Injectable()
export class PoolFolderService {
    constructor(
        @InjectRepository(PoolFolder)
        private poolFolderRepository: Repository<PoolFolder>,
        @InjectRepository(PoolMember)
        private poolMemberRepository: Repository<PoolMember>,
        private dataSource: DataSource,
    ) {}

    async createPoolFolder(data: CreatePoolFolderDto, userId?: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let owner: User;
            owner = await queryRunner.manager.findOne(User, {
                where: { id: userId }
            });
            if (!owner) {
                throw new NotFoundException('User not found');
            }
            const poolFolder = queryRunner.manager.create(PoolFolder, { name: data.name, owner: owner });
            const savedPoolFolder = await queryRunner.manager.save(PoolFolder, poolFolder);

            const poolMember = queryRunner.manager.create(PoolMember, {
                poolFolder: savedPoolFolder,
                user: owner,
                isOwner: true,
                invitedAt: new Date(),
            });

            await queryRunner.manager.save(PoolMember, poolMember);

            await queryRunner.commitTransaction();

            return this.getPoolFolderById(savedPoolFolder.id, userId);

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getPoolFolderById(id: string, userId: string) {
        const poolFolder = await this.poolFolderRepository.findOne({
            where: { id, owner: { id: userId } },
            // relations: ['owner', 'members', 'file'],
        });

        if (!poolFolder) {
            throw new NotFoundException('Pool folder not found');
        }

        return poolFolder;
    }

    async getUserPoolFolders(userId: string) {
        return this.poolFolderRepository.find({
            where: { owner: { id: userId } },
            // relations: ['owner', 'members', 'members.user', 'file'],
            order: { createdAt: 'DESC' },
        });
    }

    async getPoolFoldersByUser(userId: string) {
        return this.poolMemberRepository.find({
            where: { user: { id: userId } },
            // relations: ['poolFolder', 'poolFolder.owner', 'poolFolder.file', 'user'],
            order: { createdAt: 'DESC' },
        });
    }

    async updatePoolFolder(id: string, updatePoolFolderDto: UpdatePoolFolderDto, userId?: string) {
        console.log('Updating pool folder:', id, updatePoolFolderDto);
        const poolFolder = await this.poolFolderRepository.findOne({ where: { id, owner: { id: userId } }, relations: ['owner'] });

        if (!poolFolder) {
            throw new NotFoundException('Pool folder not found');
        }

        if (userId && poolFolder?.owner?.id !== userId) {
            throw new BadRequestException('You do not have permission to update this pool folder');
        }

        Object.assign(poolFolder, updatePoolFolderDto);

        await this.poolFolderRepository.save(poolFolder);

        return updatePoolFolderDto;
    }

    async deletePoolFolder(id: string, userId?: string) {
        const poolFolder = await this.poolFolderRepository.findOne({ where: { id, owner: { id: userId } }, relations: ['owner'] });

        if (!poolFolder) {
            throw new NotFoundException('Pool folder not found');
        }

        if (userId && poolFolder.owner.id !== userId) {
            throw new BadRequestException('You do not have permission to delete this pool folder');
        }

        await this.poolFolderRepository.delete(poolFolder.id);

        return { message: 'Pool folder deleted successfully' };
    }

    async getAllPoolFolders(poolFolderQueryDto: PoolFolderQueryDto, userId?: string) {
        const { perPage: limit, page } = poolFolderQueryDto;
        const offset = page - 1;
        const skip = offset ? offset * limit : 0;

        const [poolFolders, total] = await this.poolFolderRepository.findAndCount({
            where: { owner: { id: userId } },
            // relations: ['owner', 'members', 'file'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return structurePaginatedData(poolFolders, total, page, limit);
    }
}
