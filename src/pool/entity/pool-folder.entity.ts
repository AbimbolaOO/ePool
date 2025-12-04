import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../auth/entity/user.entity';
import { PoolFile } from './pool-file.entity';
import { PoolMember } from './pool-member.entity';

@Entity('pool_folder')
export class PoolFolder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.poolFolders, { onDelete: 'CASCADE' })
  @JoinColumn()
  owner: User;

  @OneToMany(() => PoolMember, (poolMember) => poolMember.poolFolder, {
    cascade: true,
  })
  members: PoolMember[];

  @OneToMany(() => PoolFile, (poolFile) => poolFile.poolFolder, {
    cascade: true,
  })
  files: PoolFile[];

  @Column({ length: 64, nullable: true, default: null })
  name: string;

  @Column({ length: 4, nullable: true, default: null })
  linkCode: string;

  @CreateDateColumn()
  linkGeneratedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
