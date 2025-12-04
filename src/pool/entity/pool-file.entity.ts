import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
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

  @OneToOne(() => PoolFolder, (poolFolder) => poolFolder.file, {
    onDelete: 'CASCADE',
  })
  poolFolder: PoolFolder;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
