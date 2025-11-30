import { structurePaginatedData } from 'src/utils/helper/structurePaginatedData';
import { Repository } from 'typeorm';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../../auth/entity/user.entity';
import { ERROR_MESSAGES } from '../../enum/responses.enum';
import { CreatePoolMemberDto } from '../dto/create-pool-member.dto';
import { PoolMemberQueryDto } from '../dto/pool-member-query.dto';
import { UpdatePoolMemberDto } from '../dto/update-pool-member.dto';
import { PoolFolder } from '../entity/pool-folder.entity';
import { PoolMember } from '../entity/pool-member.entity';

@Injectable()
export class PoolMemberService {
    constructor(
        @InjectRepository(PoolMember)
        private poolMemberRepository: Repository<PoolMember>,
        @InjectRepository(PoolFolder)
        private poolFolderRepository: Repository<PoolFolder>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async createPoolMember(createPoolMemberDto: CreatePoolMemberDto, requestUserId: string) {
        const { poolFolderId, userId, isOwner } = createPoolMemberDto;

        // Verify that the pool folder exists
        const poolFolder = await this.poolFolderRepository.findOne({
            where: { id: poolFolderId },
            relations: ['owner', 'members', 'members.user'],
        });

        if (!poolFolder) {
            throw new NotFoundException('Pool folder not found');
        }

        // Check if requesting user is owner or member with owner privileges
        const isRequesterOwner = poolFolder.owner.id === requestUserId;
        const isRequesterOwnerMember = poolFolder.members.some(
            member => member.user.id === requestUserId && member.isOwner
        );

        if (!isRequesterOwner && !isRequesterOwnerMember) {
            throw new BadRequestException('You do not have permission to add members to this pool folder');
        }

        // Verify that the user to be added exists
        const userToAdd = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!userToAdd) {
            throw new NotFoundException('User not found');
        }

        // Check if user is already a member
        const existingMember = await this.poolMemberRepository.findOne({
            where: {
                poolFolder: { id: poolFolderId },
                user: { id: userId },
            },
        });

        if (existingMember) {
            throw new BadRequestException('User is already a member of this pool folder');
        }

        // Create pool member
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

    async getPoolMembersByFolder(poolFolderId: string, userId: string) {
        // Verify user has access to this pool folder
        const poolFolder = await this.poolFolderRepository.findOne({
            where: { id: poolFolderId },
            relations: ['owner', 'members', 'members.user'],
        });

        if (!poolFolder) {
            throw new NotFoundException('Pool folder not found');
        }

        const isOwner = poolFolder.owner.id === userId;
        const isMember = poolFolder.members.some(member => member.user.id === userId);

        if (!isOwner && !isMember) {
            throw new BadRequestException('You do not have access to this pool folder');
        }

        const poolMembers = await this.poolMemberRepository.find({
            where: { poolFolder: { id: poolFolderId } },
            relations: ['user', 'poolFolder'],
            order: { createdAt: 'ASC' },
        });

        return poolMembers;
    }

    async getUserPoolMemberships(userId: string) {
        const poolMemberships = await this.poolMemberRepository.find({
            where: { user: { id: userId } },
            relations: ['poolFolder', 'poolFolder.owner'],
            order: { createdAt: 'DESC' },
        });

        return poolMemberships;
    }

    async updatePoolMember(id: string, updatePoolMemberDto: UpdatePoolMemberDto, requestUserId: string) {
        const poolMember = await this.poolMemberRepository.findOne({
            where: { id },
            relations: ['poolFolder', 'poolFolder.owner', 'poolFolder.members', 'poolFolder.members.user', 'user'],
        });

        if (!poolMember) {
            throw new NotFoundException('Pool member not found');
        }

        // Check if requesting user is owner or member with owner privileges
        const isRequesterOwner = poolMember.poolFolder.owner.id === requestUserId;
        const isRequesterOwnerMember = poolMember.poolFolder.members.some(
            member => member.user.id === requestUserId && member.isOwner
        );

        if (!isRequesterOwner && !isRequesterOwnerMember) {
            throw new BadRequestException('You do not have permission to update this pool member');
        }

        Object.assign(poolMember, updatePoolMemberDto);
        return await this.poolMemberRepository.save(poolMember);
    }

    async deletePoolMember(id: string, requestUserId: string) {
        const poolMember = await this.poolMemberRepository.findOne({
            where: { id },
            relations: ['poolFolder', 'poolFolder.owner', 'poolFolder.members', 'poolFolder.members.user', 'user'],
        });

        if (!poolMember) {
            throw new NotFoundException('Pool member not found');
        }

        // Check if requesting user is owner or member with owner privileges or the member themselves
        const isRequesterOwner = poolMember.poolFolder.owner.id === requestUserId;
        const isRequesterOwnerMember = poolMember.poolFolder.members.some(
            member => member.user.id === requestUserId && member.isOwner
        );
        const isRequesterTheMember = poolMember.user.id === requestUserId;

        if (!isRequesterOwner && !isRequesterOwnerMember && !isRequesterTheMember) {
            throw new BadRequestException('You do not have permission to remove this pool member');
        }

        await this.poolMemberRepository.remove(poolMember);

        return { message: 'Pool member removed successfully' };
    }
}
