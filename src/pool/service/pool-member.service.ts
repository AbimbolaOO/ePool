import { structurePaginatedData } from 'src/utils/helper/structurePaginatedData';
import { Repository } from 'typeorm';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserService } from '../../auth/service/user.service';
import { CreatePoolMemberDto } from '../dto/request/create-pool-member.dto';
import { PoolMemberQueryDto } from '../dto/request/pool-member-query.dto';
import { UpdatePoolMemberDto } from '../dto/request/update-pool-member.dto';
import { PoolFolder } from '../entity/pool-folder.entity';
import { PoolMember } from '../entity/pool-member.entity';

@Injectable()
export class PoolMemberService {
    constructor(
        @InjectRepository(PoolMember)
        private poolMemberRepository: Repository<PoolMember>,
        @InjectRepository(PoolFolder)
        private poolFolderRepository: Repository<PoolFolder>,
        private userService: UserService,
    ) {}

    async createPoolMember(
        createPoolMemberDto: CreatePoolMemberDto,
        requestUserId: string,
        linkMode: boolean = false,
    ) {
        const { poolFolderId, userId, isOwner } = createPoolMemberDto;

        const poolFolder = await this.poolFolderRepository.findOne({
            where: { id: poolFolderId },
            relations: ['owner'],
        });

        if (!poolFolder) {
            throw new NotFoundException('Pool folder not found');
        }

        const isRequesterOwner = poolFolder.owner.id === requestUserId;

        if (!isRequesterOwner && !linkMode) {
            throw new BadRequestException(
                'You do not have permission to add members to this pool folder',
            );
        }

        const userToAdd = await this.userService.getById(userId);

        const existingMember = await this.poolMemberRepository.findOne({
            where: {
                poolFolder: { id: poolFolderId },
                user: { id: userId },
            },
        });

        if (existingMember) {
            throw new BadRequestException(
                'User is already a member of this pool folder',
            );
        }

        const poolMember = this.poolMemberRepository.create({
            poolFolder: poolFolder,
            user: userToAdd,
            isOwner: isOwner || false,
            invitedAt: new Date(),
        });

        return await this.poolMemberRepository.save(poolMember);
    }

    async getPoolMemberById(id: string) {
        const poolMember = await this.poolMemberRepository.findOne({
            where: { id },
            relations: ['poolFolder', 'poolFolder.owner', 'user'],
        });

        if (!poolMember) {
            throw new NotFoundException('Pool member not found');
        }

        return poolMember;
    }

    async getAllPoolMembers(poolMemberQueryDto: PoolMemberQueryDto) {
        const { perPage: limit, page } = poolMemberQueryDto;
        const offset = page - 1;
        const skip = offset ? offset * limit : 0;

        const [poolMembers, total] = await this.poolMemberRepository.findAndCount({
            relations: ['poolFolder', 'poolFolder.owner', 'user'],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return structurePaginatedData(poolMembers, total, page, limit);
    }

    async getPoolMemberByFolder(poolFolderId: string, userId: string) {
        const poolMember = await this.poolMemberRepository.findOne({
            where: { poolFolder: { id: poolFolderId }, user: { id: userId } },
            relations: ['poolFolder']
        });

        if (!poolMember) {
            throw new NotFoundException('Pool folder not found');
        }

        return poolMember;
    }

    async getPoolMembersByFolder(poolFolderId: string, userId: string, poolMemberQueryDto: PoolMemberQueryDto) {
        const poolFolder = await this.poolFolderRepository.findOne({
            where: { id: poolFolderId },
            relations: ['owner', 'members', 'members.user'],
        });

        if (!poolFolder) {
            throw new NotFoundException('Pool folder not found');
        }

        const isOwner = poolFolder.owner.id === userId;
        const isMember = poolFolder.members.some(
            (member) => member.user.id === userId,
        );

        if (!isOwner && !isMember) {
            throw new BadRequestException(
                'You do not have access to this pool folder',
            );
        }

        const { perPage: limit, page } = poolMemberQueryDto;
        const offset = page - 1;
        const skip = offset ? offset * limit : 0;

        const [poolMembers, total] = await this.poolMemberRepository.findAndCount({
            where: { poolFolder: { id: poolFolderId } },
            relations: ['user', 'poolFolder'],
            skip,
            take: limit,
            order: { createdAt: 'ASC' },
        });

        return structurePaginatedData(poolMembers, total, page, limit);
    }

    async getUserPoolMemberships(userId: string, poolMemberQueryDto: PoolMemberQueryDto) {
        const { perPage: limit, page } = poolMemberQueryDto;
        const offset = page - 1;
        const skip = offset ? offset * limit : 0;

        const [poolMemberships, total] = await this.poolMemberRepository.findAndCount({
            where: { user: { id: userId } },
            relations: ['poolFolder', 'poolFolder.owner'],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return structurePaginatedData(poolMemberships, total, page, limit);
    }

    async updatePoolMember(
        id: string,
        updatePoolMemberDto: UpdatePoolMemberDto,
        requestUserId: string,
    ) {
        const poolMember = await this.poolMemberRepository.findOne({
            where: { id },
            relations: [
                'poolFolder',
                'poolFolder.owner',
                'poolFolder.members',
                'poolFolder.members.user',
                'user',
            ],
        });

        if (!poolMember) {
            throw new NotFoundException('Pool member not found');
        }

        // Check if requesting user is owner or member with owner privileges
        const isRequesterOwner = poolMember.poolFolder.owner.id === requestUserId;
        const isRequesterOwnerMember = poolMember.poolFolder.members.some(
            (member) => member.user.id === requestUserId && member.isOwner,
        );

        if (!isRequesterOwner && !isRequesterOwnerMember) {
            throw new BadRequestException(
                'You do not have permission to update this pool member',
            );
        }

        Object.assign(poolMember, updatePoolMemberDto);
        return await this.poolMemberRepository.save(poolMember);
    }

    async deletePoolMember(id: string, requestUserId: string) {
        const poolMember = await this.poolMemberRepository.findOne({
            where: { id },
            relations: [
                'poolFolder',
                'poolFolder.owner',
                'poolFolder.members',
                'poolFolder.members.user',
                'user',
            ],
        });

        if (!poolMember) {
            throw new NotFoundException('Pool member not found');
        }

        // Check if requesting user is owner or member with owner privileges or the member themselves
        const isRequesterOwner = poolMember.poolFolder.owner.id === requestUserId;
        const isRequesterOwnerMember = poolMember.poolFolder.members.some(
            (member) => member.user.id === requestUserId && member.isOwner,
        );
        const isRequesterTheMember = poolMember.user.id === requestUserId;

        if (!isRequesterOwner && !isRequesterOwnerMember && !isRequesterTheMember) {
            throw new BadRequestException(
                'You do not have permission to remove this pool member',
            );
        }

        await this.poolMemberRepository.remove(poolMember);

        return { message: 'Pool member removed successfully' };
    }
}
