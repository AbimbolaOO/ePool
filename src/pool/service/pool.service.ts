import { structurePaginatedData } from 'src/utils/helper/structurePaginatedData';
import { DataSource, Repository } from 'typeorm';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../../auth/entity/user.entity';
import { ERROR_MESSAGES } from '../../enum/responses.enum';
import { generateRandomByte } from '../../utils/utils';
import { CreatePoolFolderDto } from '../dto/create-pool-folder.dto';
import { PoolFolderQueryDto } from '../dto/pool-folder-query.dto';
import { UpdatePoolFolderDto } from '../dto/update-pool-folder.dto';
import { PoolFolder } from '../entity/pool-folder.entity';
import { PoolMember } from '../entity/pool-member.entity';

@Injectable()
export class PoolService {
    constructor(
        @InjectRepository(PoolFolder)
        private poolFolderRepository: Repository<PoolFolder>,
        @InjectRepository(PoolMember)
        private poolMemberRepository: Repository<PoolMember>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private dataSource: DataSource,
    ) {}

    async createPoolFolder(createPoolFolderDto: CreatePoolFolderDto, userId?: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let owner: User;

            if (userId) {
                // Authenticated user
                owner = await queryRunner.manager.findOne(User, {
                    where: { id: userId }
                });
                if (!owner) {
                    throw new NotFoundException('User not found');
                }
            } else {
                // Anonymous user - create account
                if (!createPoolFolderDto.email) {
                    throw new BadRequestException('Email is required for anonymous users');
                }

                // Check if user already exists
                const existingUser = await queryRunner.manager.findOne(User, {
                    where: { email: createPoolFolderDto.email }
                });

                if (existingUser) {
                    // If user exists but is anonymous, use that user
                    if (existingUser.isAnonymous) {
                        owner = existingUser;
                    } else {
                        throw new BadRequestException('User with this email already exists. Please sign in.');
                    }
                } else {
                    // Create new anonymous user
                    const newUser = queryRunner.manager.create(User, {
                        email: createPoolFolderDto.email,
                        firstName: createPoolFolderDto.firstName || null,
                        lastName: createPoolFolderDto.lastName || null,
                        username: `anonymous_${generateRandomByte(8)}`,
                        isAnonymous: true,
                        isVerified: false,
                        password: null,
                    });
                    owner = await queryRunner.manager.save(User, newUser);
                }
            }

            // Create pool folder
            const poolFolder = queryRunner.manager.create(PoolFolder, {
                name: createPoolFolderDto.name,
                owner: owner,
            });

            const savedPoolFolder = await queryRunner.manager.save(PoolFolder, poolFolder);

            // Create pool member entry for the owner
            const poolMember = queryRunner.manager.create(PoolMember, {
                poolFolder: savedPoolFolder,
                user: owner,
                isOwner: true,
                invitedAt: new Date(),
            });

            await queryRunner.manager.save(PoolMember, poolMember);

            await queryRunner.commitTransaction();

            // Fetch the complete pool folder with relations
            return this.getPoolFolderById(savedPoolFolder.id);

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getPoolFolderById(id: string) {
        const poolFolder = await this.poolFolderRepository.findOne({
            where: { id },
            relations: ['owner', 'members', 'members.user', 'file'],
        });

        if (!poolFolder) {
            throw new NotFoundException('Pool folder not found');
        }

        return poolFolder;
    }

    async getUserPoolFolders(userId: string) {
        return this.poolFolderRepository.find({
            where: { owner: { id: userId } },
            relations: ['owner', 'members', 'members.user', 'file'],
            order: { createdAt: 'DESC' },
        });
    }

    async getPoolFoldersByUser(userId: string) {
        return this.poolMemberRepository.find({
            where: { user: { id: userId } },
            relations: ['poolFolder', 'poolFolder.owner', 'poolFolder.file', 'user'],
            order: { createdAt: 'DESC' },
        });
    }

    async updatePoolFolder(id: string, updatePoolFolderDto: UpdatePoolFolderDto, userId?: string) {
        const poolFolder = await this.poolFolderRepository.findOne({
            where: { id },
            relations: ['owner', 'members', 'members.user'],
        });

        if (!poolFolder) {
            throw new NotFoundException('Pool folder not found');
        }

        // Check if user has permission to update
        if (userId && poolFolder.owner.id !== userId) {
            // Check if user is a member with owner privileges
            const memberAccess = poolFolder.members.find(
                member => member.user.id === userId && member.isOwner
            );
            if (!memberAccess) {
                throw new BadRequestException('You do not have permission to update this pool folder');
            }
        }

        // Update pool folder
        Object.assign(poolFolder, updatePoolFolderDto);
        await this.poolFolderRepository.save(poolFolder);

        return this.getPoolFolderById(id);
    }

    async deletePoolFolder(id: string, userId?: string) {
        const poolFolder = await this.poolFolderRepository.findOne({
            where: { id },
            relations: ['owner', 'members', 'members.user'],
        });

        if (!poolFolder) {
            throw new NotFoundException('Pool folder not found');
        }

        // Check if user has permission to delete
        if (userId && poolFolder.owner.id !== userId) {
            // Check if user is a member with owner privileges
            const memberAccess = poolFolder.members.find(
                member => member.user.id === userId && member.isOwner
            );
            if (!memberAccess) {
                throw new BadRequestException('You do not have permission to delete this pool folder');
            }
        }

        await this.poolFolderRepository.remove(poolFolder);
        return { message: 'Pool folder deleted successfully' };
    }

    async getAllPoolFolders(poolFolderQueryDto: PoolFolderQueryDto) {
        const { perPage: limit, page } = poolFolderQueryDto;
        const offset = page - 1;
        const skip = offset ? offset * limit : 0;

        const [poolFolders, total] = await this.poolFolderRepository.findAndCount({
            relations: ['owner', 'members', 'file'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return structurePaginatedData(poolFolders, total, page, limit);
    }
}
