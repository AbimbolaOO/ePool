import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { User } from '../../auth/entity/user.entity';
import { PoolFolder } from './pool-folder.entity';

@Entity("pool_member")
export class PoolMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => PoolFolder, poolFolder => poolFolder.members, { onDelete: 'CASCADE' })
    @JoinColumn()
    poolFolder: PoolFolder;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    @Column({ default: false })
    isOwner: boolean;

    @Column({ default: () => 'NOW()' })
    invitedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
