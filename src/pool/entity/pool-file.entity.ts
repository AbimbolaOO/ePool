import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PoolFolder } from './pool-folder.entity';

@Entity('pool_file')
export class PoolFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  url: string;

  @Column()
  size: number;

  @Column()
  aspectRatioW: number;

  @Column()
  aspectRatioH: number;

  @Column()
  mimetype: string;

  @ManyToOne(() => PoolFolder, (poolFolder) => poolFolder.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  poolFolder: PoolFolder;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
