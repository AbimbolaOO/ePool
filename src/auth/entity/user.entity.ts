import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { PoolFolder } from '../../pool/entity/pool-folder.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: null, length: 64 })
  @Unique(['username'])
  username: string;

  @Column()
  email: string;

  @Column({ default: null })
  firstName: string;

  @Column({ default: null })
  lastName: string;

  @Column({ default: null })
  gender: string;

  @Column({ default: null })
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isAnonymous: boolean;

  @Column({ default: false })
  isDeactivated: boolean;

  @OneToMany(
    (type) => PoolFolder,
    (poolFolder) => poolFolder.owner,
    {
      onDelete: 'CASCADE',
      // cascade: true, // ['insert']
    },
  )
  poolFolders: PoolFolder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
